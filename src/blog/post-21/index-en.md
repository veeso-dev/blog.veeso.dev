---
date: '2025-11-18 15:00:00'
slug: 'you-dont-always-need-async'
title: "You don't (*always*) need async"
subtitle: "But you can't live without it anymore"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
---

## We are too much into async, but we can't go back

You know what? **Async Rust is great**, but I also was relatively a **late adopter** of it, mainly because I've worked a lot on CLI tools before starting to work on server applications and web service, so I hadn't found async very useful for me for a very long time.

So there were two situations I've encountered in particular when working in that period on my simple CLI tools:

1. Sometimes you don't need async, but **you're forced to use it**
2. People asking `why isn't there async support for $PUT_YOUR_LIBRARY_NAME_HERE?` when there is absolutely no need for it

And I swear I've seen **MANY issues** like this opened on my open source projects

![why no async support kid meme](./why-no-async-kid.webp)

### What is Async actually?

Well, we all know that async is just something like this in Rust:

```rust
pub trait Future {
    type Output;

    // Required method
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

so we have this `Future` trait which can be awaited, and so every `async fn` can be written like this

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct AsyncSum {
    a: u64,
    b: u64,
}

impl Future for AsyncSum {
    type Output = u64;

    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(self.a + self.b)
    }
}

fn sum(a: u64, b: u64) -> impl Future<Output = u64> {
    AsyncSum { a, b }
}
```

and of course the `sum` function can eventually be written as

```rust
async fn sum(a: u64, b: u64) -> u64 {
    AsyncSum { a, b }.await
}
```

eventually we have basically just a function which returns something that implements `Future`, which of course is a type which implements the `poll` function. So to make this work, we'll need an **async runtime** (e.g. **tokio**) which will schedule task to run `poll` with a certain interval with a certain scheduling and make our `Future` to return.

There are plenty of articles and videos out there explaining this, but I'm not going to show it here, because it would take too long.

> 💡 If you need some background, this video from [Euro Rust '23](https://www.youtube.com/watch?v=id38OaSPioA) should explain it pretty well.

### Why do we even need async?

Of course you may point out that `async fn sum` isn't a great example of an async function, since it doesn't even require async. Indeed you're absolutely correct, it's quite pointless. So in what cases we actually require an async function?

Basically we can say that **we need async when we are unable to know when that task finishes**, which usually means that our application is not directly responsible of taking care of it, **instead its execution depends on an external system or resource which may be subject to delays**.

Of course `sum(1, 2)` doesn't depend on any external resource and our application is capable of resolving it immediately. Async though, is good for at least these three cases:

- **I/O**: reading from and writing to the filesystem depends on the filesystem itself. Usually this doesn't have significant delays, but it's still something we don't have control of and so it's good for async. We schedule an I/O operation to the OS and we poll for it to finish.
- **Network**: any interaction with the network creates a lot of delays depending on many external resources. Just a HTTP GET request goes through several components that don't depend on our application. We ask the OS to create a socket for us, we write on the socket, the packet is enrouted from our gateway it goes through the entire internet and finally it reaches the HTTP server we want and that point it goes through the OS socket and finally it reaches the web server application which processes the request and finally it has to do everything backward (and trust me I've skipped many many steps). This creates tons of delays.
- **Time**: sometimes we ignore that, but time is async and can't be _resolved_ immediately. If we need to wait 5 seconds, we depend on an _external system_, which is the **Universe** I guess, so async is also good for that.

So we could say that every time you need one of these three things you could go with an **async runtime**, but actually that's not always the case.

> 💡 About I/O: you may not know that, but **I/O is not always async actually**. For example on Linux, the async fs functions just make a select on the file system using libc. That's because Linux provides async IO with [uring](https://kernel.dk/io_uring.pdf), but it's too complex for everyday use, so we still rely on the ol' good libc.

### Sometimes async is just unnecessary

There are actually though many cases where we are using async, even if we don't actually need it.

I think we can divide this issue in two main cases:

#### We make use of an async-case, but it gives us no benefits

Probably every one of us has implemented one of these before. Have you ever implemented a simple CLI tool which just
sends an HTTP request, does something with those data and prints something out? Well I did.

And if you know the rust environment you probably know that the most famous HTTP library in Rust is [reqwest](https://docs.rs/reqwest/latest/reqwest/), which is **an async client**.

So, you're lazy and to make your application work, you decided to use `tokio` as the async runtime. What you don't know though, is that tokio in this case it's not only useless, but it's also bloating our binary with a ton of unnecessary dependencies.

Let's see this example:

```rust
#[tokio::main]
async fn main() {
    // just send a GET request to https://www.example.com
    let response = reqwest::get("https://www.example.com").await.unwrap();

    assert!(response.status().is_success());
}
```

The project has **114 dependencies** and the release binary has a size of `3.4MB`

On the other hand if we instead use `ureq` which is a simple sync HTTP library:

```rust
fn main() {
    // just send a GET request to https://www.example.com
    let response = ureq::get("https://www.example.com").call().unwrap();

    assert_eq!(response.status(), 200);
}
```

We've got **only 66 dependencies** and the binary weight is `2.4MB`, which is still a lot, but `1MB` free less.

So we often make use of async, but we eventually work in a single thread environment, which doesn't actually take advantage of the async runtime.

#### We can't always make use of async

...but we still use it because **we don't know what async is about**.

So I've seen several times issues like this on Rust projects:

![async lover asking for async support](./async-lover.webp)

so people asking for an async version of the library, because they are running it in an async project.

The issue is that this library wouldn't take any advantage of async, because it's a wrapper of [ratatui](https://docs.rs/ratatui/latest/ratatui/), which underneath writes on the terminal buffer, which is not an async operation, so **if there is not an async operation underneath, it doesn't make any sense to make our library async**.

And if I think about it, I quite often end up by writing an `async` function, which actually is not awaiting anything underneath. So especially when we work with a lot of async functions, **we end up by writing non-async async functions**, which may be an issue sometimes, because we're potentially breaking sync compatibility, with no reasons.

---

## Sometimes async is unnecessary, but you're forced to use it

A painful point with async Rust, is that maybe we know for sure we don't need async, because for instance we're writing a single-task CLI tool, but we're forced to use an async runtime, because we need a library which is async.

So we end up trying with `futures` to have a lightweight executor which just blocks on the promise, but unfortunately we've got a panic saying that the `tokio runtime could not be found`.

And eventually because of that, **we're forced to switch to tokio**, so in many cases we end up having a super complex infrastructure, for achieving a very simple task (See [Rube Goldberg machine](https://en.wikipedia.org/wiki/Rube_Goldberg_machine)).

![rube goldberg machine](./rube-goldberg-machine.gif)

The reasons behind that, is that **library are designed for enterprises, but are (also) used by tinkers**, which translates into: if I want to implement an FTP client, I will implement it preferrably thinking of a use case on a complex web service run by Microsoft instead of making it for a random guy uploading a File via FTP on a Raspberry from its terminal.

This problem leads to everyone adapting to the complex case in Rust, so nowadays everyone is running `Hello, World!` applications on a Tokio runtime configured to run with 32 processors.

---

## Conclusions: What can we do to mitigate and challenges

### Why is it hard to provide both sync and async versions

One of the main issues with libraries, is that **it's really hard for library authors to provide both a sync and an async version of the same library**. Currently my FTP library [suppaftp](https://github.com/veeso/suppaftp), provides both, but this consists in the duplication of the entire client. I know there are some macros out there which just translates everything into async (in a very rudimental and bad way though), but the issue is that **some things are just not compatible between the two**. Let's take this as example:

while on the sync client we have this type into the client:

```rust
/// A function that creates a new stream for the data connection in passive mode.
///
/// It takes a [`SocketAddr`] and returns a [`TcpStream`].
pub type PassiveStreamBuilder = dyn Fn(SocketAddr) -> FtpResult<TcpStream> + Send + Sync;
```

on the async client, to implement the same, we have to do it this way:

```rust
/// A function that creates a new stream for the data connection in passive mode.
///
/// It takes a [`SocketAddr`] and returns a [`TcpStream`].
pub type PassiveStreamBuilder = dyn Fn(SocketAddr) -> Pin<Box<dyn Future<Output = FtpResult<TcpStream>> + Send + Sync>>
    + Send
    + Sync;
```

Because of course it must implement `Future`, but at the same time when we work with async, we also need to `pin` the `box`.

So even if **95% of the code is the same**, there are still some **breaking change between the sync and the async client**.

Whenever I have to make a change to the library, I have to implement and test it, on both the clients, which is pretty annoying to be honest; so I get the point when maintainers just prefer to keep the async version eventually.

### The linter won't help us

A little help could also come from the linter and I'm actually surprised that currently `clippy` isn't warning about this.

But in case you write an async function, like this:

```rust
async fn sum(a: i32, b: i32) -> i32 {
  a + b
}
```

which is not awaiting anything, rust-analyzer (I think it's rust analyzer, but I'm not sure), is telling me the `async` is unnecessary and could be removed.

![unnecessary async lint](./unnecessary-async.webp)

On the other hand though, **clippy is happy with it and says nothing**, leading devs to **implement async functions even if they are completely unnecessary**. I think **clippy should actually raise an error** when encountering this unnecessary async functions to be honest. Maybe I will contribute directly to it (or if you know there is a rule which can be enabled to achieve this, please email me 🫶).

### What about Async std?

While writing this article I eventually came up with:

> _So we actually can't live anymore without async? So why is it even sync rust still a thing? Are we still even relying on Rust std or we're just relying on tokio?_

![thinking deep](./thinking-deep.gif)

Thinking deep, but actually this is somehow true. For certain aspects the relation between Tokio and Rust ended up being like **React** - for frontend - to **JavaScript** _(sorry VueJS/Angular persons)_, **Spring to Java**, **Rails to Ruby**, etc.

The difference with the other languages, is that with Rust this thing is becoming bigger and bigger, basically because **async** is everywhere, which means **tokio is everywhere**.

Whenever we want to implement a library with async functionalities we have to rely on `tokio::fs` or `tokio::net`, which has become the **standard** for async. So eventually we ended up with a monopoly of the async runtimes, because even if we want to use a different runtime, we always end up having tokio components as a dependency.

The problem with that is tokio is not part of the Rust foundation, so we don't know whether it will be supported in the future (personally I think tokio is immortal atm, but who knows), and what design decision they will make and what can we do about that.

So this makes me wonder: why don't we have an async version of `std` inside of `std`? That would make everything simpler. We wouldn't have to heavily rely on tokio and async would become a standard (_which currently is not_, `std` just provides `Future` and the `async` keyword).

I think there are two main reasons:

1. adding `async-fs`, `async-net` and `async-time` to `std` would create some identity issue in the Rust community about **whether sync Rust would still exist**.
2. Rust would become much harder to maintain, which also would lead to **longer times to stabilize APIs**.

But yeah, it's hard to tell what the future has for us. Personally I think async-std is a topic which is often avoided on purpose, but that we will eventually have to face and make a strong decision about whether or not to implement it.
