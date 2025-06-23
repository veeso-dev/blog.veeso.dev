---
date: '2025-06-07 18:30:00'
slug: 'rust-on-a-diet'
title: 'Rust on a Diet'
subtitle: 'How cloning a Vec had caused memory bloat on the Solana Validator'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
draft: false
tag: rust
---

So if you don't know, I also develop on the Solana Validator (but please don't leave, it's about Rust and not blockchain things 😓) mostly mods for Solana RPC nodes, and recently a colleague of mine, sent me this Post on X.com, about a massive fixup on the Solana Validator, which claims to have pushed down the memory usage of the QUIC transport **from 2.6GB to 124MB**.

[![https://x.com/vadorovsky/status/1922274156185297394](./x-post.webp)](https://x.com/vadorovsky/status/1922274156185297394)

## How was this possible?

But how was this possible? Well, basically I've got to explain a bit of the context, so you can understand the problem.

Basically as you may know, validators process a lot of transactions, which are sent to them by the RPC nodes, and these transactions are sent over a QUIC transport, then the transactions are pushed into the pool of transactions, and then the validator processes them, and not just that, but often the transactions are even forwarded to the next validator which have to process them, and so on.

Up to now, transactions were stored as bytes in a `Vec<u8>`, and dispatched and sent all over around the modules and services.

The data stored into the `Vec<u8>` was actually immutable since the beginning, because we don't want the transactions to be modified of course, but everytime a transaction was used in a different context, it was cloned, causing everytime a lot of allocastions, and thus memory bloat.

Consider that validators process thousands of transactions per second, and the quantity of services and modules that use the transactions is quite large, so you can imagine how much memory was wasted by cloning the `Vec<u8>`. Also the lifetime of a transaction is very short, so the memory was not even reused, and thus the memory bloat was even worse.

Luckily a transaction is not huge, it's less than 1230 bytes at least, but considering the thousands of transactions processed per second, the memory usage was quite high.

Maybe youre'already thinking about the solution, and that this is a bad design, and you are right; but there are two things we can talk about here:

1. The solution of course.
2. Why nobody thought about it before.

So let's start with the solution.

## The solution

Probably there's not only solution here, some of them are quite obvious.

### Cow?

The first solution that comes to mind is to use a `Cow` (Clone on Write) type, which is a smart way to handle immutable data that can be cloned only when needed. This would allow us to avoid cloning the `Vec<u8>` unless we really need to modify it.

Want to know what's the issue? The Solana validator is using many many services all running in parallel in separate threads, and so we could just pass the `Cow` around like this:

```rust
use std::borrow::Cow;

fn main() {
    let bytes = &[0xca, 0xfe, 0xba, 0xbe];
    let cow: Cow<'_, Vec<u8>> = std::borrow::Cow::Owned(bytes.to_vec());

    // run a thread
    let cow_t: Cow<'_, Vec<u8>> = cow.clone(); // Borrow the Cow to use in the thread
    let join = std::thread::spawn(move || {
        let ptr_addr = cow_t.as_ptr();
        println!("Cow Thread: {cow_t:?}; underlying addr: {ptr_addr:p}",);
    });

    let ptr_addr = cow.as_ptr();

    println!("Cow: {cow:?}; underlying addr: {ptr_addr:p}",);

    join.join().unwrap();
}
```

Do you expect the adddresses to be the same? Well, they are not!

```txt
Cow: [202, 254, 186, 190]; underlying addr: 0x55fec55b9b10
Cow Thread: [202, 254, 186, 190]; underlying addr: 0x55fec55b9b30
```

Mhm, so just borrow right?

```rust
    let cow_t = cow.borrow(); // clone the Cow to move into the thread
```

We can't do that, because the compiler doesn't know exactly the lifetime of the `Cow`.

Then just use `scoped` threads, right?

```rust
use std::borrow::Cow;

fn main() {
    let bytes = &[0xca, 0xfe, 0xba, 0xbe];
    let cow: Cow<'_, Vec<u8>> = std::borrow::Cow::Owned(bytes.to_vec());

    // run a thread
    std::thread::scope(|_| {
        let ptr_addr = cow.as_ptr();
        println!("Cow Thread: {cow:?}; underlying addr: {ptr_addr:p}",);
    });

    let ptr_addr = cow.as_ptr();

    println!("Cow: {cow:?}; underlying addr: {ptr_addr:p}",);
}

```

Yes, indeed we've got the same address here of course, but we can't always rely on `scoped` threads, especially in the Solana ecosystem where we also pass many other data around.

And fun fact, if we could use `scoped` threads, we could just have used directly the `Vec<u8>` 😅.

### Arc Vec T

The second solution is to use an `Arc<Vec<u8>>`, which is a smart pointer that allows us to share ownership of the `Vec<u8>` across multiple threads. This would allow us to avoid cloning the `Vec<u8>` and thus avoid memory bloat.

The solution is solid and works, but there is even a better solution (which is the one used in the Solana Validator).

```rust
use std::sync::Arc;

fn main() {
    let bytes = &[0xca, 0xfe, 0xba, 0xbe];
    let bytes = Arc::new(bytes.to_vec());

    // run a thread
    let bytes_t = bytes.clone();
    let join = std::thread::spawn(move || {
        let ptr_addr = bytes_t.as_ptr();
        println!("Cow Thread: {bytes_t:?}; underlying addr: {ptr_addr:p}",);
    });

    let ptr_addr = bytes.as_ptr();

    println!("Cow: {bytes:?}; underlying addr: {ptr_addr:p}",);

    join.join().unwrap();
}
```

### Arc Slice T

EDIT: 23th June 2025

Actually, I've recently discovered that `Arc[T]` is actually much better than `Arc<Vec<T>>`.

Also it is generally better than `Vec` also when the data is not shared, but just for immutable data, because it avoids the overhead of the `Vec` type, which is not needed when we just need to share immutable data.

Why is it better:

- Extremely cheap clone with complexity `O(1)` since it just clones the pointer.
- Smaller stack size (16 bytes vs 24 bytes for `Vec` on 64-bit systems).
- Implements `Deref` to `T`, so you can use it as if it was a slice, without the need to dereference it.

Thank you [sgued@pouet.chapril.org](https://hachyderm.io/@sgued@pouet.chapril.org/114677223492950363) for pointing this out!

Also in case you don't need to share along threads, `Rc` should be preferred over `Arc`, since it is faster and has less overhead, but in this case, we need to share the data across threads, so `Arc` is the way to go.

In case you don't even need `Clone`, you can directly use a `Box<T>`, but it's not the case here.

For more details, you can watch the video [Use Arc Instead of Vec](https://www.youtube.com/watch?v=A4cKi7PTJSs).

### Bytes

The [Bytes crate](https://docs.rs/bytes/latest/bytes/) provides an efficient container for storing and operating on contiguous slices of memory, mainly focused on networking and I/O operations and it allows zero-copy operations, which is exactly what we need here.

So the solution used in the Solana Validator, was as soon as the transaction is received, it is wrapped into a `Bytes` type, and from there on, the `Bytes` is just copied around.

`Bytes` are cheaply clonable and thereby shareable, thanks to the way it works. Basically, whenever a `Bytes` instance is created, it saves the data in the memory and stores a pointer to it, so when we clone a `Bytes` instance, we just clone the pointer and not the data itself, which is why it is so efficient.

If your're a C/C++ developer, this may seem obvious as a solution, but in Rust, we often tend to use `Vec<u8>` for everything, and this is a great example of how using the right data structure can make a huge difference in terms of performance and memory usage.

For more details on how it handles the memory, you can check the [Bytes documentation](https://docs.rs/bytes/latest/bytes/).

## Why nobody thought about it before?

The most important thing is why nobody thought about it before, and in my opinion, there are many other cases like this, where we tend to ignore the right data structure to use, in order to avoid memory bloat and performance issues.

The main reason that probably involves here is that the Solana Validator has a huge codebase, so it may be hard to keep track of all the data structures used, but at the same time, I think it's because of a bias based on the fact that Solana Validators run on extremely powerful machines, so we tend to think that memory bloat is not a big issue, but in reality, it is.

If you give a look at the [requirements to run a Solana Validator](https://docs.anza.xyz/operations/requirements/), you can see the requirements are pretty high, and this is the case of plenty of other applications, which usually run on powerful servers.

I've started working on embedded systems, with 16MB of RAM, and at the time performance and memory usage were a big deal, but even now, sometimes, is easy to forget about it.

The point is that when we have to deal with thousands of clones per second, the impact on memory usage is huge.

### Rust makes it easy to forget?

Another issue in my opinion, is that as a Rust developer, we often are proned to think that Rust, since it's considered safe and performant, can **handle everything for us in the best way possible**, but it's not actually true.

Up to now, there's not a single programming language that can implement a perfect memory management, and Rust is not an exception. It's all up to us to implement efficient applications.

### Think more about shareability

After implementing the solution on my RPC node, the entire application performance has improved a lot, like it doubled for sure.

This has been a great lesson for me, to never forget about performance, even if running on powerful machines, and to always think about the right data structure to use, especially when dealing with shareable data.

We, Rust developers, have awesome types provided by the standard library, like `Cow`, `Arc`, `Rc`, and many others, but we often keep relying on `clone`, thinking that it won't be a big deal, but it is.

We should learn to avoid cloning as much as possible. Whenever we write `.clone()`, we should ask ourselves if we really need to clone the data, or if we can just share it; especially for data that is immutable, like transactions in this case.

It's time to put **Rust on a diet**, and avoid memory bloat as much as possible.

![the diet has begun](./rabbit-eating.gif)
