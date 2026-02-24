---
date: '2024-10-28 17:00:00'
slug: 'dyn-box-vs-generics-in-rust'
title: 'Dyn Box Vs. Generics'
subtitle: 'What is the best approach for achieving conditional generics in Rust?'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## Case scenario

Have you ever done something similiar?

```rust
trait Greet {

  fn greet(&self) -> String;

}

struct Alice;

impl Greet for Alice {
  fn greet(&self) -> String {
    "Hello".to_string()
  }
}

struct Carlo;

impl Greet for Carlo {
  fn greet(&self) -> String {
    "Ciao".to_string()
  }
}

// ...

struct User {
  greet: Greet
}

// ...

let greet = Alice;

let user = User { greet };
```

This is something everything has tried to do in Rust: dynamic types inside of data structures.
There are two different ways to achieve this in Rust:

- **Box dyn**
- **Generics**

But have you ever wondered what's the best option? In this article I'm going to try to make you understand both
what's actually better, and how to deal with **conditional typing**.

## How is this done

We've just seen this in the introduction example:

```rust
struct User {
  greet: Greet // <-- Greet is a trait here
}
```

Well, of course we can't put `Greet` in our struct this way, indeed we'll have this error:

```txt
error[E0308]: mismatched types
  --> src/main.rs:32:23
   |
32 |     let user = User { greet };'
   |                       ^^^^^ expected `dyn Greet`, found `Alice`
   |
   = note: expected trait object `(dyn Greet + 'static)`
                    found struct `Alice`
   = help: `Alice` implements `Greet` so you could box the found value and coerce it to the trait object `Box<dyn Greet>`, you will have to change the expected type as well

```

So we have two different approach we can take here:

### Box Dyn

We can just wrap our `Greet` into a `Box` like this

```rust
struct User {
  greet: Box<dyn Greet>,
}

let greet = Alice;
let user = User { greet: Box::new(greet) };
```

![cat walking in a box](./cat-box.gif)

Here someone could say that **this might not be the best approach though** and there is a better way to do the same thing.

Did you mean _Generics_?

### Generics

In place of using a `Box dyn` we could use **Generics**, which results in a smarter implementation:

```rust
struct User<T>
where T: Greet
{
  greet: T,
}

let greet = Alice;
let user = User { greet };
```

It looks fine, but does this create some issues? What about _conditional typing_?

## Conditional types with generics

But what if we had to instantiate `User` with a different `Greet` implementation on a certain condition? Let's take this code for example

```rust
let user = match name {
    "carlo" => User { greet: Carlo },
    "alice" => User { greet: Alice },
    _ => panic!("Unknown user"),
};
```

This would result in an error, because the type of `user` canàt be determined

```txt
error[E0308]: `match` arms have incompatible types
  --> src/main.rs:36:20
   |
34 |       let user = match name {
   |  ________________-
35 | |         "carlo" => User { greet: Carlo },
   | |                    --------------------- this is found to be of type `User<Carlo>`
36 | |         "alice" => User { greet: Alice },
   | |                    ^^^^^^^^^^^^^^^^^^^^^ expected `User<Carlo>`, found `User<Alice>`
37 | |     };
   | |_____- `match` arms have incompatible types
   |
   = note: expected struct `User<Carlo>`
              found struct `User<Alice>`
```

Indeed we can't have in the same variable `User<Carlo>` and `User<Alice>`.

While if we used `Box dyn` this wouldn't be an issue:

```rust
let user = match name {
    "carlo" => UserDyn { greet: Box::new(Carlo) },
    "alice" => UserDyn { greet: Box::new(Alice) },
    _ => panic!("Unknown user"),
};
```

So apparently, in this case the only way we can achieve this is by using `Box dyn`. But, wait, is it true?

## Wrap generics

Actually there is a different way to have the same result is by using a `impl Greet` that wraps our `Greet` types, like this:

```rust
enum MyGreet {
    Alice(Alice),
    Carlo(Carlo),
}

impl MyGreet {
    /// Call the given closure with the appropriate [`Greet`] implementation
    fn on_greet<F, T>(&self, f: F) -> T
    where
        F: FnOnce(&dyn Greet) -> T,
    {
        match self {
            Self::Alice(v) => f(v),
            Self::Carlo(v) => f(v),
        }
    }
}


impl Greet for MyGreet {
    fn greet(&self) -> String {
        self.on_greet(|greet| greet.greet())
    }
}

let user = match name {
    "carlo" => User { greet: MyGreet::Carlo(Carlo) },
    "alice" => User { greet: MyGreet::Alice(Alice) },
    _ => panic!("Unknown user"),
};
```

And this builds. So two different ways to achieve the same thing? Yeah, more or less,
but there are actually some important differences in these two approaches. Let's dive in!

## Box dyn Vs. Generics Wrapper - What's better?

Before starting the analisys, I want to you to imagine that this type containing the `Dynamic` type,
is exposed publicly in a library you're using. So, what would be better for you?

### Flexibility

Generics and generics wrappers allows you to have more custom code, on the other hand
generics wrappers may be complex to achieve in case where some bounds must be respected by the inner type, and in some cases we may
have **several** generics to include inside of our Dynamic type data, or could even be undetermined. In all of these cases
**Box dyn** should be preferred.

### Performance

Talking about performance, both cases have pros and cons:

- **Generics** doesn't have a overhead for dispatching (but generic wrappers do have a overhead though!), on the other hand the compiler must generate specific-code for each type, so the binary size will be bigger.
- **Box dyn** has a dispatching overhead, but the binary size will be much smaller.

But, eventually we could say that **Box dyn** is the **winner** if we talk about performance.

### Library APIs

A topic we can't ignore is **Library APIs** and in particular **Open Source libraries**.

When we implement a library and we have to expose a type like this

```rust
struct Data {
  imp: MyTrait
}
```

what is better for the library users? In this case, **Generics** win for sure.

Generics give library users better performance if they don't user wrappers and a few generic types (as usually happens), and it's
surely more flexible for users.

Actually talking about performance you may say this is contrast with what I said before, and it's true,
but when talking about library apis we need to consider that most of users will have simpler implementation compared to
generic wrappers, so we could say that we may have a smaller binary size and less overhead.

## Conclusions

While using **Box dyn** could look simpler, especially for Rust newbies, and in some cases is better for binary sizes, generics should be preferred instead. Actually it's interesting how the compiler usually gives you this hint

```txt
error[E0308]: mismatched types
  --> src/main.rs:32:23
   |
32 |     let user = User { greet };'
   |                       ^^^^^ expected `dyn Greet`, found `Alice`
   |
   = note: expected trait object `(dyn Greet + 'static)`
                    found struct `Alice`
   = help: `Alice` implements `Greet` so you could box the found value and coerce it to the trait object `Box<dyn Greet>`, you will have to change the expected type as well
```

as we've seen before, but doesn't mention that Generics could be even more suitable for this purpose, giving newbies a _non-optimal_ hint to deal with this case. Indeed, even myself, I used Box dyn a lot in place of generics in my early days with Rust.
