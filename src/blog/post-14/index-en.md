---
date: '2024-07-12 16:00:00'
slug: 'implementing-a-generic-range-parser-in-rust'
title: "Implementing a generic range parser in Rust"
subtitle: "Well it looks easy, but it's not"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
---

## Simple problems that require complex solutions

A few days ago I was implementing a really simple function which would given a **string representation** of a **range** it returns a **Vec** of the items to include for that range.

I wanted to make it generic for any kind of primitive numeric type, so I started with writing the function with the following signature:

```rust
/// Parse a range string to a vector of usize
///
/// # Arguments
/// - range_str: &str - the range string to parse
///
/// # Returns
/// - Result<Vec<T>, anyhow::Error> - the parsed range
///
/// # Example
///
/// ```rust
/// let range: Vec<u64> = parse_range::<u64>("0-3").unwrap();
/// assert_eq!(range, vec![0, 1, 2, 3]);
///
/// let range: Vec<u64> = parse_range::<u64>("0,1,2,3").unwrap();
/// assert_eq!(range, vec![0, 1, 2, 3]);
/// ```
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
```

and continued implementing the body as follows:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>> {
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range.next().ok_or_else(|| "invalid range: start token not found")?;
        let end = range.next().ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<T>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<T>()
            .map_err(|_| "invalid range: end is not a number")?;

        Ok((start..=end).collect::<Vec<T>>())
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}
```

So it tries to parse a range both as `start-end` or `a,b,...,y,z` format.

If the range contains a `-` it splits the string and tries to parse both the `start` and the `end` tokens as `T`. If it succeeds, it returns a `Vec` with all the items between `start` and `end`.

> ❗ Of course, there are better range parser implementations, which could keep iterating searching for commas etc. but let's keep it simple for this post. Also, it doesn't work with negative numbers.

Actually this code, can't work at the moment, because we need to specify that `T` can be parsed from a str. So we need to add the first boundary:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr,
{
  // ...
}
```

![looks-great-so-far](./looks-great-chris-evans.gif)

But hey, the compiler is still pointing out an error there!

```txt
error[E0599]: the method `collect` exists for struct `RangeInclusive<T>`, but its trait bounds were not satisfied
   --> src/main.rs:44:26
    |
44  |         Ok((start..=end).collect::<Vec<T>>())
    |                          ^^^^^^^ method cannot be called on `RangeInclusive<T>` due to unsatisfied trait bounds
    |
   ::: /home/veeso/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/ops/range.rs:345:1
    |
345 | pub struct RangeInclusive<Idx> {
    | ------------------------------ doesn't satisfy `RangeInclusive<T>: Iterator`
    |
    = note: the following trait bounds were not satisfied:
            `T: Step`
            which is required by `RangeInclusive<T>: Iterator`
            `RangeInclusive<T>: Iterator`
            which is required by `&mut RangeInclusive<T>: Iterator`
help: consider restricting the type parameter to satisfy the trait bound
    |
26  |     T: FromStr, T: Step
    |               ~~~~~~~~~
```

**Step** trait? What's that? Well, the Step trait defines how a type should behave in an iterator. Indeed it's clear obvious for us that `2` comes after `1` and before `3`, but for the compiler it's not. Indeed `T` here could be anything, even a string, as long as it implements `FromStr` it is accepted as a type parameter.

So if I pass this Struct

```rust
struct MyType {
  a: String,
  b: String,
}

impl FromStr for MyType {
  // ...
}
```

I can ask to parse a range for `MyType`. But what comes in a range between `MyType A` and `MyType N`? The **Step** trait can give us the answer to this question!

So let's just add the `Step` boundary and it should work...

```rust
use std::iter::Step;

fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Step,
{
  // ...
}
```

![nope](./nope.gif)

It still won't build, we have a new error from the rust compiler

```txt
error[E0658]: use of unstable library feature 'step_trait'
 --> src/main.rs:1:25
  |
1 | use std::{error::Error, iter::Step, str::FromStr};
  |                         ^^^^^^^^^^
  |
  = note: see issue #42168 <https://github.com/rust-lang/rust/issues/42168> for more information

error[E0658]: use of unstable library feature 'step_trait'
  --> src/main.rs:26:18
   |
26 |     T: FromStr + Step,
   |                  ^^^^
   |
   = note: see issue #42168 <https://github.com/rust-lang/rust/issues/42168> for more information

For more information about this error, try `rustc --explain E0658`.
```

So, to wrap up, we need to create a range from `T` types, which requires the `Step` trait, but the `Step` trait is unstable. So... we can't do this I guess...

## Solution 1 - Workaround with Ops

Okay, consider this. We know that we can't use `Step`, but in our case we pretty much just want to work with number types, possibly integers. So our issue is that we want to iterate between `n` to `m` for each items in between, which is what `Step` does. So how to work around it?

Well, let's think about it!

We could simply:

1. Set `x = n`
2. Push `x` to our Vec
3. Set `x = x + 1`
4. If `x > m` break
5. Otherwise go to `step 2`

We don't require `Step` to implement this logic, we just need `Add`, `Eq` and `Ord` for this!

![think-about-it-meme](./think-about-it.gif)

```rust
use std::cmp::{Eq, Ord};
use std::ops::Add;

fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord,
{
  // ...

        let mut range = Vec::new();
        let mut x = start;
        while x <= end {
            range.push(x);
            x = x + 1;
        }

        Ok(range)
  
  // ...
}
```

We're almost there, we just have one issue to solve: how do we add `1` to `x`? `1` is not `T`, so we need to find a way to sum a `Unit` to `x as T`.

### The Unit trait

Okay, let me just be clear! There's nothing like a `Unit` trait in Rust, but we can implement it by ourselves to add a new bound to our function:

```rust
/// A trait for types that have a unit value.
///
/// E.g. 1 for integers, 1.0 for floats, etc.
pub trait Unit {
    fn unit() -> Self;
}
```

At this point we can use `macro_rules!` to implement it for all the primitive integer types

```rust
/// Implement One for common numeric types.
macro_rules! impl_one_for_numeric {
    ($($t:ty)*) => ($(
        impl Unit for $t {
            fn unit() -> Self {
                1
            }
        }
    )*)
}

impl_one_for_numeric!(usize u8 u16 u32 u64 isize i8 i16 i32 i64);
```

And so, we can finally add the boundary for our function:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord + Unit + Copy,
```

And at this point we can finally solve our iteration:

```rust
let mut range = Vec::new();
let mut x = start;
while x <= end {
    range.push(x);
    x = x + T::unit();
}

Ok(range)
```

Note that I've also added `Copy` here, because

```rust
range.push(x);
x = x + T::unit();
```

needs to copy the value of `x` into `range`.

So we can finally compile our function successfully:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord + Unit + Copy,
{
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range
            .next()
            .ok_or_else(|| "invalid range: start token not found")?;
        let end = range
            .next()
            .ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<T>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<T>()
            .map_err(|_| "invalid range: end is not a number")?;

        let mut range = Vec::new();
        let mut x = start;
        while x <= end {
            range.push(x);
            x = x + T::unit();
        }

        Ok(range)
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}
```

## Solution 2 - TryInto and TryFrom Isize

Another possible solution, but in my opinion could have been to add a boundary to `isize`. Actually, even if simpler than the previous one, it's probably a worse approach, but I just wanted to report it anyway, because someone reading this article could point out that this was probably a simpler approach.

So, basically we could have implemented our range parser as follows:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + TryInto<isize> + TryFrom<isize>,
{
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range
            .next()
            .ok_or_else(|| "invalid range: start token not found")?;
        let end = range
            .next()
            .ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<isize>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<isize>()
            .map_err(|_| "invalid range: end is not a number")?;

        let range = (start..=end).collect::<Vec<isize>>();
        let mut t_range = Vec::with_capacity(range.len());
        for x in range {
            if let Ok(x) = x.try_into() {
                t_range.push(x);
            } else {
                return Err("invalid range values: conversion error".into());
            }
        }
        Ok(t_range)
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}

```

So yeah, we could add a boundary which allows us to use primitives as long as they can fit into `isize`. With this approach though, some `u64` values would generate error, so even if simpler, it's worse for sure and probably even performance aren't good as in the first proposed solution.

## Extra: refined range-parser

Eventually I've decided to refine the range parser to publish it as a Rust crate.

The refined range-parser has the same core as we've seen before, but it adds support for multi range in the string (e.g. `1-3,7-9`), negative numbers (e.g. `-1-2,-8--5,-10`), custom separators and better errors. Also in this article I've recently realized I didn't check whether **start is smaller than end in range**, which led to a bug.

So if you wish to give a look or use the stable library, you can give a look to [range-parser](https://crates.io/crates/range-parser) on crates.io ❤️.

![party-dance](./party-dance.gif)

## Conclusions

I hope you found this article interesting or in case you were exactly looking how to implement this, well I hope it was useful. Maybe, check if the `Step` trait has been stabilized in the meantime :sweat_smile:.
