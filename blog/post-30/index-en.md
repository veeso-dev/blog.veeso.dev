---
date: '2025-03-11 18:00:00'
slug: 'async-rust-for-dummies'
title: 'Async Rust for Dummies'
subtitle: 'Let me show you how async Rust works under the hood'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## Introduction

Hello, Rustaceans! I'm quite sure many of you use async Rust every day in your projects, but do you actually know how it works under the hood? In this article I'm going to show you how async Rust works, explaining the Future trait, the Pin type, and the Context and Poll types. Let's get started!

> Aren't there like other thousands of articles like this?  
> Yes, but this one is mine.

## Why do we need async?

Basically we can say that **we need async when we are unable to know when that task finishes**, which usually means that our application is not directly responsible of taking care of it, **instead its execution depends on an external system or resource which may be subject to delays**.

Async, is good for at least these three cases:

- **I/O**: reading from and writing to the filesystem depends on the filesystem itself. Usually this doesn't have significant delays, but it's still something we don't have control of and so it's good for async. We schedule an I/O operation to the OS and we poll for it to finish.
- **Network**: any interaction with the network creates a lot of delays depending on many external resources. Just a HTTP GET request goes through several components that don't depend on our application. We ask the OS to create a socket for us, we write on the socket, the packet is enrouted from our gateway it goes through the entire internet and finally it reaches the HTTP server we want and that point it goes through the OS socket and finally it reaches the web server application which processes the request and finally it has to do everything backward (and trust me I've skipped many many steps). This creates tons of delays.
- **Time**: sometimes we ignore that, but time is async and can't be _resolved_ immediately. If we need to wait 5 seconds, we depend on an _external system_, which is the **Universe** I guess, so async is also good for that.

> 💡 About I/O: you may not know that, but **I/O is not always async actually**. For example on Linux, the async fs functions just make a select on the file system using libc. That's because Linux provides async IO with [uring](https://kernel.dk/io_uring.pdf), but it's too complex for everyday use, so we still rely on the ol' good libc.

Now that we have covered the basics, let's see how async Rust works.

## Running Async without Tokio

The first time you've encountered async code you may have tried to execute it directly inside a sync function, but it didn't work, because the compiler told you that you must be inside an async function to use the `await` keyword.

So what you did at that point was either wrapping everything in `tokio::main` or use `block_on` from the **futures** crate.

Actually, though, we can see that executing an async in a non-async context, is quite simple actually. Let's implement our simple `DumbRuntime`:

```rust
use std::pin::Pin;
use std::task::{Context, Poll, Waker};
use std::time::Duration;

/// A simple runtime to execute async code
pub struct DumbRuntime;

impl DumbRuntime {
    pub fn block_on<F>(mut f: F) -> F::Output
    where
        F: Future,
    {
        let mut f = unsafe { Pin::new_unchecked(&mut f) };

        let mut ctx = Context::from_waker(Waker::noop());

        loop {
            println!("polling future");
            match f.as_mut().poll(&mut ctx) {
                Poll::Ready(val) => {
                    println!("future is ready");
                    return val;
                }
                Poll::Pending => {
                    std::thread::sleep(Duration::from_micros(10)); // it should not even happen
                }
            }
        }
    }
}
```

So we want to have just a `block_on` function for now, which will be able to execute async functions inside a sync context.

You may be confused by this snippet, because it's quite different from what you're used to.

![huh](./huh.gif)

But what's going on there? Let's break it down:

1. First we have a `block_on` function that takes a mutable `Future` and returns its output.

   So what's a `Future` then? A `Future` is a trait that represents an asynchronous computation that may or may not be completed yet. It has a method called `poll` that takes a mutable `Context` and returns a `Poll` enum. The `Poll` enum can be either `Ready` or `Pending`. When it's `Ready`, it contains the value of the computation, otherwise it's `Pending` and it means that the computation is not done yet.

2. We create a `Pin` from the mutable reference of the future. A `Pin` is a type that is used to ensure that an object is not moved in memory, which is important for async code because the future must not be moved in memory while it's being executed, otherwise we could get a **Segmentation Fault** or other nasty bugs.
3. We create a `Context` from a `Waker`. A `Waker` is a type that is used to wake up a task when it's ready to be executed
4. We enter a loop where we poll the future. **If the future is ready, we return the value**, otherwise we sleep for 10 microseconds and poll again.

At this point we can execute async code in a sync context:

```rust
mod runtime;

use self::runtime::DumbRuntime;

fn main() {
    DumbRuntime::block_on(async_main());
}

async fn async_main() {
    println!("Hello, world!");
}

```

This will print `Hello, world!` once, and `polling future` and `future is ready` once, since we only have one future.

### What about nested async calls?

What if we add a nested async call?

```rust
mod runtime;

use self::runtime::DumbRuntime;

fn main() {
    DumbRuntime::block_on(async_main());
}

async fn async_main() {
    let res = async_fn().await;
    println!("Hello, world! {res}");
}

async fn async_fn() -> i32 {
    42
}
```

How many print of `polling future` will be printed before the program exits?

**Just one actually**, so how is the internal async function executed?

![math](./math.gif)

## How is async code executed?

To understand this we first need to understand what an async function is.

An `async` function is actually a syntax sugar for a function with this signature:

```rust
fn async_fn() -> impl Future<Output = i32> {
    std::future::ready(42)
}
```

So it's just a function that returns something that implements the `Future` trait.

As we've said before, the `Future` trait has a `poll` method that returns a `Poll` enum. When we call `await` on a future, we're actually calling the `poll` method on it.

This call is handled by our Runtime though, either tokio or our `DumbRuntime`, which will keep calling `poll` over the future until it's ready.

## Creating an async task

Indeed we can create a more interesting asynchronous task, instead of just returning `42`.

We want to create a Future which takes a `n: u64` and returns `Pending` `n - 1` times, and then `Ready`.

```rust
use std::pin::Pin;
use std::sync::Arc;
use std::sync::atomic::AtomicU64;
use std::task::{Context, Poll};

pub struct Counter {
    pub counter: Arc<AtomicU64>,
    max: u64,
}

impl Future for Counter {
    type Output = u64;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        self.counter
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst);

        let value = self.counter.load(std::sync::atomic::Ordering::SeqCst);
        println!("polled with current value: {value}");

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

So we can see that in order to have an async task, we can't use just a function, but we actually need a struct that implements the `Future` trait.

At this point we can implement the `Future` trait for it. In this case we have a `Counter` struct that has a `counter` field and a `max` field. The `poll` method will increment the counter and return `Ready` if the counter is greater than or equal to `max`, otherwise it will return `Pending`.

Of course **this still doesn't make sense for an async task**, because **we only need async for things that depend on external resources**, like I/O operations or timeouts.

At this point we can create our async function which executes the task:

```rust
fn count(to: u64) -> impl Future<Output = u64> {
    Counter { counter: Arc::new(AtomicU64::new(0)), max: to }
}
```

What it's quite curious, is that we return a struct, instead of a result, that's because our **runtime will call poll for us** when we call `.await` on it.

So is that all? Well, the basic concepts are these, but of course you may think that this runtime, as the name suggests, is quite dumb and much far from a real async runtime, like tokio.

So let's see how can we implement something more serious.

## Implementing a decent async runtime

There are basically three things a runtime must do:

1. spawning new tasks and returning a handle for it to get the result
2. a worker that will poll the tasks
3. a way to block on a future

First of all we need to define a **Task** struct which will hold the future and a sender to send the result back:

```rust
struct Task<T>
where
    T: Send,
{
    future: Pin<Box<dyn Future<Output = T> + Send>>,
    sender: SyncSender<T>,
}
```

Here `T` is the return type of the task

Then we define the runtime, which will have a sender to send tasks to the worker:

```rust
pub struct TaskRuntime<T>
where
    T: Send,
{
    sender: Sender<Task<T>>,
}
```

We define an handle to join for the result

```rust
pub struct TaskHandle<T>
where
    T: Send,
{
    receiver: Receiver<T>,
}

impl<T> TaskHandle<T>
where
    T: Send,
{
    pub fn join(self) -> T {
        self.receiver.recv().expect("failed to receive result")
    }
}
```

And finally we implement our task runtime

```rust
impl<T> TaskRuntime<T>
where
    T: Send + 'static,
{
    pub fn new() -> Self {
        let (sender, receiver) = channel();
        // run worker which will spawn tasks
        std::thread::spawn(move || Self::run(receiver));

        Self { sender }
    }

    /// Spawn a new task and get a [`TaskHandle`] to join the result
    pub fn spawn<F>(&mut self, f: F) -> TaskHandle<T>
    where
        F: Future<Output = T> + Send + 'static,
        T: Send,
    {
        let (result_sender, result_receiver) = sync_channel(1);

        let task = Task {
            future: Box::pin(f),
            sender: result_sender,
        };

        self.sender.send(task).expect("failed to spawn");

        TaskHandle {
            receiver: result_receiver,
        }
    }

    /// Block on a future and return the result
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

    /// Run the runtime internal worker.
    /// Everytime a task is received, spawn a new thread to run it
    fn run(receiver: Receiver<Task<T>>) {
        while let Ok(task) = receiver.recv() {
            std::thread::spawn(move || Self::run_task(task));
        }
    }

    /// Run a task awaiting for it to be ready and send the result back
    fn run_task(task: Task<T>) {
        let res = Self::block_on(task.future);
        task.sender.send(res).expect("failed to send result");
    }
}
```

Eventually we can spawn our async tasks and await for them to be ready

```rust
fn main() {
    let mut runtime = TaskRuntime::new();
    let handle_1 = runtime.spawn(async_fn());
    let handle2 = runtime.spawn(async_fn2());

    let res = handle_1.join();
    let res2 = handle2.join();

    println!("res: {res}");
    println!("res2: {res2}");
}

async fn async_fn() -> u64 {
    let res = count(10).await;
    println!("async_fn {res}");
    res
}

async fn async_fn2() -> u64 {
    let res = count(23).await;
    println!("async_fn2 {res}");
    res
}

fn count(max: u64) -> impl Future<Output = u64> {
    println!("count");
    Counter {
        counter: Arc::new(AtomicU64::new(0)),
        max,
    }
}
```

And that's it! We've implemented a simple async runtime that can execute async tasks.

There are still many features missing and currently **it's using a lot of threads of course**, also we cannot currently have **different return types for tasks**, but it's a good starting point to understand how async Rust works and I didn't want to make it too complex.

## Appendix

Let's add some final notes on two things that we've not covered yet: Context and Waker.

### Context

The `Context` type is used to pass information to the future when it's polled. It is just used to access to the `Waker` which can be used to wake the current task.

### Waker

A waker is a handle for waking up a task, notifying its executor that is ready to be run.

Indeed when `poll` is called, we receive the `Context` as an argument, and so we can access to `Waker` by using `ctx.waker()`.

The poll function should, in case of `Pending` is returned, wake up the task by calling `cx.waker().wake_by_ref()`, like we've done in our `Counter` struct.

That's because the runtime will keep calling `poll` until it returns `Ready`, and so we need to wake up the task when it's ready to be polled again, and it's the `Waker` that will do this job.

## Conclusion

I hope you've enjoyed this article and that you've learned something new about async Rust. This is actually an introduction to further deep dives into async Rust, and I hope you'll be able to understand better how async Rust works under the hood.
