---
date: '2025-05-02 11:00:00'
slug: 'std-mem-is-interesting'
title: 'std::mem is... interesting'
description: "Let's uncover the mysterious std::mem module in Rust"
author: 'veeso'
featured_image: featured.jpeg
category: rust-internals
reading_time: '11'
---

## A module we don't use often

The [std::mem](https://doc.rust-lang.org/std/mem/index.html) module in Rust is a bit of a mystery. It's 10PM and I'm randomly reading the **std library documentation** and I decide to take a look to the current main modules of the library (btw they're implementing `random`) and I see `std::mem`, which I've used a couple of times, but actually it contains a lot of things I've basically **never used before**, and I've worked with Rust for over 5 years now. So I thought it would be interesting to take a look at it and see what we can find there.

## Do I have to explain drop?

I think `drop` is the most known function in the `std::mem` module.

Basically `drop` is used to set the moment you want to drop a value, before it goes out of scope. We use this a lot with mutex for example to drop the lock as soon as possible.

```rust
use std::mem;

fn main() {
    let x = 1;
    mem::drop(x);

    // x is no longer valid here
}
```

## Swap, Take and Replace

Another two popular functions, `swap`, `take` and `replace`.

`take` is used to take a value out of a variable and reset it to the default value, and `replace` is an evolution of `take` that allows you to replace the value with another one.

```rust
use std::mem;

fn main() {
    let mut x = 1;
    let y = mem::take(&mut x);
    println!("x: {}, y: {}", x, y); // x: 0, y: 1

    let mut x = 1;
    let y = mem::replace(&mut x, 10);
    assert_eq!(x, 10);
    assert_eq!(y, 1);
}
```

Swap is used to swap two values in place.

```rust
use std::mem;

let mut x = 1;
let mut y = 2;
mem::swap(&mut x, &mut y);
assert_eq!(x, 2);
assert_eq!(y, 1);
```

These three functions are very useful when you want to manipulate values in a way that avoids unnecessary copies or moves. They are often used in conjunction with `Option` types, where you want to take ownership of a value without dropping it immediately.

For instance **`take` is widely used for join handles `JoinHandle`**. Usually if you have a struct which must hold the `JoinHandle`, you wrap it in an `Option` and you need to join the thread, you use `join.take()` to join the thread.

Now let's continue in alphabetical order, since we're going to cover those which are not so popular.

## AlignOf and AlignOfVal

These two functions are used to get the **ABI-required alignment** of a type `T` or of a value of the type `T`.

But what even is ABI-required alignment?
The ABI (Application Binary Interface) is a set of rules that define how different components of a binary program interact with each other. This includes things like calling conventions, data types, and memory layout. The ABI-required alignment is the alignment that the compiler needs to use to ensure that the program runs correctly on the target architecture.

TL;DR ABI-required alignment ensures values are placed correctly in memory so they behave correctly and consistently when shared between different parts of a program — especially when calling functions or accessing structs from other languages or binaries.

Maybe an example could help:

```rust
let align_of_i32 = mem::align_of::<i32>();
assert_eq!(align_of_i32, 4);
```

Makes sense because `i32` is 4 bytes long, but align is more interesting for structs:

```rust
struct Foo {
    a: i32,
    b: i32,
    c: bool,
    d: i64,
}

let align_of_foo = mem::align_of::<Foo>();
assert_eq!(align_of_foo, 8);

```

Why 8? Because the largest type in the struct is `i64`, which is 8 bytes long, so the struct needs to be aligned to 8 bytes. This means that the address of the struct must be a multiple of 8.

What if we put a String in the struct?

```rust
struct Foo {
    a: i32,
    b: i32,
    c: bool,
    d: i64,
    text: String,
}

let align_of_foo = mem::align_of::<Foo>();
assert_eq!(align_of_foo, 8);
```

Why 8? It could either be because of `i64` or `String`. But we know String is a `Vec<u8>`, which contains the length as `usize` and usize on my machine is 8 bytes long, so that explains why.

I can confidently say that **I don't really care about these two functions**.

## Discriminant

Here it gets interesting. The `discriminant` function says:

> Returns a value uniquely identifying the enum variant in v.

So basically it returns an Opaque type which **works like a unique identifier for each enum variant**, which as we'll see is actually very useful sometimes, and I will definetely start using it more often.

Let's say you have this enum:

```rust
struct Uncomparable {
    a: i32,
}

enum MyEnum {
    A(u32),
    B(u32, u32),
    C(Uncomparable),
}
```

Now let's imagine that you want to check if two enums `MyEnum` are of the same variant (not equal, just same variant). You could use a match statement, right?

```rust
match (a, b) {
    (MyEnum::A(_), MyEnum::A(_)) => true,
    (MyEnum::B(_, _), MyEnum::B(_, _)) => true,
    (MyEnum::C(_), MyEnum::C(_)) => true,
    _ => false,
}
```

BUT, hear me out! You can actually just use `discriminant` to **compare the two enum types**:

```rust
let a = MyEnum::A(1);
let b = MyEnum::B(1, 2);
let c = MyEnum::B(64, 48);

let a_same_of_b = mem::discriminant(&a) == mem::discriminant(&b);
assert_eq!(a_same_of_b, false);
let b_same_of_c = mem::discriminant(&b) == mem::discriminant(&c);
assert_eq!(b_same_of_c, true);
```

Honestly discriminant is the **most cool so far** in my opinion. Very useful, but never even seen it before.

## Forget

Forget is maybe a little bit more known because it's that function that lets you **leak memory** (even if you should actually use `Box::leak` instead).

Basically it takes ownership of a value but it doesn't drop it, it just forgets about it. This means that the value will never be dropped and the memory will be leaked.

```rust
let leaked = 1u32;
mem::forget(leaked);
```

But what is even the use of this?

It's basically only useful if you want to transfer file descriptors to C code. So you can open the `File` in Rust, pass it to C and forget it. It will be up to the C code to close it.

```rust
use std::fs::File;
use std::mem;
use std::os::unix::io::AsRawFd;

fn main() {
    let file = File::open("foo.txt").unwrap();
    let fd = file.as_raw_fd();
    mem::forget(file);

    // Now you can pass fd to C code
}
```

## Needs Drop

This function, called on a type `T`, returns `true` if `T` needs to be dropped, and `false` otherwise.

Wait. What does it mean **a value could not need to be dropped**? **I thought all values need to be dropped!?**

Example please???

If you had to bet, true or false?

```rust
mem::needs_drop::<i32>()
```

**IT'S FALSE!**

Uhm, a String? True or false?

```rust
mem::needs_drop::<String>()
```

It's true!

A struct?

```rust
struct ToDrop {
    a: i32,
}

assert_eq!(mem::needs_drop::<ToDrop>(), false);
```

This is false, again. Unless we implement `Drop` for it.

```rust
struct ToDrop {
    a: i32,
}

impl Drop for ToDrop {
    fn drop(&mut self) {
        println!("Dropping ToDrop");
    }
}

assert_eq!(mem::needs_drop::<ToDrop>(), true);
```

So, basically we can say if **any type itself or contains any grandchild type that implements `Drop`** then it **needs to be dropped**, which eventually results in **something allocated on the heap**, like a `String` or a `Vec`, which are both `Drop` types.

## Size of and SizeOfVal

This is quite simple. It just returns the byte size of a type `T` or of a value of the type `T`.

```rust
let size_of_i32 = mem::size_of::<i32>();
assert_eq!(size_of_i32, 4);
```

What about a struct?

```rust
struct Foo {
    a: i32,
    b: i32,
    c: bool,
    d: i64,
    text: String,
}

let size_of_foo = mem::size_of::<Foo>();
assert_eq!(size_of_foo, 48);
```

Why 48? We've got 4 + 4 + 1 + 8 + 24 (size of String) = 41, but **we have to add padding to align the struct to 8 bytes**, so we add 7 bytes of padding to make it 48 bytes long.

## Entering the Unsafe Kingdom

Beware, we're now entering the unsafe kingdom, land of **Corro the Unsafe Rusturchin**.

![corro](./corro.webp)

From now on, proceed with caution.

### Transmute

`transmute` **reinterprets the bits of a value of one type as another type**. This is a very powerful function, but could create some mess, even if the compiler does a good job preventing catastrophic issues.

It must comply with the following rule: **both types must have the same size**.

A very simple example of this is:

```rust
struct Bar {
    a: i32,
    b: i32,
}

struct Baz {
    a: i32,
    b: i32,
}

let bar = Bar { a: 1, b: 2 };
let baz = unsafe { mem::transmute::<Bar, Baz>(bar) };
assert_eq!(baz.a, 1);
assert_eq!(baz.b, 2);
```

What happens if we have Baz with different fields? Well, in this case it won't even compile

```rust
struct Bar {
    a: i32,
    b: i32,
}

struct Baz {
    a: i32,
    b: i32,
    c: i32,
}

let bar = Bar { a: 1, b: 2 };
let baz = unsafe { mem::transmute::<Bar, Baz>(bar) };
```

```txt
cannot transmute between types of different sizes, or dependently-sized types
source type: `Bar` (64 bits)
target type: `Baz` (96 bits)
```

But of course you could easily mess things up by doing something like this:

```rust
struct Bar {
    a: i32,
    b: i32,
}

struct Baz {
    b: i32,
    a: i32,
}

let bar = Bar { a: 1, b: 2 };

let baz = unsafe { mem::transmute::<Bar, Baz>(bar) };
assert_eq!(baz.a, 1); // NOPE, here is 2
assert_eq!(baz.b, 2); // NOPE, here is 1
```

So of course ordering must be the same, so breaking changes in the struct, even re-ordering the fields, could break the code.

Some could think that using this for instance for extending a struct is a good idea; for instance a library could expose a type `Foo` and we want to extend it with some new methods, so we create a new struct `FooExt` and we want to transmute it to `Foo` to use the methods.

But of course if the library changes the struct, we could break our code, and definitely a better way to achieve this is to wrap `Foo` in `FooExt` such as by doing

```rust
struct FooExt(Foo);
```

instead.

Is it just the total size of the struct checked? What if we use different types which sum up to the same size?

```rust
struct Bar {
    a: u16,
}

struct Baz {
    b: u8,
    a: u8,
}

let bar = Bar { a: 65535 };

let baz = unsafe { mem::transmute::<Bar, Baz>(bar) };
assert_eq!(baz.a, 255);
assert_eq!(baz.b, 255);
```

And this is valid, because the total size is 2 bytes, and the compiler doesn't care about the types, it just cares about the size.

Of course when the type is moved to `u8` it is truncated as if we were doing a shift; so the first byte is moved to `a` and the second byte is moved to `b`.

But of course this is achievable also with `u8::from_le_bytes` or `u8::from_ne_bytes`, so it's not really a good use case for `transmute` and is safe instead.

From the official Rust documentation they say it is only useful for a couple of things in reality:

- **Turning a pointer into a function pointer** where function pointer and data pointer have **different sizes**
- **Extending or shortening invariant lifetimes**; which is very cool (but very dangerous apparently)

  ```rust
  struct R<'a>(&'a i32);
  unsafe fn extend_lifetime<'b>(r: R<'b>) -> R<'static> {
      std::mem::transmute::<R<'b>, R<'static>>(r)
  }

  unsafe fn shorten_invariant_lifetime<'b, 'c>(r: &'b mut R<'static>)
                                               -> &'b mut R<'c> {
      std::mem::transmute::<&'b mut R<'static>, &'b mut R<'c>>(r)
  }
  ```

Also a final note: the Rust compiler can reorder the fields of a struct at will, until `#[repr(C)]` is used. So even in the simple case the fields may get swapped.

### Zeroed and MaybeUninit

Last but not least, `zeroed` is a function that creates a value of type `T` with all bits set to zero.

This is sometimes useful for FFI, so for passing values to C code where zeroed values are expected in some initializers, but in general it should be avoided.

```rust
let x: i32 = unsafe { mem::zeroed() };
assert_eq!(x, 0);
```

What about a struct?

```rust
struct Baz {
    b: u8,
    a: u8,
}

let baz: Baz = unsafe { mem::zeroed() };
assert_eq!(baz.a, 0);
assert_eq!(baz.b, 0);
```

In this case it is valid, but what if we have a `String` in the struct?

```rust
struct ZeroingString {
    a: u8,
    text: String,
}
```

In this case it panics, because `String` contains a `std::ptr::NonNull<u8>` and zeroing a pointer is actually like setting it to `NULL`, which is invalid for a `String` and will cause a panic when we try to use it.

```txt
thread 'main' panicked at library/core/src/panicking.rs:218:5:
attempted to zero-initialize type `ZeroingString`, which is invalid
```

**Zeroed** is actually closed related to **MaybeUninit**. `MaybeUninit` is a type that allows you to create uninitialized values of type `T`, and it is used to avoid the need to zero-initialize values.

For instance these two codes are equivalent:

```rust
let a: i32 = unsafe { mem::zeroed() };
let b: i32 = unsafe { mem::MaybeUninit::zeroed().assume_init() };
```

**MaybeUninit** is widely used for operations with pointers in `std::ptr`, for instance

```rust
let null_ptr: *const i32 = std::ptr::null();
// is actually equivalent to
let null_ptr = unsafe { MaybeUninit::<*const i32>::zeroed().assume_init() };
```

## Conclusion

I'm always surprised by how much I still have to learn about the **Rust standard library**. Even if this is a niche module, there are actually some very useful functions which can give a little bit of a boost to your code.
I hope you enjoyed this little tour of the `std::mem` module and learned something new. If you have any questions or comments, feel free to leave them below. And if you want to see more content like this, don't forget to follow me on Mastodon at **[@veeso_dev@hachyderm.io](https://hachyderm.io/@veeso_dev)**.
