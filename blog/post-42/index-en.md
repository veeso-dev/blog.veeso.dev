---
date: '2025-06-18 17:40:00'
slug: 'dont-you-dare-to-sort-your-struct-fields-when-using-sized'
title: "Don't you dare to sort your struct fields when using ?Sized"
subtitle: 'Or Ferris will come for you!'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

So on the other day I was making a custom implementation of the `io` module for [maybe-fut](https://github.com/veeso/maybe-fut) and I had to implement the `BufReader` struct, which has this definition:

```rust
pub struct BufReader<R: ?Sized> {
    buf: Vec<u8>,
    filled: usize,
    pos: usize,
    inner: R,
}
```

And so far so good, but since I'm quite a maniac about sorting the fields in a struct in alphabetic order, I decided to change it to:

```rust
pub struct BufReader<R: ?Sized> {
    buf: Vec<u8>,
    filled: usize,
    inner: R,
    pos: usize,
}
```

But **BHAM!** After just this little change, the compiler started to complain and won't compile the code anymore:

```txt
error[E0277]: the size for values of type `R` cannot be known at compilation time
 --> src/main.rs:3:12
  |
1 | pub struct BufReader<R: ?Sized> {
  |                      - this type parameter needs to be `Sized`
2 |     buf: Vec<u8>,
3 |     inner: R,
  |            ^ doesn't have a size known at compile-time
  |
  = note: only the last field of a struct may have a dynamically sized type
  = help: change the field's type to have a statically known size
help: consider removing the `?Sized` bound to make the type parameter `Sized`
```

But why's that? Well, we need to explain a few things first.

## Sized and ?Sized

First of all, what's the difference between `Sized` and `?Sized`?

We're for sure all familiar with the `Sized` trait, which is automatically implemented for types that have a **known size at compile time**. This means that the compiler knows how much memory to allocate for a variable of that type.

In general most of the types we use in Rust are `Sized`, like `i32`, `f64`, `String`, etc. However, there are some types that do not have a known size at compile time, such as trait objects (`dyn Trait`), slices (`[T]`), and unsized types in general.

While it exists a `Sized` trait, there's not a `Unsized` trait, so if we want to specify that a type can be either `Sized` or not, we use the `?Sized` bound.

So, `?Sized` means that it may be `Sized`, but not for sure.

### Why do we need to specify ?Sized?

Okay, but couldn't we just omit `?Sized` if it's not needed?

Well, the reason is that Rust always assumes that type parameters are `Sized` by default. This means that if you define a type parameter without any bounds, Rust will assume that it must be `Sized`.

So doing

```rust
struct Foo<T> {
    value: T,
}
```

or

```rust
struct Foo<T: Sized> {
    value: T,
}
```

is the same, and both will require `T` to be `Sized`.

### When do we need ?Sized?

Let's say that **you can't actually instantiate** a struct with an unsized type in it, like this:

```rust
struct Foo<T: ?Sized> {
    value: T,
}

fn main() {
    let foo: [u8] = Foo { value: [1, 2, 3] };
}
```

To do so, you need like to box it, let's see this example:

```rust
trait MyTrait {
    fn foo(&self);
}

struct Wrapper<T: ?Sized> {
    inner: Box<T>,
}

fn use_trait_object(w: Wrapper<dyn MyTrait>) {
    w.inner.foo();
}

struct Foo;

impl MyTrait for Foo {
    fn foo(&self) {
        println!("Foo");
    }
}

fn main() {
     let foo = Foo;

     let wrapper: Wrapper<dyn MyTrait> = Wrapper { inner: Box::new(foo) };
     use_trait_object(wrapper);
}
```

So we have a `Wrapper` that takes a `dyn MyTrait` as a type parameter, which is an unsized type. We can only use it by boxing it, because the size of `dyn MyTrait` is not known at compile time.

But of course, `Box<dyn MyTrait>` is `Sized`, so we can use it in a struct that has a `Box` field.

So you may, as me, think that this doesn't make any sense! `Box<dyn MyTrait>` is `Sized`, so why do we need to specify `?Sized` in the `Wrapper` struct?

The reason is that, while `Box<dyn MyTrait>` is `Sized`, the type parameter `T` can't be used if we don't tell the compiler that it may be `?Sized`. If we don't specify `?Sized`, the compiler will assume that `T` is `Sized`, and it won't allow us to use unsized types like `dyn MyTrait`.

Indeed if we try to remove the `?Sized` bound from the `Wrapper` struct, we'll get a compilation error:

```txt
 fn use_trait_object(w: Wrapper<dyn MyTrait>) {
  |                        ^^^^^^^^^^^^^^^^^^^^ doesn't have a size known at compile-time
  |
  = help: the trait `Sized` is not implemented for `(dyn MyTrait + 'static)`
note: required by an implicit `Sized` bound in `Wrapper`
```

So it doesn't matter if `T` is wrapped in a `Box`, what matters is that `T` is sized, if we don't specify `?Sized`.

### ?Sized without a Box

Another way to implement the same thing, is by using a reference to `T`, like this:

```rust
struct Testing<T: ?Sized> {
    inner: T,
}

trait TestingTrait {
    fn foo(&self) {}
}

impl TestingTrait for String {}

fn main() {
    let a: Testing<[u8; 10]> = Testing { inner: [0; 10] };
    let b: &Testing<[u8]> = &a;

    let c: Testing<String> = Testing { inner: String::new() };
    let d: &Testing<dyn TestingTrait> = &c;
}
```

Of course `[u8; 10]` is a sized type, but `[u8]` is not, so we can use `?Sized` to specify that the `inner` field may be either sized or not.

Also here of course, `b` is sized, because it is a reference to a sized type, but the `T` type parameter is still `?Sized`, so we can use it with unsized types like `dyn TestingTrait`.

If we didn't specify `?Sized`, the compiler would complain that `T` doesn't have a size known at compile time, even if we are using a reference to it.

Thanks to [sgued@pouet.chapril.org](https://hachyderm.io/@sgued@pouet.chapril.org) for pointing this out!

## Why fields order matters

Now that we know what `?Sized` is, let's go back to the `BufReader` struct.

Why does the order of the fields matter when using `?Sized`?

We could just accept the fact that only the last field of a struct can be `?Sized`. But I'm not that kind of person, I want to understand why!

The reason is actually quite simple: **the order of the fields in a struct determines how the memory is laid out**.

When you have a struct with a `?Sized` field, Rust needs to know how much memory to allocate for the other fields. If the `?Sized` field is not the last one, Rust can't easily determine the layout of the struct, because the type could either be `Sized` or not; and if not things get complicated.

## Does this impact also sized types?

At this point I've never thought about this, but should we also think about the order of fields when using `Sized` types?

Well, the answer is: **sometimes**.

For instance, if we have a struct like this:

```rust
struct A {
    a: u8,
    b: u64,
    c: u8,
}
```

and this:

```rust
struct B {
    a: u64,
    b: u8,
    c: u8,
}
```

We expect that the size of `A` and `B` will be different, because the order of the fields is different, and will create different padding in memory.

Despite this, if we check the size of both structs, we'll see that they are equally sized:

```rust
fn main() {
    println!("Size of A: {}", std::mem::size_of::<A>());
    println!("Size of B: {}", std::mem::size_of::<B>());
}
```

The output will be `16` for both struct.

So, in this case, the order of the fields doesn't matter, because Rust will align the fields in a way that they fit in the same memory space.

However, there is an exception to this rule, which is when we use the `#[repr(C)]` attribute.

### Repr C

For instance, if we use the `#[repr(C)]` attribute, which is used to specify that the struct should have a C-compatible layout, the order of the fields will matter.

```rust
#[repr(C)]
struct A {
    a: u8,
    b: u64,
    c: u8,
}

#[repr(C)]
struct B {
    a: u64,
    b: u8,
    c: u8,
}

fn main() {
    println!("Size of A: {}", std::mem::size_of::<A>());
    println!("Size of B: {}", std::mem::size_of::<B>());
}
```

The output will be different this time:

```txt
Size of A: 24
Size of B: 16
```

So we can say that we can order fields in a struct without worrying about the size, unless we use the `#[repr(C)]` attribute.

## But again, why only the last field?

The last paragraph we've just read has just proven that Rust already knows how to handle the order of fields in a struct, so why does it only allow `?Sized` for the last field?

The reason is that while Rust knows how to handle the order of fields in a struct on a **memory based, but not semantically**, which is required for DSTs (Dynamically Sized Types).

So even if it's quite complicated to understand, it is actually quite simple: **the last field of a struct is the only one that can be `?Sized` because it is the only one that can be dynamically sized**.
