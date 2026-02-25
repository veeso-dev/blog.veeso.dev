---
date: '2025-12-06 13:05:00'
slug: 'should-we-get-rid-of-clippy-manual-try-fold'
title: 'Should we get rid of clippy::manual_try_fold?'
description: 'A discussion on the most dangerous lint in Clippy'
author: 'veeso'
featured_image: featured.jpeg
tag: rust
reading_time: '7'
---

> This is the 50th blog post on this blog! 🎉 Thank you everyone for reading my blog in the past 3 years!

## How I almost fucked up my code because of clippy

On the other day, I was implementing a function on my DBMS implementation for Internet Computer, and I needed to implement an overlay for the database when you are in a transaction context.

In order to provide the overlay, I implemented a method `patch_row`, which takes a row and applies all the operations made in the overlay.

Now the out record may be `None` or `Some(row)` with some changes applied and also, the state may change also from `Some` to `None` and back again to `Some`. Indeed if someone deletes a row and then re-inserts it in the same transaction, we want to see the new row.

To do that I wrote the following code:

```rust
/// Patches a row with the overlay changes.
///
/// The return may be [`None`] if the row has been deleted in the overlay.
pub fn patch_row(&self, row: Vec<(ColumnDef, Value)>) -> Option<Vec<(ColumnDef, Value)>> {
    // get primary key value
    let pk = row
        .iter()
        .find(|(col_def, _)| col_def.primary_key)
        .map(|(_, value)| value)
        .cloned()?;

    // apply all operations for this primary key to the row
    self.operations
        .iter()
        .filter(|op| op.primary_key_value() == &pk)
        .fold(Some(row), |acc, op| self.apply_operation(acc, op))
}
```

and `apply_operation` is defined as:

```rust
/// Applies a single [`Operation`] to a row.
fn apply_operation(
    &self,
    row: Option<Vec<(ColumnDef, Value)>>,
    op: &Operation,
) -> Option<Vec<(ColumnDef, Value)>> {
    match (row, op) {
        (_, Operation::Insert(_, record)) => Some(record.clone()), // it's definitely weird if we have `Some` row here, but just return the inserted record
        (_, Operation::Delete(_)) => None, // row is deleted; it would be weird to have `None` row here; just return None
        (None, Operation::Update(_, _)) => None, // trying to update a non-existing row; just return None
        (Some(mut existing_row), Operation::Update(_, updates)) => {
            for (col_name, new_value) in updates {
                if let Some((_, value)) = existing_row
                    .iter_mut()
                    .find(|(col_def, _)| col_def.name == col_name)
                {
                    *value = new_value.clone();
                }
            }
            Some(existing_row)
        }
    }
}
```

So as you can see, I am using `fold` to apply all the operations on the row, and inside of `apply_operation`, I am matching on the `Option` to see if the row is `Some` or `None`, and a `None` row may result in a `Some` output as well.

Now if you run Clippy on this code, you will get the following warning:

```txt
warning: usage of `Iterator::fold` on a type that implements `Try`
  --> src/main.rs:33:10
   |
33 |         .fold(Some(row), |acc, op| apply_operation(acc, op))
   |          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ help: use `try_fold` instead: `try_fold(row, |acc, op| ...)`
   |
   = help: for further information visit https://rust-lang.github.io/rust-clippy/rust-1.91.0/index.html#manual_try_fold
   = note: `#[warn(clippy::manual_try_fold)]` on by default
```

### Why it fucks up

If you follow the suggestion of Clippy and change `fold` to `try_fold`, you will get the following code:

```rust
self.operations
    .iter()
    .filter(|op| op.primary_key_value() == &pk)
    .try_fold(Some(row), |acc, op| self.apply_operation(acc, op))
```

But the behaviour is significantly different!

Instead while before we applied all the operations to the row, even when the row was `None`, now with `try_fold`, as soon as we get a `None` row, the folding stops and we return `None` immediately!

## Discussion

### It's a false positive - file it

You may think that this is a false positive and so it is just a bug in Clippy, so you can just file it.

The issue is that even if this is indeed a false positive, the position from clippy about that is basically

> Yes we know, but we think it's a great lint anyway, so ignore in case you want to keep using `fold`.

Indeed the [Lint docs](https://rust-lang.github.io/rust-clippy/rust-1.91.0/index.html#manual_try_fold) say:

> **What it does**
>
> Checks for usage of Iterator::fold with a type that implements Try.
>
> **Why is this bad?**
>
> The code should use `try_fold` instead, which short-circuits on failure, thus opening the door for additional optimizations not possible with fold as rustc can guarantee the function is never called on None, Err, etc., alleviating otherwise necessary checks. It’s also slightly more idiomatic
>
> **Known issues**
>
> This lint doesn’t take into account whether a function does something on the failure case, i.e., whether short-circuiting will affect behavior. Refactoring to try_fold is not desirable in those cases

So even filing a bug report will likely result in "we know, but we think it's a great lint anyway".

Of course it may be that in the future Clippy will be able to detect this case and not suggest `try_fold` when the closure does something on the failure case, but who knows when this will happen (not soon for sure).

### Should we get rid of this lint in the meantime?

In my opinion, yes, we should! And I want to explain you why.

1. **Clippy lints gets almost always copy-pasted.**

   And it's not a bad thing! 99% of the time Clippy suggestions are just great and you can just apply them without thinking too much.

   This is honestly the first time I see such a dangerous lint that can silently change the behaviour of your code.

   Of course you may argue that you could just implement tests to catch this kind of issues, and I agree with that. If I had applied this change blindly, my tests would have caught the issue. But what if the test didn't catch a case where the row was `None`? Then I would have shipped a broken code to production.

2. **Where it's causing more damage**

   Okay, this is a hot take, but hear me out. If you are using `fold` on a type that implements `Try`, you are likely misusing `fold` itself. Indeed if you are folding over a type that can fail, you should already be thinking about short-circuiting the computation when you get a failure/none.

   If you had a huge iterator, you would be wasting time applying operations on a `None` value that will be discarded anyway.

   I can honestly see more cases where people are trying to use fold and they want to consume all the items, than cases where you were expecting to short-circuit the computation.

   I don't get why someone would want to use `fold` with possible failure cases.

## Extra - Reproducible example

```rust
enum Operation {
    Insert(i64, Vec<(&'static str, i64)>), // (row_id, record)
    Delete(i64),                           // row_id
    Update(i64, Vec<(&'static str, i64)>), // (row_id, [(column_name, new_value)])
}

impl Operation {
    fn primary_key_value(&self) -> &i64 {
        match self {
            Operation::Insert(pk, _) => pk,
            Operation::Delete(pk) => pk,
            Operation::Update(pk, _) => pk,
        }
    }
}

fn patch_row(
    operations: &[Operation],
    primary_key: &'static str,
    row: Vec<(&'static str, i64)>,
) -> Option<Vec<(&'static str, i64)>> {
    // get primary key value
    let pk = row
        .iter()
        .find(|(col, _)| *col == primary_key)
        .map(|(_, value)| value)
        .cloned()?;

    // apply all operations for this primary key to the row
    operations
        .iter()
        .filter(|op| op.primary_key_value() == &pk)
        .fold(Some(row), |acc, op| apply_operation(acc, op))
}

/// Applies a single [`Operation`] to a row.
fn apply_operation(
    row: Option<Vec<(&'static str, i64)>>,
    op: &Operation,
) -> Option<Vec<(&'static str, i64)>> {
    match (row, op) {
        (_, Operation::Insert(_, record)) => Some(record.clone()), // it's definitely weird if we have `Some` row here, but just return the inserted record
        (_, Operation::Delete(_)) => None, // row is deleted; it would be weird to have `None` row here; just return None
        (None, Operation::Update(_, _)) => None, // trying to update a non-existing row; just return None
        (Some(mut existing_row), Operation::Update(_, updates)) => {
            for (col_name, new_value) in updates {
                if let Some((_, value)) = existing_row.iter_mut().find(|(col, _)| col == col_name) {
                    *value = *new_value;
                }
            }
            Some(existing_row)
        }
    }
}

fn main() {
    let ops = vec![
        Operation::Insert(24, vec![("a", 1), ("b", 2)]),
        Operation::Update(24, vec![("a", 3)]),
        Operation::Update(24, vec![("b", 5)]),
        Operation::Delete(24),
        Operation::Insert(24, vec![("a", 7), ("b", 8)]),
    ];
    let result = patch_row(&ops, "id", vec![("id", 24), ("a", 0), ("b", 0)]);
    println!("Final result: {:?}", result);
}
```

## Extra - Wait, but there is a bug actually

It's an interesting coincidence that while writing the reproducible example, I found a bug in clippy actually.

If you write this `.fold(Some(row), |acc, op| apply_operation(acc, op))` you get the warning, **BUT** if you write `.fold(Some(row), apply_operation)` you don't get the warning! It's not clear why this is happening, but it seems that clippy is not able to detect this case.

Also tbh, I've found some cases where I was unable to get the same warning even with the closure syntax, but just using slightly different code. So I don't know, this lint seems a bit buggy to me.
