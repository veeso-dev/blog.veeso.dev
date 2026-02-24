---
date: '2025-07-28 18:10:00'
slug: 'can-you-move-a-copy-in-rust'
title: 'Can you move a Copy in Rust?'
subtitle: 'A dumb question, but a good one to ask'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## Introduction

This article came from a [question I saw on Reddit](https://www.reddit.com/r/rust/comments/1m9f3pr/can_you_move_an_integer_in_rust/), and it is a good one to ask, even if it seems dumb at first.

So we all know that Rust has a concept of ownership, and usually whenever a value is not passed by reference, it is moved.

So for instance, if we have a `String` and we pass it to a function, it is moved, and we cannot use it anymore in the original scope.

```rust
fn move_string(s: String) {
    println!("{s}");
}

fn main() {
    let s = "Hello, World!".to_string();
    move_string(s);

    println!("{s}");
}
```

```txt
    let s = "Hello, World!".to_string();
  |         - move occurs because `s` has type `String`, which does not implement the `Copy` trait
7 |     move_string(s);
  |                 - value moved here
8 |
9 |     println!("{s}");
  |               ^^^ value borrowed here after move

```

So, whenever we want to reuse the value, we have either to pass it by reference or clone it.

```rust
fn move_string(s: String) {
    println!("{s}");
    println!("Heap addr in move_string: 0x{:x}", s.as_ptr() as usize);
}

fn main() {
    let s = "Hello, World!".to_string();
    println!("Heap addr in main for s: 0x{:x}", s.as_ptr() as usize);
    move_string(s.clone());

    println!("{s}");
}
```

```txt
Heap addr in main for s: 0x62eaf2c44b10
Heap addr in move_string: 0x62eaf2c44b30
```

We can easily verify that the value is moved by checking the address of the string in the main function and in the `move_string` function.

```rust
fn move_string(s: String) {
    println!("{s}");
    println!("Heap addr in move_string: 0x{:x}", s.as_ptr() as usize);
}

fn main() {
    let s = "Hello, World!".to_string();
    println!("Heap addr in main for s: 0x{:x}", s.as_ptr() as usize);
    move_string(s);
}
```

```txt
Heap addr in main for s: 0x632de4208b10
Heap addr in move_string: 0x632de4208b10
```

## Copy types

But, some types do not need to be cloned, because they implement the `Copy` trait, which means that they can be copied instead of moved, such as integers, booleans, and characters.

```rust
fn move_num(n: i32) {
    println!("{n}");
}

fn main() {
    let n = 42i32;
    move_num(n);

    println!("{n}");
}
```

So, since a `Copy` type is never explicitly moved, the question arises: can we move a `Copy` type in Rust?

## Is it copied or moved?

If we run the previous code, we can easily check whether `n` got moved or copied by checking the address of `n` before and after the function call.

```rust
fn move_num(n: i32) {
    let nptr = &n as *const i32;

    println!("{n}");
    println!("Number ptr in move_num: 0x{:x}", nptr as usize);
}

fn main() {
    let n = 42i32;
    let nptr = &n as *const i32;
    println!("Original ptr: 0x{:x}", nptr as usize);
    move_num(n);

    println!("{n}");
    let nptr = &n as *const i32;
    println!("Number ptr in main: 0x{:x}", nptr as usize);
}
```

If we run this code, we'll see an output like this:

```txt
Original ptr: 0x7ffe7747d664
42
Number ptr in move_num: 0x7ffe7747d5a4
42
Number ptr in main: 0x7ffe7747d664
```

So we can see, that the `move_num` function has a different pointer address for `n`, which means that it was copied, not moved, while the original value is still in the main function.

But what if we don't reuse it in the main function? Will it still be copied?

```rust
fn move_num(n: i32) {
    let nptr = &n as *const i32;

    println!("{n}");
    println!("Number ptr in move_num: 0x{:x}", nptr as usize);
}

fn main() {
    let n = 42i32;
    let nptr = &n as *const i32;
    println!("Original ptr: 0x{:x}", nptr as usize);
    move_num(n);

    // println!("{n}");
    // let nptr = &n as *const i32;
    // println!("Number ptr in main: 0x{:x}", nptr as usize);
}

```

Surprisingly, the value in `move_num` is still copied, and the original value is still in the main function.

```txt
Original ptr: 0x7ffd588100e4
42
Number ptr in move_num: 0x7ffd58810024
```

## Why Rust doesn't move `Copy` types?

The reason why Rust doesn't move `Copy` types is that it would be inefficient and pointless to do so.

First, when a value is passed by reference the pointer is copied, not the value itself, so in anycase something is written to memory, but if we instead pass a number by value, it is the same size as a pointer or even smaller (such as `i8` or `u8`), so copying it is not a big deal.

You could think that for bigger types, such as a `[i32; 100]`, it would be more efficient to move it, but in reality, what it does is just copy the pointer to the first element of the array, so it is still efficient.

Second, if Rust were to allow moving `Copy` types, it would undermine the point of the Copy trait itself. The distinction between `Copy` and non-`Copy` types is meant to be clear: Copy types can be freely duplicated without needing to track ownership. Allowing them to be moved would reintroduce ownership tracking for types that are supposed to be trivially copyable, defeating the purpose of the Copy trait.

## Addendum: A note about this method

Someone told me on Mastodon that this method is not reliable and we should check with assemblers or debuggers to see if the value is copied or moved.

And yes it's true, sometimes the compiler optimizes the code and makes the CPU to reuse the value in the register, so no pointer is used in the process, and the value is not copied or moved, but just reused.

But there is not a foolproof way to determine if a value is copied or moved without looking at the generated assembly code or using a debugger and it's just to illustrate the concept in a simple way.

In any case this doesn't change the fact that `Copy` types are copied, not moved, and that we can verify it by checking the pointer address before and after the function call.
