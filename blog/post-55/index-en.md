---
date: '2026-03-02 11:00:00'
slug: 'from-ic-dbms-to-wasm-dbms'
title: 'From ic-dbms to wasm-dbms'
description: 'Untangling a database engine from the Internet Computer'
author: 'veeso'
featured_image: featured.jpeg
category: rust-projects
reading_time: '8'
---

This is an article about how I restructured a monolithic IC canister framework into a runtime-agnostic WASM database engine.

A few months ago I announced [ic-dbms](/blog/announcing-ic-dbms-0-1-0), a Rust framework for building database canisters on the Internet Computer. Since then, the project has grown significantly: JOINs, JSON filtering, custom data types, sanitizers, validators, and more.

For all this time I was quite happy with the project, but then when a couple of weeks ago I partecipated to the WASM workshop at RustNation '26, I realized that this project could have been much more than just an IC DBMS. I saw a future for it as the first truly portable WASM database engine, one that could run on any WASM runtime, not just the IC. I wanted to be able to run it on Wasmtime, Wasmer, or even in a browser.

I already knew that actually the coupling to the IC was pretty small. Basically only the canister API layer, the ACL implementation, and the memory provider were IC-specific. The core engine was mostly agnostic, but it was still tangled up with IC constructs.

So I decided to fix that. Version 0.6.0 is a full architectural restructuring that separates the runtime-agnostic engine from the IC-specific adapter. The project is now called **wasm-dbms**, and ic-dbms is just a thin layer on top.

Let me walk you through what changed and how I handled it.

## The Problem: a Monolithic Engine

Before the migration, the workspace had four crates:

```txt
crates/
  ic-dbms-api/          # Types, traits, values
  ic-dbms-canister/     # EVERYTHING else
  ic-dbms-client/       # Client libraries
  ic-dbms-macros/       # Procedural macros
```

See the issue? `ic-dbms-canister` was doing all the heavy lifting. Memory provider, memory manager, schema registry, table registry, the full DBMS engine, transactions, JOINs, integrity validators, ACL. Everything was crammed into a single crate, all coupled to IC-specific constructs.

The `MemoryProvider` trait existed, but it was private. The ACL was hardcoded to `Principal`. Transaction rollback relied on IC's trap semantics, where a panic reverts all stable memory changes. The `DbmsCanister` derive macro was a 400-line monster that generated both the database schema dispatch *and* the entire canister API in one shot.

## The New Architecture

The restructured workspace splits everything into two layers:

```txt
crates/
  wasm-dbms/                  # Generic WASM DBMS (runtime-agnostic)
    wasm-dbms-api/            # Types, traits, validators, sanitizers
    wasm-dbms-memory/         # Memory abstraction and page management
    wasm-dbms/                # Core DBMS engine
    wasm-dbms-macros/         # Macros: Encode, Table, CustomDataType, DatabaseSchema

  ic-dbms/                    # IC-specific thin adapter
    ic-dbms-api/              # Re-exports wasm-dbms-api + IC types
    ic-dbms-canister/         # IC canister adapter
    ic-dbms-client/           # Client libraries
    ic-dbms-macros/           # IC macros: DatabaseSchema, DbmsCanister
```

The dependency graph flows in one direction:

```txt
wasm-dbms-macros ← wasm-dbms-api ← wasm-dbms-memory ← wasm-dbms
                                                            ↑
ic-dbms-macros ← ic-dbms-canister ──────────────────────────┘
                      ↑
                 ic-dbms-client
```

**wasm-dbms** knows nothing about the Internet Computer. It doesn't know what a `Principal` is, it doesn't import `ic-cdk`, and it doesn't assume stable memory. It's just a database engine that speaks `MemoryProvider` and `AccessControl`.

**ic-dbms** is now a thin wrapper. It implements the two traits for the IC (`IcMemoryProvider` and `IcAccessControlList`), generates canister endpoints, and that's about it.

## Extracting the Engine

The core of the migration was pulling modules out of `ic-dbms-canister` and placing them into the right generic crate.

**wasm-dbms-memory** got the memory layer: `MemoryProvider` (now public), `HeapMemoryProvider` for testing, `MemoryManager`, `SchemaRegistry`, `TableRegistry`, page ledger, and free segments ledger. It also got the new `AccessControl` trait.

**wasm-dbms** got the database engine: CRUD operations, transaction system, JOIN engine, integrity validators. All of these now operate over generic `M: MemoryProvider` and `A: AccessControl` parameters instead of concrete IC types.

**wasm-dbms-api** got everything from `ic-dbms-api` that wasn't IC-specific: data types, `Value`, `Query`, `Filter`, the `Database` trait, sanitizers, validators. Candid support became an optional feature flag instead of being baked in.

What was left in `ic-dbms-canister`? Just the IC adapter: `IcMemoryProvider`, `IcAccessControlList`, the canister API layer, and a prelude that re-exports everything an IC developer needs. The `DbmsCanister` macro went from 404 lines to 182 - it now only generates canister endpoints, since schema dispatch is handled by a separate `#[derive(DatabaseSchema)]` macro.

## Making Rollback Runtime-Agnostic

This was the trickiest part. The old code used a clever (some would say cursed) trick: since IC reverts all stable memory changes when a canister **traps**, the transaction `commit()` method could just panic on error and the IC would clean up the mess.

That's elegant if you're on the IC. It's useless everywhere else.

The solution was a **write-ahead journal** in the database context

```rust
/// Active write-ahead journal for atomic operations.
pub(crate) journal: RefCell<Option<Journal>>,
```

When we enter the atomic context, which is used to wrap transactions execution to rollback in case of errors, we take the journal:

```rust
/// Executes a closure atomically using a write-ahead journal.
///
/// All writes performed inside `f` are recorded. On success the journal
/// is committed (entries discarded). On error the journal is rolled back,
/// restoring every modified byte to its pre-call state.
///
/// When a journal is already active (e.g., inside [`Database::commit`]),
/// this method delegates to the outer journal and does not manage its own.
///
/// # Panics
///
/// Panics if the rollback itself fails, because a failed rollback leaves
/// memory in an irrecoverably corrupt state (M-PANIC-ON-BUG).
fn atomic<F, R>(&self, f: F) -> DbmsResult<R>
where
    F: FnOnce(&WasmDbmsDatabase<'ctx, M, A>) -> DbmsResult<R>,
{
    let nested = self.ctx.journal.borrow().is_some();
    if !nested {
        *self.ctx.journal.borrow_mut() = Some(Journal::new());
    }
    match f(self) {
        Ok(res) => {
            if !nested && let Some(journal) = self.ctx.journal.borrow_mut().take() {
                journal.commit();
            }
            Ok(res)
        }
        Err(err) => {
            if !nested && let Some(journal) = self.ctx.journal.borrow_mut().take() {
                journal
                    .rollback(&mut self.ctx.mm.borrow_mut())
                    .expect("critical: failed to rollback journal");
            }
            Err(err)
        }
    }
}
```

Then whenever we perform a write to memory, we use a wrapper called `JournaledWriter` that intercepts the write and stores the original bytes in the journal before applying the change:

```rust
/// A wrapper that intercepts writes to record them in a [`Journal`]
/// before delegating to the underlying [`MemoryManager`].
pub struct JournaledWriter<'a, P>
where
    P: MemoryProvider,
{
    mm: &'a mut MemoryManager<P>,
    journal: &'a mut Journal,
}

impl<P> MemoryAccess for JournaledWriter<'_, P>
where
    P: MemoryProvider,
{
    // ...

    fn write_at<E>(&mut self, page: Page, offset: PageOffset, data: &E) -> MemoryResult<()>
    where
        E: Encode,
    {
        // Compute total write footprint including padding.
        let total_len = align_up::<E>(data.size() as usize);
        self.journal.record(self.mm, page, offset, total_len)?;
        self.mm.write_at(page, offset, data)
    }
}
```

When a journal is active, every write records the original bytes at that offset before overwriting them. If something goes wrong, the journal replays in reverse, restoring the original state byte by byte. No panics, no runtime-specific rollback semantics - just straightforward undo logging.

Transaction `commit()` now wraps all its operations in a single journal. Either everything succeeds and the journal is discarded, or something fails and every write is undone. True all-or-nothing atomicity, on any runtime.

## The AccessControl Trait

The old ACL was welded to `Principal`. Every method was `add_principal`, `remove_principal`, `allowed_principals`. Fine for IC, but a database engine shouldn't care what an "*identity*" looks like.

The new `AccessControl` trait uses an associated type:

```rust
pub trait AccessControl: Default {
    type Id;

    fn load<M>(mm: &MemoryManager<M>) -> MemoryResult<Self>
    where
        M: MemoryProvider,
        Self: Sized;
    fn is_allowed(&self, identity: &Self::Id) -> bool;
    fn add_identity<M>(
        &mut self, identity: Self::Id, mm: &mut MemoryManager<M>
    ) -> MemoryResult<()>
    where
        M: MemoryProvider;
    // ...
}
```

Three implementations ship with the library:

- `AccessControlList` - uses `Vec<u8>` as identity (raw bytes, runtime-agnostic)
- `IcAccessControlList` - wraps the above, presents `Principal` as the identity type
- `NoAccessControl` - identity is `()`, for runtimes that handle auth externally. Everything is a no-op.

The `A: AccessControl` parameter propagates through the entire engine: `DbmsContext<M, A>`, `WasmDbmsDatabase<'ctx, M, A>`, `DatabaseSchema<M, A>`, and down into integrity validators and the join engine. Default type parameters keep things ergonomic - you don't have to spell it out unless you need a custom implementation.

## DbmsContext: One State Container to Rule Them All

On the IC, the database state lived in four separate `thread_local!` statics: one for the memory manager, one for the schema registry, one for the ACL, and one for the transaction session. That pattern doesn't generalize well.

The new `DbmsContext<M, A>` bundles everything together:

```rust
pub struct DbmsContext<M, A = AccessControlList>
where
    M: MemoryProvider,
    A: AccessControl,
{
    mm: RefCell<MemoryManager<M>>,
    schema_registry: RefCell<SchemaRegistry>,
    acl: RefCell<A>,
    transaction_session: RefCell<TransactionSession>,
}
```

IC users still get their `thread_local!` - it just holds a single `DbmsContext<IcMemoryProvider, IcAccessControlList>` instead of four separate values. Non-IC users can instantiate `DbmsContext` however they want: stack-allocated, wrapped in an `Arc`, stored in a struct.

## Proof It Works: Wasmtime Example

Theory is nice. Shipping a working example is better.

The repository now includes a full WIT Component Model example that runs wasm-dbms on Wasmtime:

```wit
interface database {
    record query { /* ... */ }
    record insert-request { /* ... */ }

    select: func(table: string, query: query) -> result<list<list<record-entry>>, string>;
    insert: func(table: string, request: insert-request) -> result<_, string>;
    update: func(table: string, request: insert-request) -> result<u64, string>;
    delete: func(table: string) -> result<u64, string>;
    begin-transaction: func() -> u64;
    commit: func(tx-id: u64) -> result<_, string>;
    rollback: func(tx-id: u64) -> result<_, string>;
}
```

The guest crate implements this interface using `wasm-dbms` with a `FileMemoryProvider` (file-backed persistent storage) and `NoAccessControl`. The host binary loads the WASM component via Wasmtime and calls database operations through the WIT interface.

Same database engine, completely different runtime, zero IC dependencies. **That's the whole point.**

## The Breaking Changes

I want to be honest here: this migration was not painless. If you're upgrading from 0.5.x, here's what breaks:

- `Value::Principal` and `DataTypeKind::Principal` are gone. Use `#[custom_type]` on Principal fields instead.
- `DataTypeKind` no longer implements Candid traits. Use `CandidDataTypeKind` at API boundaries.
- ACL methods were renamed: `add_principal` → `add_identity`, `remove_principal` → `remove_identity`, `allowed_principals` → `allowed_identities`.
- `DbmsContext`, `WasmDbmsDatabase`, and `DatabaseSchema` gained a second generic parameter `A: AccessControl`.
- **Existing stable memory schemas are incompatible.** The removal of the Principal variant and addition of Custom variant in `DataTypeKind` changes type fingerprints.

That last one hurts the most. There's no automated migration path for existing data - this is a ground-up restructuring. But the project is still young enough that breaking things now is better than carrying IC-coupled debt forever.

## What's Next

The engine is free. It runs on the IC, it runs on Wasmtime, and it can run on anything that implements `MemoryProvider`. The next steps are indexes for faster queries, SQL parsing, and schema migrations for canister upgrades.

If you want to check it out, the repository has moved to [github.com/veeso/wasm-dbms](https://github.com/veeso/wasm-dbms). The [documentation](https://wasm-dbms.cc/) covers both the generic engine and the IC adapter.
