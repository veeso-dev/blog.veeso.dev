---
date: '2025-03-14 18:00:00'
slug: 'extending-future-in-rust'
title: 'Extending Future in Rust'
subtitle: 'Is it even a thing?'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
draft: false
tag: rust
---

## Introduction

On the line of my experiments with **Async Rust** (cuz I'm working on something big 🤞) and while writing my last article [Async Rust for Dummies](https://blog.veeso.dev/blog/en/async-rust-for-dummies/) a weird and sick thought came to my mind: **can we actually extend Future?**

### Extending a Trait

This may not be something that everybody knows, so I will quickly explain it, but yeah, in Rust you can **extend traits**. So given a trait defined for instance as:

```rust
trait MyTrait {
    type Item;
    fn my_fn(&self) -> Self::Item;
}
```

You can extend it like this:

```rust
trait MyTraitExt: MyTrait {
    fn my_fn_ext(&self) -> Self::Item {
        // ...
    }
}
```

So every implementor of `MyTraitExt` will have `my_fn` and `my_fn_ext` methods and it must implement both of course.

So if you have a struct `A` which only impl `MyTrait`, it won't impl `MyTraitExt`, but if you have `B` implementing `MyTraitExt`, it also have to implement `MyTrait`.

![extend](./extend.gif)

## Extending Future?

Okay, so now that we have the basics, we can actually try to give an answer to our question: can we extend **Future**?

First of all let's set up our experiment with a very basic runtime.

### Setup

So this is our initial setup. We just have a simple Async Runtime with just the `block_on` function which allows us to
execute futures:

```rust
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll, Wake};
use std::thread::Thread;

pub struct SimpleRuntime;

impl SimpleRuntime {
    pub fn block_on<F>(mut f: F) -> F::Output
    where
        F: Future,
    {
        let mut f = unsafe { Pin::new_unchecked(&mut f) };

        let thread = std::thread::current();
        let waker = Arc::new(SimpleWaker { thread }).into();
        let mut ctx = Context::from_waker(&waker);

        loop {
            println!("polling future");
            match f.as_mut().poll(&mut ctx) {
                Poll::Ready(val) => {
                    println!("future is ready");
                    return val;
                }
                Poll::Pending => {
                    std::thread::park();
                    println!("parked");
                }
            }
        }
    }
}

pub struct SimpleWaker {
    thread: Thread,
}

impl Wake for SimpleWaker {
    fn wake(self: std::sync::Arc<Self>) {
        self.thread.unpark();
    }
}
```

And we've got a Future which counts to a provided number:

```rust
use std::pin::Pin;
use std::sync::Arc;
use std::sync::atomic::AtomicU64;
use std::task::{Context, Poll};

pub struct Counter {
    pub counter: Arc<AtomicU64>,
    pub max: u64,
}

impl Future for Counter {
    type Output = u64;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        self.counter
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst);

        let value = self.counter.load(std::sync::atomic::Ordering::SeqCst);

        if value >= self.max {
            Poll::Ready(value)
        } else {
            // wake up the future
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}
```

And we run it in our main:

```rust
mod runtime;
mod task;

use std::sync::Arc;
use std::sync::atomic::AtomicU64;

use runtime::SimpleRuntime;
use task::Counter;

fn main() {
    SimpleRuntime::block_on(async_main());
}

async fn async_main() {
    let res = count(10).await;
    println!("async_main {res}");
}

fn count(max: u64) -> impl Future<Output = u64> {
    println!("counting to {max}");
    Counter {
        counter: Arc::new(AtomicU64::new(0)),
        max,
    }
}
```

### A task to extend

Now I'm gonna add a new async task, because I want to have two of them (we'll see why later). This task is called `Permute` and it's a simple task that permutes a list of numbers until it reaches a target list of numbers.

```rust
use std::pin::Pin;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};

/// A future that at each poll will advance in the permutation of a list of numbers.
///
/// Given a list of numbers, it permutates them until it reaches the target permutation.
///
/// Returns the amount of steps required
struct PermuteFuture {
    current: Arc<Mutex<Vec<u64>>>,
    target: Vec<u64>,
    steps: AtomicU64,
}

impl PermuteFuture {
    pub fn new(base: &[u64], target: &[u64]) -> Self {
        // ...
    }

    /// Execute one step of the permutation
    fn permute(&self) {
        // do permute ...

        self.steps.fetch_add(1, Ordering::Relaxed);
    }
}

impl Future for PermuteFuture {
    type Output = u64;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        self.permute();
        let current = self.current.lock().unwrap();

        if *current == self.target {
            Poll::Ready(self.steps.load(Ordering::Relaxed))
        } else {
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}

pub fn permute(base: &[u64], target: &[u64]) -> impl Future<Output = u64> {
    PermuteFuture::new(base, target)
}
```

And in our main we can then execute it as:

```rust
let permutations = SimpleRuntime::block_on(permute(&[1, 6, 4, 3, 2, 5], &[1, 2, 3, 4, 5, 6]));
println!("permutations: {permutations}");
```

Spoiler: it should print 3.

### Extending the Future

Now let's go at the core by implementing a `FutureExt` trait, which extends the `std::future::Future` trait with an `abort` method.

```rust
/// An extension of future which provides additional methods for working with futures.
pub trait FutureExt: Future {
    /// Abort the future.
    fn abort(&self);
}
```

### Implementing FutureExt for PermuteFuture

Now let's implement `FutureExt` for it:

```rust
impl FutureExt for PermuteFuture {
    fn abort(&self) {
        self.aborted.store(true, Ordering::Relaxed);
    }
}

impl Future for PermuteFuture {
    type Output = u64;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.aborted.load(Ordering::Relaxed) {
            return Poll::Ready(self.steps.load(Ordering::Relaxed));
        }
        // ...
    }
```

### Using FutureExt

But of course, we are not using `FutureExt` yet, because our Runtime is still using `Future`:

```rust
impl SimpleRuntime {
    pub fn block_on<F>(mut f: F) -> F::Output
    where
        F: FutureExt,
        // ...
```

And finally we change the `permute` function to use `FutureExt`:

```rust
pub fn permute(base: &[u64], target: &[u64]) -> impl FutureExt<Output = u64> {
    PermuteFuture::new(base, target)
}
```

But hey, we can't execute other async code now, which just uses `Future`:

```rust
SimpleRuntime::block_on(async_main());
// ^^^^
// the trait `FutureExt` is not implemented for `impl Future<Output = ()>`
```

So we need to fix **FutureExt** and **Future** interoperability now.

## Interoperability between Future and its extensions

There may be more than one way to actually achieve this, but the only that came to my mind was to create an **adapter trait** that will convert any `Future` into a `FutureExt`.

### Future Adapter

````rust
/// A trait for adapting a [`Future`] into a [`FutureExt`].
///
/// With this we can convert any [`Future`] into a [`FutureExt`] by calling the `adapt` method.
///
/// # Example
///
/// ```
/// use ext_fut::FutureAdapter;
/// use std::future::Future;
///
/// async fn foo() {}
///
/// let fut = foo().adapt();
/// ```
pub trait FutureAdapter: Future {
    fn adapt(self) -> impl FutureExt<Output = Self::Output>
    where
        Self: Sized,
    {
        FutureWrapper { inner: self }
    }
}

impl<F: Future> FutureAdapter for F {}

/// Internal struct which wraps a [`Future`] and implements [`FutureExt`].
struct FutureWrapper<F> {
    inner: F,
}

impl<F: Future> Future for FutureWrapper<F> {
    type Output = F::Output;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        unsafe { self.as_mut().map_unchecked_mut(|s| &mut s.inner) }.poll(cx)
    }
}
````

And now we can use it in our `SimpleRuntime`:

```rust
use self::ext_fut::FutureExt;
use self::runtime::SimpleRuntime;
use self::task::{count, permute};

fn main() {
    SimpleRuntime::block_on(async_main().adapt());
    let permutations = SimpleRuntime::block_on(permute(&[1, 6, 4, 3, 2, 5], &[1, 2, 3, 4, 5, 6]));
    println!("permutations: {permutations}");
}
```

And with that we can finally have the runtime to run **std Futures as well**.

## FutureExt in action

Of course, at the moment our `FutureExt` is doing nothing, but we can change our Runtime to actually use the `abort` method.

We can for example make it to call `abort()` whenever **ctrl+c is pressed**:

First of all we change our runtime to take an `AtomicBool` to abort:

```rust
pub struct SimpleRuntime {
    abort: Arc<AtomicBool>,
}

impl SimpleRuntime {
    pub fn new(abort: &Arc<AtomicBool>) -> Self {
        Self {
            abort: Arc::clone(abort),
        }
    }
```

And we change `block_on` to take `&self` and to abort in case it's true during future execution:

```rust
pub fn block_on<F>(&self, mut f: F) -> F::Output
where
    F: FutureExt,
{
    let mut f = unsafe { Pin::new_unchecked(&mut f) };

    let thread = std::thread::current();
    let waker = Arc::new(SimpleWaker { thread }).into();
    let mut ctx = Context::from_waker(&waker);

    loop {
        if self.abort.load(std::sync::atomic::Ordering::Relaxed) {
            println!("aborting future");
            f.abort();
        }

        println!("polling future");
        match f.as_mut().poll(&mut ctx) {
            Poll::Ready(val) => {
                println!("future is ready");
                return val;
            }
            Poll::Pending => {
                std::thread::park();
                println!("parked");
            }
        }
    }
}
```

Let's add the handler in our main:

```rust
fn main() {
    let abort = Arc::new(AtomicBool::new(false));
    let runtime = SimpleRuntime::new(&abort);

    // setup ctrlc to abort
    let abort_clone = Arc::clone(&abort);
    ctrlc::set_handler(move || {
        abort_clone.store(true, std::sync::atomic::Ordering::Relaxed);
    })
    .expect("Error setting Ctrl-C handler");

    runtime.block_on(async_main().adapt());
    let permutations = runtime.block_on(permute(&[1, 6, 4, 3, 2, 5], &[1, 2, 3, 4, 5, 6]));
    println!("permutations: {permutations}");
}
```

And finally I've added a `sleep` in our `PermuteFuture` to simulate a long running future, in order to manage to abort.

So, let's run it!

```txt
parked
polling future
^Ccurrent [1, 2, 3, 4, 6, 5], target [1, 2, 3, 4, 5, 6]
parked
aborting future
polling future
future is ready
permutations: 2
```

So after pressing ctrl+c, **it actually aborted the execution by calling abort() on the Future**. Cool!

## Conclusion

### Why would you extend Future?

![but-why](./but-why.gif)

That's an excellent question actually.

First of all I want to specify that is article **is very academic and experimental**, so I think it's okay if it's just something that could win an Ignobel prize; that means I'm not sure if it's actually useful or not.

Said so, I think that **it may have some cases** for instance when you want a **custom runtime** that needs to handle some futures in a specific way, or when you want to add some utility methods to futures.

But maybe now that I've showcased this, maybe some of you will come up with some cool ideas on how to use it 😅.

And that's it for today! I just hope I don't get nominated for the Ignobel prize because of this.

All the code is available on [GitHub](https://github.com/veeso/extending-future).
