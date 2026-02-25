---
date: '2024-11-03 17:00:00'
slug: 'reached-the-recursion-limit-at-build-time'
title: 'Reached the recursion limit... at build time?'
description: 'A quick investigation on the recursion limit exceeded issue at build time'
author: 'veeso'
featured_image: featured.jpeg
tag: rust
reading_time: '6'
---

## A bit of context

So on the other day I was implementing [Dokany](https://github.com/dokan-dev/dokany) for my [Remotefs-fuse](https://github.com/remotefs-rs/remotefs-rs-fuse) driver (coming soon btw). For those who doesn't know, Dokany provides something similiar to FUSE, but on Windows Systems, and for those who don't know what FUSE is, it is a kernel module which allows to mount anything as a file system on Linux systems (such as the file system of a remote server).

But that's not important, but it's what made me encounter this function from the Dokany `FileSystemHandler` **Trait**, which is necessary to create the driver, called `find_files`:

```rust
/// Lists all child items in the directory.
///
/// `fill_find_data` should be called for every child item in the directory.
///
/// It will only be called if [`find_files_with_pattern`] returns [`STATUS_NOT_IMPLEMENTED`].
///
/// See [`FindFirstFile`] for more information.
///
/// [`find_files_with_pattern`]: Self::find_files_with_pattern
/// [`FindFirstFile`]: https://docs.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-findfirstfilew
fn find_files(
    &'h self,
    file_name: &U16CStr,
    fill_find_data: impl FnMut(&FindData) -> FillDataResult,
    _info: &OperationInfo<'c, 'h, Self>,
    context: &'c Self::Context,
) -> OperationResult<()>
```

This function is used to list all the files children of `Context`, where Context is a file system entry.

While iterating the children, the entries must be pushed into an unknown buffer, using the `fill_find_data` callback.

Actually, while writing this article I just found out that only direct children must be returned 😅, but let's ignore that, and keep thinking like it should make a tree iteration of the children of `context`.

Let's dive in my implementation of this case.

## An error I had never seen before

In this case the best way to achieve this, is using **recursion**, so I did something similiar to this.

First of all these are our pseudo data structures:

```rust
#[derive(Debug, Clone)]
struct File {
    path: PathBuf,
    size: u64,
    is_dir: bool,
    children: Vec<File>,
}

#[derive(Debug, Clone)]
struct FindData {
    file: File,
    id: u64,
}

type FillDataResult = Result<(), String>;
type OperationResult<T> = Result<T, String>;
```

and this is our trait-like function to search for files:

```rust
fn find_files_with_pattern<F>(fill_find_data: F, context: &File) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    find_files(context, fill_find_data)
}
```

and this is my **recursive** function:

```rust
fn find_files<F>(context: &File, mut fill_find_data: F) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    let data = FindData {
        file: context.clone(),
        id: 0,
    };

    fill_find_data(&data)?;

    for child in context.children.iter() {
        find_files(child, &mut fill_find_data)?;
    }

    Ok(())
}
```

And finally this is my main:

```rust
fn main() -> Result<(), Box<dyn Error>> {
    let acc = Arc::new(Mutex::new(Vec::new()));
    let acc_ref = acc.clone();
    let fill_find_data = move |data: &FindData| {
        acc_ref.lock().unwrap().push(data.clone());
        Ok(())
    };
    let context = File {
        path: PathBuf::from("/tmp"),
        size: 0,
        is_dir: true,
        children: vec![File {
            path: PathBuf::from("/tmp/test.txt"),
            size: 12,
            is_dir: false,
            children: vec![],
        }],
    };

    find_files_with_pattern(fill_find_data, &context)?;

    let acc = acc.lock().unwrap();

    for data in acc.iter() {
        println!("{:?}", data);
    }

    Ok(())
}
```

So I expect it to run and print two file entries: `/tmp` and `/tmp/test.txt`.

My Rust-analyzer indeed says it's all good and the syntax is valid, but when I run `cargo build`...

_BOOM_ BUILD FAILED!

```txt
error: reached the recursion limit while instantiating `find_files::<&mut &mut &mut &mut &mut ...>`
  --> src/main.rs:36:9
   |
36 |         find_files(child, &mut fill_find_data)?;
   |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
note: `find_files` defined here
  --> src/main.rs:24:1
   |
24 | / fn find_files<F>(context: &File, mut fill_find_data: F) -> OperationResult<()>
25 | | where
26 | |     F: FnMut(&FindData) -> FillDataResult,
   | |__________________________________________^
   = note: the full type name has been written to 'F:\Sviluppo\playground\target\debug\deps\playground.long-type.txt'
```

![excuse me meme](./excuse-me.gif)

Wait what? Recursion limit exceeded? At build time? Is this even a thing?

And why does it mention this type `find_files::<&mut &mut &mut &mut &mut ...>`? Where does it come from?

If we give a look at the `long-type.txt` file, we can see this is what it contains:

```txt
find_files::<&mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut &mut {closure@src/main.rs:52:26: 52:48}>
```

![recursion cat gif](./recursion.gif)

So it seems the recursion limit has been reached by the **compiler** while trying to resolve the type of the `F` argument in `find_files`. But why is this happening?

## Why is this happening?

If we give a look to the signature of `find_files`, we can see we're using a generic here:

```rust
fn find_files<F>(context: &File, mut fill_find_data: F) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult
```

which is `F: FnMut(&FindData) -> FillDataResult`

The compiler, when building our program, must always know, or **infer** the type of generic functions. We can't have an _anonymous_ generic type in Rust, the type must be always inferrable at build time.

If we give a look at our code, where we first call `find_files`

```rust
let fill_find_data = move |data: &FindData| {
    acc_ref.lock().unwrap().push(data.clone());
    Ok(())
};

find_files_with_pattern(fill_find_data, &context)?;
```

We're calling it passing `fill_find_data` which has type `impl Fn(&FindData) -> Result<(), String>`

But then, inside of `find_data` we call `find_data` again recursively, multiple times:

```rust
for child in context.children.iter() {
    find_files(child, &mut fill_find_data)?;
}
```

At this point `fill_find_data`, which has type `impl Fn(&FindData) -> Result<(), String>` is being passed as `&mut f`, because we both need it as a mutable argument (since it is `FnMut`), but also we can't pass it by value, because we need its ownership.

But at this call, the compiler must infer the type of the `find_files` argument **again**, which will have as type `&mut impl Fn(&FindData) -> Result<(), String>`.

So it keeps analyizing the code recursively, and it sees that in the next call the inferred type will be `&mut &mut impl Fn(&FindData) -> Result<(), String>` and so again and again, until the **recursion limit is exceeded**.

Of course this issue, which can scared me at the first sight, is actually quite easy to fix, luckily.

## How to solve it

There are basically to ways to fix this issue that come to my mind right now:

### Make the recursive function to take a mutable reference

So we could do something like this:

```rust
fn find_files<F>(context: &File, fill_find_data: &mut F) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    let data = FindData {
        file: context.clone(),
        id: 0,
    };

    fill_find_data(&data)?;

    for child in context.children.iter() {
        find_files(child, fill_find_data)?;
    }

    Ok(())
}

fn find_files_with_pattern<F>(mut fill_find_data: F, context: &File) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    find_files(context, &mut fill_find_data)
}
```

At this point the type inferred for `find_files` will always be `&mut impl Fn(&FindData) -> Result<(), String>`, no matter how many recursion layers we have.

### Return F in the recursion call

Another possibility is to always return `F` from `find_files`:

```rust
fn find_files<F>(context: &File, mut fill_find_data: F) -> OperationResult<F>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    let data = FindData {
        file: context.clone(),
        id: 0,
    };

    fill_find_data(&data)?;

    for child in context.children.iter() {
        fill_find_data = find_files(child, fill_find_data)?;
    }

    Ok(fill_find_data)
}

fn find_files_with_pattern<F>(fill_find_data: F, context: &File) -> OperationResult<()>
where
    F: FnMut(&FindData) -> FillDataResult,
{
    find_files(context, fill_find_data)?;

    Ok(())
}
```

In this case we never pass `fill_find_data` as a reference, but as value every time and we get the value back after each recursive call.

Personally, if you have the possibility to use the first one, you should prefer it compared to the second one.

## Conclusions

And that's all basically. The issue was very easy to fix actually, but I find surprising as even after many years of development with Rust, I still can find some tricky issues with the compiler. The important thing is to always be able to workaround them.
