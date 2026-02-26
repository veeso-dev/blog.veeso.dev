---
date: '2025-06-26 18:00:00'
slug: 'leaktracer-a-rust-allocator-to-trace-memory-allocations'
title: 'Leaktracer: A Rust allocator to trace memory allocations'
description: 'A simple allocator to help you find leaks and memory issues in your Rust applications'
author: 'veeso'
featured_image: featured.jpeg
category: rust-internals
reading_time: '11'
---

A few days ago, I had a memory issue in one of my Rust applications.

The application was huge, and for some reason the memory kept growing with hundreds of gigabytes of memory allocated, but I couldn't find the source of the leak.

Of course I know there are tools like `valgrind` or `heaptrack`, but I was actually expecting something to embed in my application and very easy to use to do that, since we can implement our own allocators in Rust.

Actually, there are some solutions, but they were too long to setup, or not really what I was looking for.

So I thought it would be a good idea to create a simple allocator that would be able to trace memory allocations and deallocations, and give the user the ability to dump the allocations to a file, and then analyze them.

## The idea behind Leaktracer

The idea was to create a simple allocator with the following features:

- Trace all memory allocations and deallocations.
- Give the freedom to the user on how to dump the allocations.
- Be extremely easy to integrate in an existing application, if possible with a single line of code.

## The implementation

### Defining the allocator

I started implementing Leaktracer by defining the allocator, called `LeaktracerAllocator`, which implements the `GlobalAlloc` trait. This trait is used to define a global allocator in Rust.

And this can be achieved very easily:

```rust

pub struct LeaktracerAllocator;

impl LeaktracerAllocator {
    pub const fn init() -> Self {
        LeaktracerAllocator
    }
}

unsafe impl GlobalAlloc for LeaktracerAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}

```

This is the basic structure of the allocator. The most important thing is that `init` must be a `const fn`, so it cannot allocate anything to the heap.

At this point we want to trace the allocations and deallocations.

At first we'll track just the total allocated memory.

```rust
pub struct LeaktracerAllocator {
    allocated: AtomicUsize,
}

impl LeaktracerAllocator {
    pub const fn init() -> Self {
        LeaktracerAllocator {
            allocated: AtomicUsize::new(0),
        }
    }

    /// Returns the total number of bytes allocated by the allocator up to this point.
    pub fn allocated(&self) -> usize {
        self.allocated.load(std::sync::atomic::Ordering::Relaxed)
    }
}

unsafe impl GlobalAlloc for LeaktracerAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let ptr = unsafe { System.alloc(layout) };
        if !ptr.is_null() {
            self.allocated.fetch_add(layout.size(), Ordering::Relaxed);
        }
        ptr
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) };
        self.allocated.fetch_sub(layout.size(), Ordering::Relaxed);
    }
}
```

And this is the first version of the allocator that tracks the total allocated memory.

The `init` method is still a `const fn`, because `AtomicUsize` is `const` compatible, and we can use it to track the total allocated memory.

### Track allocations by modules

What I want to achieve now is to track the allocations made by each module and function, so I can see where the memory is allocated and deallocated.

To do so we have to face 3 problems:

1. How to get the module and function name at runtime.
2. How do we store the allocations.
3. How can we prevent the allocator from recursively calling itself when we allocate memory for the allocations.

#### Preventing infinite recursion

Let's start with the 3rd problem, which is critical actually.

The issue is that if we allocate memory inside the `alloc` method, we will call the allocator again, which will lead to an **infinite recursion**; causing a stack overflow.

![recursion](./recursion.gif)

Also this would prevent us from correctly tracking the allocations, because we would also track the allocations made by the tracer itself.

The solution is quite easy, we can use a `Cell` in `thread_local` storage to store whether we are currently allocating memory for tracing or not.

```rust
thread_local! {
    static IN_ALLOC: Cell<bool> = const { Cell::new(false) };
}

impl LeaktracerAllocator {

  // ...

    /// Returns whether the allocation is an external allocation.
    ///
    /// With **external allocation**, we mean that the allocation is not requested by the allocator itself,
    /// but rather by the user of the allocator.
    ///
    /// This is determined by checking if the `IN_ALLOC` thread-local variable is set to `false`.
    fn is_external_allocation(&self) -> bool {
        !IN_ALLOC.get()
    }

    /// Enters the allocation context, marking that an allocation is being made.
    fn enter_alloc(&self) {
        IN_ALLOC.with(|cell| cell.set(true));
    }

    /// Exits the allocation context, marking that the allocation is done.
    fn exit_alloc(&self) {
        IN_ALLOC.with(|cell| cell.set(false));
    }

  // ...

}
```

At this point, inside of `alloc` and `dealloc` methods, we'll trace the allocations only if `is_external_allocation` returns `true`, meaning that the allocation is not made by the allocator itself.

```rust
unsafe impl GlobalAlloc for LeaktracerAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let ptr = unsafe { System.alloc(layout) };
        // if the allocation is not null AND the allocation is external, trace the allocation
        if !ptr.is_null() && self.is_external_allocation() {
            self.trace(layout, AllocOp::Alloc);
        }
        ptr
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        if !ptr.is_null() && self.is_external_allocation() {
            self.trace(layout, AllocOp::Dealloc);
        }
        unsafe { System.dealloc(ptr, layout) };
    }
}
```

And with this, we have solved the infinite recursion problem.

#### Getting the module and function name

In order to get the module and function name at runtime, we can use the `backtrace` crate, which provides a way to get the current stack trace and extract the module and function names from it.

Getting the caller module is quite easy actually, we can just do this:

```rust
let bt = backtrace::Backtrace::new();

let frame = backtrace
    .frames()
    .first()
    .and_then(|frame| frame.symbols().first())?;

let name_str = symbol.name().map(|name| format!("{name}"))?;
// we remove the last part of the name, which is usually a hash
let name_string = if let Some(pos) = name_str.rfind("::") {
    &name_str[..pos]
} else {
    &name_str
};
```

Although this is a good start, it actually is **TOTALLY USELESS**.

Why? Because it's not tracing the caller that we want to trace actually.

If for instance we have a function `foo` that calls `String::new()`, the caller will probably be something like `std::alloc::...`, which is not what we want to trace. We don't even want to trace `String::new`, we want `foo` to be the caller.

There's no way to do that if we don't specify the modules we want to trace. Indeed the amount of frames in the backtrace can be huge (especially when using `tokio`), and we want to find the last frame that matches one of the modules we are interested in.

So we'll have to provide a list of modules to the allocator, and it will use that list to **find the last frame that matches** one of the modules.

So I have created a `demangle.rs` file that contains the following code:

```rust
/// Get the name of a symbol from the demangled name table.
pub fn get_demangled_symbol(modules: &[&str]) -> &'static str {
    let bt = backtrace::Backtrace::new();
    let Some(caller) = get_symbol_from_backtrace(&bt, modules) else {
        return UNKNOWN;
    };

    symbol_name(caller).unwrap_or(UNKNOWN)
}

/// Get the symbol at a specific frame in the backtrace.
fn get_symbol_from_backtrace<'a>(
    backtrace: &'a backtrace::Backtrace,
    modules: &[&str],
) -> Option<&'a BacktraceSymbol> {
    // we need to find the LAST frame, whose name starts with one of the modules
    let frame = backtrace
        .frames()
        .iter()
        .enumerate()
        .find_map(|(index, frame)| {
            let symbol = frame.symbols().first()?;

            let name = symbol.name().map(|name| format!("{name}"))?;

            // ignore this call
            if IGNORE_LIST.iter().any(|ignore| name.starts_with(*ignore)) {
                return None;
            }

            if modules.iter().any(|module| name.starts_with(*module)) {
                Some(index)
            } else {
                None
            }
        })?;

    backtrace
        .frames()
        .get(frame)
        .and_then(|frame| frame.symbols().first())
}

/// Get the name of a symbol from a [`BacktraceSymbol`].
fn symbol_name(symbol: &BacktraceSymbol) -> Option<&'static str> {
    // get the name of the symbol except the last part `backtrace::b::h3777baf656cd0c35`
    let name_str = symbol.name().map(|name| format!("{name}"))?;

    let name_string = if let Some(pos) = name_str.rfind("::") {
        &name_str[..pos]
    } else {
        &name_str
    };

    // convert to static str
    Some(Box::leak(name_string.to_string().into_boxed_str()))
}
```

So we can now have the name of the caller module, and we can use it to trace the allocations.

#### Storing the allocations

Finally, we need to store the allocations in a way that allows us to analyze them later.

Unfortunately, here there's no way to use a `no_alloc` data structure, so we will have to use a `Mutex<HashMap<CallerName, Stats>>` to store the allocations.

So I have created `symbols.rs` which exposes the `SymbolTable` struct, which contains the symbols with their allocations.

```rust
/// A [`Symbol`] table.
///
/// Each [`Symbol`] is identified by the module name (e.g. `leaktracer::alloc`).
#[derive(Debug)]
pub struct SymbolTable {
    /// The modules that are being traced.
    modules: &'static [&'static str],
    symbols: HashMap<&'static str, Symbol>,
}

impl SymbolTable {
    /// Creates a new [`SymbolTable`] with the given size and modules.
    pub(crate) fn new(size: usize, modules: &'static [&'static str]) -> Self {
        Self {
            modules,
            symbols: HashMap::with_capacity(size),
        }
    }

    /// Iterates over the [`Symbol`]s in the table, with their names.
    pub fn iter(&self) -> impl Iterator<Item = (&&'static str, &Symbol)> {
        self.symbols.iter()
    }

    /// Gets a [`Symbol`] by its name.
    pub fn get(&self, name: &'static str) -> Option<&Symbol> {
        self.symbols.get(&name)
    }

    /// Increments the allocated bytes for a [`Symbol`].
    pub(crate) fn alloc(&mut self, bytes: usize) {
        let name = demangle::get_demangled_symbol(self.modules);

        // If the symbol does not exist, we create it with the given name.
        if !self.symbols.contains_key(&name) {
            self.insert(name);
        }

        let symbol = self.symbols.get_mut(name).expect("Symbol should exist");

        symbol
            .allocated
            .fetch_add(bytes, std::sync::atomic::Ordering::Relaxed);
        symbol
            .count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    /// Decrements the allocated bytes for a [`Symbol`].
    pub(crate) fn dealloc(&mut self, bytes: usize) {
        let name = demangle::get_demangled_symbol(self.modules);

        if let Some(symbol) = self.symbols.get_mut(name) {
            symbol
                .allocated
                .fetch_sub(bytes, std::sync::atomic::Ordering::Relaxed);
            symbol
                .count
                .fetch_sub(1, std::sync::atomic::Ordering::Relaxed);
        }
    }

    /// Inserts a new [`Symbol`] into the table.
    fn insert(&mut self, name: &'static str) {
        self.symbols.insert(
            name,
            Symbol {
                allocated: AtomicUsize::new(0),
                count: AtomicUsize::new(0),
            },
        );
    }
}

/// A slot in the symbol table.
#[derive(Debug)]
pub struct Symbol {
    /// Allocated bytes for this symbol.
    allocated: AtomicUsize,
    /// Allocation count for this symbol.
    count: AtomicUsize,
}

impl Symbol {
    /// Returns the number of bytes allocated for this symbol.
    pub fn allocated(&self) -> usize {
        self.allocated.load(std::sync::atomic::Ordering::Relaxed)
    }

    /// Returns the number of allocations for this symbol.
    pub fn count(&self) -> usize {
        self.count.load(std::sync::atomic::Ordering::Relaxed)
    }
}
```

The **SymbolTable** takes the list of modules to trace, which will be later supplied by the user, so he can decide exactly which modules he wants to trace.

### Finalizing the allocator

At this point we have everything we need to finalize the allocator.

We can just define the `trace` methods to trace the allocations to the symbol table:

```rust
    /// Traces the allocation, logging the layout of the allocation.
    fn trace_allocation(&self, layout: Layout, table: Option<&mut MutexGuard<SymbolTable>>) {
        // first increment the allocated bytes
        self.allocated
            .fetch_add(layout.size(), std::sync::atomic::Ordering::Relaxed);
        if let Some(table) = table {
            table.alloc(layout.size());
        }
    }

    /// Traces the deallocation, logging the layout of the deallocation.
    fn trace_deallocation(&self, layout: Layout, table: Option<&mut MutexGuard<SymbolTable>>) {
        // first decrement the allocated bytes
        self.allocated
            .fetch_sub(layout.size(), std::sync::atomic::Ordering::Relaxed);
        if let Some(table) = table {
            table.dealloc(layout.size());
        }
    }

    /// Traces the allocation or deallocation operation using the [`Layout`], depending on the [`AllocOp`] type.
    fn trace(&self, layout: Layout, op: AllocOp) {
        // lock symbol table to avoid deadlocks
        let mut lock = SYMBOL_TABLE.get().and_then(|table| table.lock().ok());

        self.enter_alloc();
        match op {
            AllocOp::Alloc => self.trace_allocation(layout, lock.as_mut()),
            AllocOp::Dealloc => self.trace_deallocation(layout, lock.as_mut()),
        }
        self.exit_alloc();
        drop(lock);
    }
```

And finally we can provide a public API for the user to initialize the allocator and to access the symbol table:

```rust
/// Initializes the leak tracer with a symbol table of the given size.
///
/// Provide the modules to be traced as a slice of static strings.
/// Providing modules is necessary to filter out allocations that are not relevant to the user (such as from [`std`], [`tokio`], etc.).
pub fn init_symbol_table(modules: &'static [&'static str]) {
    SYMBOL_TABLE.get_or_init(|| Mutex::new(SymbolTable::new(DEFAULT_SYMBOL_TABLE_SIZE, modules)));
}

/// Provides a way to access the symbol table in a thread-safe manner.
///
/// Takes a closure `f` that receives a reference to the symbol table and returns a result.
pub fn with_symbol_table<F, R>(
    f: F,
) -> Result<R, PoisonError<std::sync::MutexGuard<'static, SymbolTable>>>
where
    F: FnOnce(&SymbolTable) -> R,
{
    // prevent allocations DURING lock acquisition
    IN_ALLOC.with(|cell| cell.set(true));

    let lock = match SYMBOL_TABLE
        .get()
        .expect("Symbol table not initialized")
        .lock()
    {
        Ok(lock) => lock,
        Err(poisoned) => {
            // free alloc
            IN_ALLOC.with(|cell| cell.set(false));
            // If the lock is poisoned, we return the poisoned error
            return Err(poisoned);
        }
    };

    let res = Ok(f(&lock));

    IN_ALLOC.with(|cell| cell.set(false));

    res
}
```

### Deadlocks

In the first version of the allocator, I realized that I wasn't preventing deadlocks when the user tries to access the symbol table while holding the lock. This could lead to deadlock, because if the user allocates anything while holding the lock, it will try to acquire the lock again, which will lead to a deadlock.

The solution is to set `IN_ALLOC` to `true` before acquiring the lock, and to set it back to `false` after releasing the lock; also
the mutex is locked for the entire duration of the `trace` method, to prevent `IN_ALLOC` is set to `false` while the user is still accessing the symbol table.

## Use Leaktracer in your application

Finally, to use Leaktracer in your application, you just need to add the following code:

```rust
use leaktracer::LeaktracerAllocator;

#[global_allocator]
static ALLOCATOR: LeaktracerAllocator = LeaktracerAllocator::init();

fn main() {
    leaktracer::init_symbol_table(&["my_app", "my_lib"]);

    leaktracer::with_symbol_table(|table| {
        for (name, symbol) in table.iter() {
            tracing::info!(
                "Symbol: {name}, Allocated: {}, Count: {}",
                symbol.allocated(),
                symbol.count()
            );
        }
    })?;
}

```

## Performance

It sucks, of course.

Really, the application it's extremely slow when using **Leaktracer**, but indeed it's meant for debugging only in extreme cases where you have no idea where the memory is leaked.

## Conclusion

I hope you never need to use leaktracer, but if you do, you can give it a try.

You can find the project on [GitHub](https://github.com/veeso/leaktracer).
