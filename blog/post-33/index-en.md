---
date: '2025-03-28 16:00:00'
slug: 'embedding-shared-objects-in-rust'
title: 'Embedding shared objects in Rust'
subtitle: 'How to embed a shared object in a Rust binary and load it at runtime'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## But why?

![but why](./but-why.gif)

So recently I've covered the topic of [Vendoring C Dependencies in Rust](https://blog.veeso.dev/blog/en/vendoring-c-cpp-dependencies-in-rust/) and I've shown how to build a static library and link it to a Rust library.

In the same article I've also covered how hard it was to get a static library for `smbclient` and so I even considered the approach I'm going to cover in this article, but at the time I didn't even know whether it was possible and the project of samba was probably not a good candidate to experiment with, since it's a mastodontic project.

But with a very simple C library I can now experiment with this approach and see if it works, and spoiler alert: **it works!**

So let's see **how to embed a shared object in a Rust binary** and **load it at runtime**.

## Setup

The first thing I did was to setup a new Rust library with the following dependencies that we'll need to achieve this:

```toml
[dependencies]
libc = "0.2"

[build-dependencies]
cc = "1"
```

Then I wrote a very simple C library that we'll use to test the dynamic loading of a shared library.

## The C Library

I've created a very simple C library that **just has a single function which sums two integers**:

```c
// libfoo.h

#ifndef LIBFOO_H
#define LIBFOO_H

int sum(int x, int y);

#endif // LIBFOO_H
```

```c
// libfoo.c

#include <libfoo.h>

int sum(int x, int y)
{
    return x + y;
}
```

And we'll compile it to both a shared object and a static lib using `Cmake`:

```cmake
cmake_minimum_required(VERSION 3.10)

project(libfoo C)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

include_directories(include)

set(SOURCES src/libfoo.c)

add_library(foo_shared SHARED ${SOURCES})
set_target_properties(foo_shared PROPERTIES OUTPUT_NAME "foo")
target_include_directories(foo_shared PUBLIC include)

add_library(foo_static STATIC ${SOURCES})
set_target_properties(foo_static PROPERTIES OUTPUT_NAME "foo")
target_include_directories(foo_static PUBLIC include)

```

## Bindings to Rust

We create a module in our library called `libfoo_sys.rs` this this body:

```rust
use libc::c_int;

#[link(name = "foo")]
unsafe extern "C" {
    pub unsafe fn sum(x: c_int, y: c_int) -> c_int;
}
```

and in our `lib.rs` we'll expose the `sum` function:

```rust
mod libfoo_sys;

pub fn sum(x: i32, y: i32) -> i32 {
    unsafe { libfoo_sys::sum(x, y) }
}
```

And that's all, now we can build the library and test it!

## Build libfoo from Rust

Let's build the library from `build.rs` at `build.rs`:

```rust
use std::path::{Path, PathBuf};
use std::process::Command;
use std::{env, fs};

struct Artifacts {
    include_dir: PathBuf,
    lib_dir: PathBuf,
}

struct Build {
    out_dir: Option<PathBuf>,
    host: Option<String>,
    target: Option<String>,
}

impl Default for Build {
    fn default() -> Self {
        Self {
            out_dir: env::var_os("OUT_DIR").map(|s| PathBuf::from(s).join("foo-build")),
            host: env::var("HOST").ok(),
            target: env::var("TARGET").ok(),
        }
    }
}

impl Build {
    fn build(&self) -> Result<Artifacts, String> {
        let target = &self.target.as_ref().ok_or("TARGET dir not set")?[..];
        let host = &self.host.as_ref().ok_or("HOST dir not set")?[..];
        let out_dir = self.out_dir.as_ref().ok_or("OUT_DIR not set")?;
        let build_dir = out_dir.join("build");

        if build_dir.exists() {
            fs::remove_dir_all(&build_dir).map_err(|e| format!("build_dir: {e}"))?;
        }

        let inner_dir = build_dir.join("libfoo");
        fs::create_dir_all(&inner_dir).map_err(|e| format!("inner_dir: {e}"))?;

        // copy libfoo/ to build_dir
        cp_r(&Self::source_dir(), &inner_dir)?;

        // init cc
        let mut cc = cc::Build::new();
        cc.target(target).host(host).warnings(false).opt_level(2);
        let compiler = cc.get_compiler();
        let mut cc_env = compiler.cc_env();
        if cc_env.is_empty() {
            cc_env = compiler.path().to_path_buf().into_os_string();
        }

        // build dir
        let lib_build_dir = inner_dir.join("build");
        // remove build/ dir if it exists
        if lib_build_dir.exists() {
            fs::remove_dir_all(&lib_build_dir).map_err(|e| format!("lib_build_dir: {e}"))?;
        }
        fs::create_dir_all(&lib_build_dir).map_err(|e| format!("lib_build_dir: {e}"))?;

        // run cmake
        let mut cmake = Command::new("cmake");
        cmake.arg("..");
        cmake.current_dir(&lib_build_dir);
        cmake.env("CC", cc_env);

        // run
        self.run_command(cmake, "cmake")?;

        // run make
        let mut make = Command::new("make");
        make.current_dir(&lib_build_dir);
        self.run_command(make, "make")?;

        // get lib and include path
        let include_dir = inner_dir.join("include");
        let lib_dir = lib_build_dir.join("lib");

        Ok(Artifacts {
            include_dir,
            lib_dir,
        })
    }

    fn source_dir() -> PathBuf {
        Path::new(env!("CARGO_MANIFEST_DIR")).join("libfoo")
    }

    #[track_caller]
    fn run_command(&self, mut command: Command, desc: &str) -> Result<(), String> {
        println!("running {:?}", command);
        let status = command.status();

        let verbose_error = match status {
            Ok(status) if status.success() => return Ok(()),
            Ok(status) => format!(
                "'{exe}' reported failure with {status}",
                exe = command.get_program().to_string_lossy()
            ),
            Err(failed) => match failed.kind() {
                std::io::ErrorKind::NotFound => format!(
                    "Command '{exe}' not found. Is {exe} installed?",
                    exe = command.get_program().to_string_lossy()
                ),
                _ => format!(
                    "Could not run '{exe}', because {failed}",
                    exe = command.get_program().to_string_lossy()
                ),
            },
        };
        println!("cargo:warning={desc}: {verbose_error}");
        Err(format!(
            "Error {desc}:
    {verbose_error}
    Command failed: {command:?}"
        ))
    }
}

fn cp_r(src: &Path, dst: &Path) -> Result<(), String> {
    for f in fs::read_dir(src).map_err(|e| format!("{}: {e}", src.display()))? {
        let f = match f {
            Ok(f) => f,
            _ => continue,
        };
        let path = f.path();
        let name = path
            .file_name()
            .ok_or_else(|| format!("bad dir {}", src.display()))?;

        // Skip git metadata as it's been known to cause issues (#26) and
        // otherwise shouldn't be required
        if name.to_str() == Some(".git") {
            continue;
        }

        let dst = dst.join(name);
        let ty = f.file_type().map_err(|e| e.to_string())?;
        if ty.is_dir() {
            fs::create_dir_all(&dst).map_err(|e| e.to_string())?;
            cp_r(&path, &dst)?;
        } else if ty.is_symlink() && path.iter().any(|p| p == "cloudflare-quiche") {
            // not needed to build
            continue;
        } else {
            let _ = fs::remove_file(&dst);
            if let Err(e) = fs::copy(&path, &dst) {
                return Err(format!(
                    "failed to copy '{}' to '{}': {e}",
                    path.display(),
                    dst.display()
                ));
            }
        }
    }
    Ok(())
}

```

And finally, at least for the moment, let's link libfoo statically:

```rust
fn main() {
    build_and_link_libfoo();
}

fn build_and_link_libfoo() {
    println!("building vendored foo library...");
    let artifacts = Build::default().build().expect("build failed");

    println!("cargo:vendored=1");
    println!(
        "cargo:root={}",
        artifacts.lib_dir.parent().unwrap().display()
    );

    if !artifacts.lib_dir.exists() {
        panic!("libfoo lib does not exist: {}", artifacts.lib_dir.display());
    }
    if !artifacts.include_dir.exists() {
        panic!(
            "libfoo include directory does not exist: {}",
            artifacts.include_dir.display()
        );
    }

    println!(
        "cargo:rustc-link-search=native={}",
        artifacts.lib_dir.display()
    );
    println!("cargo:include={}", artifacts.include_dir.display());
    println!("cargo:rustc-link-lib=static=foo");
}
```

## Testing

Now if we run a simple test in lib.rs it should work:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = sum(2, 2);
        assert_eq!(result, 4);
    }
}
```

```shell
cargo test
```

So that means that our **build script is working** and we can now use the library in our Rust code!

## Embedding shared objects

Now what I want to try is the following:

1. **Remove the static linking** (because we suppose that our project is mastodontic, it doesn't produce the static library and we don't figure out how to build it - like with samba you know)
2. **Build the shared object** and **embed it in the final binary** with `include_bytes!` macro
3. **Load the shared object at runtime** and call the function

So the first thing to do is to remove the static linking from the build script:

```rust
// we just keep this to build libfoo

fn build_libfoo() {
    println!("building vendored foo library...");
    Build::default().build().expect("build failed");
}
```

Now if you run `cargo test` it will fail because it won't link libfoo anymore

```txt
mold: fatal: library not found: foo
```

but **that's exactly what we want**!

Now we want to move `libfoo.so` to the manifest directory:

```rust
fn build_libfoo() {
    println!("building vendored foo library...");
    let artifacts = Build::default().build().expect("build failed");

    let shared_object = artifacts.lib_dir.join("libfoo.so");
    let dest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

    // copy shared object to dest_dir
    fs::copy(&shared_object, dest_dir.join("libfoo.so"))
        .expect("failed to copy shared object to dest_dir");
}
```

That will do the job, now we can add `libfoo.so` in the .gitignore:

```txt
/libfoo.so
```

and now let's embed it in the final binary:

```rust
const LIBFOO_SO: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/libfoo.so"));
```

and now we need to load the shared object at runtime.

To do that we'll need two dependencies: one to create tempfile, so `tempfile` and libloading which will help us to load the shared object.

```toml
[dependencies]
libloading = "0.8"
tempfile = "3"
```

Let's go back to our `libfoo_sys.rs`.

First we need to create a static `Once` to the temporary file and to the library:

```rust
static LIBFOO_SO_FILE: OnceLock<NamedTempFile> = OnceLock::new();
static LIBFOO_LIB: OnceLock<Library> = OnceLock::new();
```

And then we create a `init_libfoo` function which will create the temporary file and write the shared object to it:

```rust
fn init_libfoo() {
    LIBFOO_SO_FILE.get_or_init(|| {
        let mut file = NamedTempFile::new().expect("failed to create temp file");
        file.write_all(LIBFOO_SO)
            .expect("failed to write to temp file");
        file
    });
}
```

Finally, inside `init_libfoo`, we need to load `libfoo.so`, so it eventually will look like this:

```rust
pub unsafe fn init_libfoo() -> &'static Library {
    let libfoo_file = LIBFOO_SO_FILE.get_or_init(|| {
        let mut file = NamedTempFile::new().expect("failed to create temp file");
        file.write_all(LIBFOO_SO)
            .expect("failed to write to temp file");
        file
    });

    LIBFOO_LIB.get_or_init(|| unsafe {
        Library::new(libfoo_file.path()).expect("failed to load libfoo.so")
    })
}
```

Now we need to change the `sum` behaviour to load the symbol from the library:

```rust
//#[link(name = "foo")]
//unsafe extern "C" {
//    pub unsafe fn sum(x: c_int, y: c_int) -> c_int;
//}

pub unsafe fn sum(x: c_int, y: c_int) -> c_int {
    let libfoo = unsafe { init_libfoo() };

    let func = unsafe { libfoo.get::<unsafe extern "C" fn(c_int, c_int) -> c_int>(b"sum\0") }
        .expect("failed to get function");

    unsafe { func(x, y) }
}
```

And if you try to run `cargo test` now you'll see that it works!

![gene](./gene-wilder.gif)

## Vendoring or not vendoring?

Now of course **you may not want to always vendor**, so we can add a feature `vendored` to handle this. Let's see how our code would change:

```toml
[package]
name = "embedded-so"
version = "0.1.0"
edition = "2024"
build = "build.rs"

[dependencies]
libc = "0.2"
libloading = { version = "0.8", optional = true }
tempfile = { version = "3", optional = true }

[build-dependencies]
cc = { version = "1", optional = true }

[features]
default = ["vendored"]
vendored = ["dep:cc", "dep:libloading", "dep:tempfile"]
```

and now we need to feature gate the build script:

```rust
#[cfg(feature = "vendored")]
mod libfoo;

fn main() {
    #[cfg(feature = "vendored")]
    libfoo::build_libfoo();
}
```

and let's move all the other into the `libfoo` module.

Finally we need to feature gate the `libfoo_sys.rs`:

```rust
#[cfg(not(feature = "vendored"))]
mod dylib;
#[cfg(feature = "vendored")]
mod vendored;

#[cfg(not(feature = "vendored"))]
pub use self::dylib::*;
#[cfg(feature = "vendored")]
pub use self::vendored::*;
```

and we create a `vendored.rs` like this:

```rust
use std::{io::Write as _, sync::OnceLock};

use libc::c_int;
use libloading::Library;
use tempfile::NamedTempFile;

const LIBFOO_SO: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/libfoo.so"));
static LIBFOO_SO_FILE: OnceLock<NamedTempFile> = OnceLock::new();
static LIBFOO_LIB: OnceLock<Library> = OnceLock::new();

unsafe fn init_libfoo() -> &'static Library {
    let libfoo_file = LIBFOO_SO_FILE.get_or_init(|| {
        let mut file = NamedTempFile::new().expect("failed to create temp file");
        file.write_all(LIBFOO_SO)
            .expect("failed to write to temp file");
        file
    });

    LIBFOO_LIB.get_or_init(|| unsafe {
        Library::new(libfoo_file.path()).expect("failed to load libfoo.so")
    })
}

pub unsafe fn sum(x: c_int, y: c_int) -> c_int {
    let libfoo = unsafe { init_libfoo() };

    let func = unsafe { libfoo.get::<unsafe extern "C" fn(c_int, c_int) -> c_int>(b"sum\0") }
        .expect("failed to get function");

    unsafe { func(x, y) }
}
```

and `dylib.rs`:

```rust
use libc::c_int;

#[link(name = "foo")]
unsafe extern "C" {
    pub unsafe fn sum(x: c_int, y: c_int) -> c_int;
}
```

and the code is completely separated now, both `dylib` and `vendored` are working!

## Extra - Deduplication of C symbols with a macro

Currently you may have noticed that **we need to define C symbols twice**, both for the **vendored** and the **dynamic linking**. Of course we could use a **macro** to solve this. Let's see how:

In our `vendored.rs` we just keep this

```rust
use std::io::Write as _;
use std::sync::OnceLock;

use libloading::Library;
use tempfile::NamedTempFile;

const LIBFOO_SO: &[u8] = include_bytes!(concat!(env!("CARGO_MANIFEST_DIR"), "/libfoo.so"));
static LIBFOO_SO_FILE: OnceLock<NamedTempFile> = OnceLock::new();
static LIBFOO_LIB: OnceLock<Library> = OnceLock::new();

pub unsafe fn init_libfoo() -> &'static Library {
    let libfoo_file = LIBFOO_SO_FILE.get_or_init(|| {
        let mut file = NamedTempFile::new().expect("failed to create temp file");
        file.write_all(LIBFOO_SO)
            .expect("failed to write to temp file");
        file
    });

    // load with libloading
    LIBFOO_LIB.get_or_init(|| unsafe {
        Library::new(libfoo_file.path()).expect("failed to load libfoo.so")
    })
}
```

and we get rid of the sum function and of `dylib.rs`. Inside of `libfoo_sys.rs` we can define a macro to define the exports:

```rust
#[cfg(feature = "vendored")]
mod vendored;

#[cfg(feature = "vendored")]
pub use self::vendored::*;

#[cfg(not(feature = "vendored"))]
macro_rules! clib {
    ($name:ident
        (
            $( $arg_name:ident : $arg_ty:ty ),*
            $(,)?
        )
        -> $ret:ty) => {
            #[link(name = "foo")]
            unsafe extern "C" {
                pub fn $name( $( $arg_name : $arg_ty ),* ) -> $ret;
            }

    };
}

#[cfg(feature = "vendored")]
macro_rules! clib {
    ($name:ident
        (
            $( $arg_name:ident : $arg_ty:ty ),*
            $(,)?
        )
        -> $ret:ty) => {
            pub unsafe fn $name( $( $arg_name : $arg_ty ),* ) -> $ret {
                let libfoo = unsafe { init_libfoo() };

                let func = unsafe { libfoo.get::<unsafe extern "C" fn($( $arg_ty ),*) -> $ret>(concat!(stringify!($name), "\0").as_bytes()) }
                    .expect("failed to load function");

                unsafe { func( $( $arg_name ),* ) }
            }
    };
}
```

And at this point we can declare the `sum` C function easily like this:

```rust
clib!(sum(x: c_int, y: c_int) -> c_int);
```

And with this macro we can easily define all the C functions we need to use in Rust!

![cool-kid](./cool-kid.gif)

## Conclusion

This is a great experiment and it's actually really cool in my opinion.

After my last article on [Vendoring C Dependencies in Rust](https://blog.veeso.dev/blog/en/vendoring-c-cpp-dependencies-in-rust/) I really wanted to test this out since it was one of the point I've covered as a possible solution to the problem of vendoring C dependencies in Rust when you have a mastodontic project that won't build the static library.

**Would I recommend** using this approach over trying to build the static library no matter at what cost? **I don't know, it depends on the project and the context.**

For example **Samba really drove me crazy** and I couldn't build the static library, so I would have used this approach if I had known it before, but eventually I've found a brutal way to build the static library and I've used it.

But I'm sure that just embedding the shared object would have worked with that case, so I really don't know.

I think that **this could be considered an option anyway**, and I don't know whether it was ever covered in the Rust community or not, I've never seen it before.

Anyway, it's a cool experiment and I'm happy to have tried it out!

### References

- [embedded-so](https://github.com/veeso/embedded-so)
