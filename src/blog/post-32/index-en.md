---
date: '2025-03-20 17:00:00'
slug: 'vendoring-c-cpp-dependencies-in-rust'
title: 'Vendoring C/C++ dependencies in Rust'
subtitle: 'How to statically bundle a C library to your project like with OpenSSL'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
draft: false
tag: rust
---

## What is vendoring about?

I'm writing this post because basically I haven't found any guide about this, and for sure with this level of completeness and masochism.

So what are we even talking about? Have you ever used the [native-tls](https://docs.rs/native-tls/latest/native_tls/) crate?

Well it is an abstraction for TLS stuff in Rust and since it's older than rustls, on linux systems **it has to rely on OpenSSL**.

The issue is that, **openssl is a C library** and usually when you implement stuff in C you **have to link it dynamically**, but in Rust we like to statically link everything, also because dynamic linking for binaries is a pain, since the binary may not work on other systems and so **releasing bins is a hustle**.

But here comes the `vendored` feature in help! Because with this feature enabled, openssl gets automagically built while building the crate and statically embedded into your binary and so we're all happy.

![train-party](./train-party.gif)

But if we can be **happy today it's because someone has suffered before us** to vendor a crate. And that someone, today, is me.

## The complete guide to vendoring in Rust

### The project structure

Let's start with the project structure. If we have a `foo` crate, that is using ffi to C code, we usually have a workspace with the following structure:

- `foo`: rust crate exposing the rust api
- `foo-sys`: rust crate exposing the C api

and Inside our `foo-sys` we have a `build.rs` with the directives for the linker to find the C library, like this:

```rust
println!("cargo:rustc-link-lib=foo");
```

Now if we want to vendor the `libfoo` we have to create a new crate, which will be called `foo-src` and will be a library containing the **functions to compile the C library** and _optionally_ the sources of the C library.

### The src crate

First we setup a `Cargo.toml` with `cc` as a dependency, which is a crate that allows us to invoke the C/C++ compiler from Rust.

```toml
[dependencies]
cc = "1"
```

and then we can start writing the `lib.rs` which will expose a `build` function that will compile the C code and will return back two things:

- the path to the **include directory** for the library
- the path to **directory containing** the **static library** (e.g. `/usr/lib/libfoo.a` -> `/usr/lib`)

So let's set this up:

```rust
/// Artifacts produced by the build process.
pub struct Artifacts {
    pub lib_dir: PathBuf,
    pub include_dir: PathBuf,
}

/// lib version
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

/// Build configuration
pub struct Build {
    out_dir: Option<PathBuf>,
    target: Option<String>,
    host: Option<String>,
}

impl Build {
    /// Init a new [`Build`] configuration.
    pub fn new() -> Build {
        Build {
            out_dir: env::var_os("OUT_DIR").map(|s| PathBuf::from(s).join("lib-build")),
            target: env::var("TARGET").ok(),
            host: env::var("HOST").ok(),
        }
    }

    pub fn out_dir<P: AsRef<Path>>(&mut self, path: P) -> &mut Build {
        self.out_dir = Some(path.as_ref().to_path_buf());
        self
    }

    pub fn target(&mut self, target: &str) -> &mut Build {
        self.target = Some(target.to_string());
        self
    }

    pub fn host(&mut self, host: &str) -> &mut Build {
        self.host = Some(host.to_string());
        self
    }

    // ...
}
```

then we need a function to invoke `make`:

```rust
fn cmd_make(&self) -> Result<Command, &'static str> {
    let host = &self.host.as_ref().ok_or("HOST dir not set")?[..];
    Ok(
        if host.contains("dragonfly")
            || host.contains("freebsd")
            || host.contains("openbsd")
            || host.contains("solaris")
            || host.contains("illumos")
        {
            Command::new("gmake")
        } else {
            Command::new("make")
        },
    )
}
```

and one helper to run commands during the build process:

```rust
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
```

Now we can finally start thinking about the build function.

## Compiling the library

Now we can implement the `build` function, which will compile the library.

We'll see two scenarios today, the first is the simplest one, which means that your C code is already producing with a couple of commands a static library and an include directory.

The second one, is the masochistic one, where your library is huge and the make won't produce a static library, and yeah, I'm talking about you, **samba**.

### Happy C compilation

So in the best possible scenario we'll have something like this to get a static library for our C code:

```sh
./configure
make
make install DESTDIR=$(pwd)/out
```

and we'll have the static library in `out/usr/local/lib/libfoo.a` and the include directory in `out/usr/local/include`.

![cat-jam](./catjam-cat.gif)

If you're in a case like this, let's see how to write the build function:

```rust
pub fn try_build(&mut self) -> Result<Artifacts, String> {
    let target = &self.target.as_ref().ok_or("TARGET dir not set")?[..];
    let host = &self.host.as_ref().ok_or("HOST dir not set")?[..];
    let os = Self::os(target)?;
    let out_dir = self.out_dir.as_ref().ok_or("OUT_DIR not set")?;
    let build_dir = out_dir.join("build");

    if build_dir.exists() {
        fs::remove_dir_all(&build_dir).map_err(|e| format!("build_dir: {e}"))?;
    }

    let inner_dir = build_dir.join("src");
    fs::create_dir_all(&inner_dir).map_err(|e| format!("{}: {e}", inner_dir.display()))?;

    // here get the directory for your sources; I STRONGLY SUGGEST CLONING A GIT REPO here
    // read further chapters for this
    let src_dir = todo!();

    // init cc
    let mut cc = cc::Build::new();
    cc.target(target).host(host).warnings(false).opt_level(2);
    let compiler = cc.get_compiler();
    let mut cc_env = compiler.cc_env();
    if cc_env.is_empty() {
        cc_env = compiler.path().to_path_buf().into_os_string();
    }

    // get ar
    let ar = cc.get_archiver();

    // configure
    let mut configure = Command::new("sh");
    configure.arg("./configure");
    // here you can add your configure flags
    configure.arg("--disable-python");
    configure.arg("--without-systemd");
    configure.arg("--without-ldb-lmdb");
    configure.arg("--without-ad-dc");
    configure.arg("--bundled-libraries=ALL");
    configure.arg("--without-libarchive");
    configure.env("CC", cc_env);
    configure.env("AR", ar.get_program());

    let ranlib = cc.get_ranlib();
    let mut args = vec![ranlib.get_program()];
    args.extend(ranlib.get_args());
    configure.env("RANLIB", args.join(OsStr::new(" ")));

    configure.current_dir(&src_dir);
    // run configure
    self.run_command(configure, "configuring foo build")?;

    // make
    let make = self.cmd_make()?;
    make.current_dir(&src_dir);
    self.run_command(make, "building foo")?;
    // create out dir
    let out_dir = src_dir.join("out");
    fs::create_dir_all(&out_dir).map_err(|e| format!("{}: {e}", out_dir.display()))?;
    // install
    let install = Command::new("make");
    install.arg("install");
    install.arg(format!("DESTDIR={}", out_dir.display()));
    install.current_dir(&src_dir);
    self.run_command(install, "installing foo")?;

    // build static library -> /usr/local/lib
    let lib_dir = out_dir.join("usr").join("local").join("lib");
    // include_dir -> /usr/local/include
    let include_dir = out_dir.join("usr").join("local").join("include");

    Ok(Artifacts {
        lib_dir,
        include_dir,
    })
}
```

And with this simple function, trust me or not, you'll have a static library and an include directory for your C code.

But, if you're not as lucky as me with samba, you'll have to read the next chapter.

### Masochistic C compilation

So let's say you have mastodontic C project which for some reason **won't build any static library**, but **only shared ones**.

Well... in that case you'll have to **build the static library by yourself**, but don't worry, it's a long process, but not that hard actually.

![pain-harold](./hide-the-pain-harold.gif)

Generally, the configure part is the same as before, but the make part will be different.

**If your make command produces the shared object, you'll have to execute it anyway**.

At that point you'll have to get a list of all the **object files required to build the shared object**. I won't tell you exactly how to do it, because there are many ways to do it, some people say to use `objdump` or `ldd`, but many times it won't work.

If nothing works, a good alternative is to run the make command with `-V=1` argument, redirect the output to a file and then parse the output with a script to get the **list of object files**, like this one:

```python
filename = argv[1]

with open(filename, "r") as f:
    lines = f.readlines()

    objects = []

    for line in lines:
        # get if building lib
        if "-Wl,--as-needed" in line:
            # split by ','
            tokens = line.split(",")
            for token in tokens:
                # strip "'"
                token = token.strip().strip("'").strip('"')
                if token.endswith(".o"):
                    # keep only .c
                    end = token.find(".c")
                    token = token[: end + 2]
                    if token not in objects:
                        objects.append(token)

    for obj in objects:
        print(f'"{obj}",')

```

Sorry Rustaceans about the Python snippet, but I use it for these kind of tasks.

In case you've managed to get a list of objects that your make command is using, then we have everything we need to build the static library.

```rust
// list of objects to build
const OBJECTS: &[&str] = &[/* ... */];

pub fn try_build(&mut self) -> Result<Artifacts, String> {
    let target = &self.target.as_ref().ok_or("TARGET dir not set")?[..];
    let host = &self.host.as_ref().ok_or("HOST dir not set")?[..];
    let os = Self::os(target)?;
    let out_dir = self.out_dir.as_ref().ok_or("OUT_DIR not set")?;
    let build_dir = out_dir.join("build");

    if build_dir.exists() {
        fs::remove_dir_all(&build_dir).map_err(|e| format!("build_dir: {e}"))?;
    }

    let inner_dir = build_dir.join("src");
    fs::create_dir_all(&inner_dir).map_err(|e| format!("{}: {e}", inner_dir.display()))?;

    // get src at `inner_dir`
    let src_dir = todo!();

    // init cc
    let mut cc = cc::Build::new();
    cc.target(target).host(host).warnings(false).opt_level(2);
    let compiler = cc.get_compiler();
    let mut cc_env = compiler.cc_env();
    if cc_env.is_empty() {
        cc_env = compiler.path().to_path_buf().into_os_string();
    }

    // get ar
    let ar = cc.get_archiver();

    // configure
    let mut configure = Command::new("sh");
    configure.arg("./configure");
    configure.arg("--disable-python");
    configure.arg("--without-systemd");
    configure.arg("--without-ldb-lmdb");
    configure.arg("--without-ad-dc");
    configure.arg("--bundled-libraries=ALL");
    configure.arg("--without-libarchive");
    #[cfg(target_os = "macos")]
    configure.arg("--without-acl-support"); // not supported on mac
    configure.env("CC", cc_env);
    configure.env("AR", ar.get_program());

    let ranlib = cc.get_ranlib();
    let mut args = vec![ranlib.get_program()];
    args.extend(ranlib.get_args());
    configure.env("RANLIB", args.join(OsStr::new(" ")));
    configure.current_dir(&src_dir);

    // run configure
    self.run_command(configure, "configuring foo build")?;

    // make
    let make = self.cmd_make()?;
    make.current_dir(&src_dir);
    self.run_command(make, "building foo")?;

    // we use AR to build the static library
    let mut build_static = cc.get_archiver();
    build_static.arg("rcs");
    build_static.arg("libfoo.a");
    build_static.current_dir(&src_dir);

    // push object
    for object in OBJECTS {
        let path = inner_dir.join(object);
        build_static.arg(path.display().to_string());
    }

    // run ar
    self.run_command(build_static, "building static library")?;

    // include_dir -> ??? include/
    let include_dir = src_dir.join("include");

    Ok(Artifacts {
        lib_dir: src_dir,
        include_dir,
    })
}
```

And with that the hardest part is done, now we just have to add the `vendored` feature to our `foo` and `foo-sys` crates and to run the build script in the `foo-sys` crate.

## Running the build script

At this point we add a new `vendored` feature to our `foo-sys` crate:

```toml
[build-dependencies]
cc = { version = "1", optional = true }
foo-src = { version = "4.22.0", path = "../foo-src", optional = true }

[features]
vendored = ["dep:cc", "dep:foo-src"]
```

and in the `build.rs` we switch between the vendored build and the linking to the dynlib:

```rust
fn main() {
    #[cfg(feature = "vendored")]
    {
        build_vendored();
    }
    #[cfg(not(feature = "vendored"))]
    {
        build_normal();
    }
}

fn build_normal() {
    println!("cargo:rustc-link-lib=foo");
}

#[cfg(feature = "vendored")]
fn build_vendored() {
    let mut build = foo_src::Build::new();

    println!("building vendored foo library... this may take several minutes");
    let artifacts = build.build();
    println!("cargo:vendored=1");
    println!(
        "cargo:root={}",
        artifacts.lib_dir.parent().unwrap().display()
    );

    if !artifacts.lib_dir.exists() {
        panic!(
            "foo library does not exist: {}",
            artifacts.lib_dir.display()
        );
    }
    if !artifacts.include_dir.exists() {
        panic!(
            "foo include directory does not exist: {}",
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

Finally, let's also add the `vendored` feature to the `foo` crate:

```toml
[features]
vendored = ["foo-sys/vendored"]
```

And that's it! Now you can build your project with the `vendored` feature and the C library will be statically linked to your binary.

Good luck with the compilation!

![segfault](segfault.gif)

## Extra - About including sources

In general there are **two options for including the C code** into the `-src` crate:

1. Using **git submodules**
2. **Cloning** the git repository **during the build process**

For instance `openssl-src` opts for the first, but you cannot always opt for that. For instance, with samba I couldn't do that, because the samba repository is huge and literally crates.io rejected the crate because of the size.

So in case, here's the code to clone the repo in the `lib.rs` if you need it (the example uses samba):

```toml
[dependencies]
git2 = "0.20"
```

```rust
/// Clone samba repository to the given path and checkout the tag
fn clone_samba(p: &Path) -> Result<(), String> {
    let repo_url = "https://git.samba.org/samba.git";
    let repo = git2::Repository::clone(repo_url, p).map_err(|e| format!("cloning samba: {e}"))?;

    // checkout tag "samba-4.22.0"
    let tag = format!("samba-{}", version());
    let obj = repo
        .revparse_single(&tag)
        .map_err(|e| format!("revparse_single: {e}"))?;

    let commit = obj
        .peel_to_commit()
        .map_err(|e| format!("peel_to_commit: {e}"))?;

    repo.checkout_tree(&obj, None)
        .map_err(|e| format!("checkout_tree: {e}"))?;

    repo.set_head_detached(commit.id())
        .map_err(|e| format!("set_head_detached: {e}"))?;

    Ok(())
}
```

So in this case, the src_dir will be the path passed to `clone_samba`.

## Extra - Linking static libraries dependencies

In some cases, such as samba you also depend on other libraries, such as `libtalloc`, `libtevent`, `libtdb` and so on.

In these cases, you'll have to link these libraries to your static library.

So in your `build.rs` for `foo-sys` you'll have to add the directives to link those libraries as well:

```rust
fn build_vendored() {
    // ...
    add_library("icuuc", "icu4c");
    add_library("gnutls", "gnutls");
    add_library("bsd", "libbsd");
    add_library("resolv", "libresolv");
    // ...
}

fn add_library(lib: &str, brew_name: &str) {
    // search lib with pkg-config and try static
    match pkg_config::Config::new()
        .statik(true)
        .cargo_metadata(true)
        .probe(lib)
    {
        Ok(_) => {
            if cfg!(target_os = "macos") {
                if cfg!(target_arch = "aarch64") {
                    println!("cargo:rustc-link-search=/opt/homebrew/opt/{brew_name}/lib");
                } else if cfg!(target_arch = "x86_64") {
                    println!("cargo:rustc-link-search=/usr/local/Homebrew/opt/{brew_name}/lib");
                }
                println!("cargo:rustc-link-lib={lib}");
            }
        }
        Err(_) => {
            println!("{lib} was not found with pkg_config; trying with LD_LIBRARY_PATH; but you may need to install it manually");
            // cross-finger and try dylib
            println!("cargo:rustc-link-lib={lib}");
        }
    };
}
```

In this case I'm also using pkg-config to find the library and I also try to link them statically, but in case it doesn't work, I fallback to dynamic linking.

## Extra - Loading embedded shared objects?

When I was working on vendoring libsmbclient I was about to give up because I couldn't get the static library to build, so I also thought that there could be a way to vendoring the shared object.

For those who don't know you, if you want to run a binary linked with a shared object, you need the same shared object in the system, **so binaries become much less portable**.

An idea that came to my mind was to put the shared object in a known path to the project and then in the source code to embed the shared object with `include_bytes!()` and then like create a function to initialize the library which would have loaded the shared object from the bytes using [libloading](https://docs.rs/libloading/latest/libloading/index.html).

So it would have been something like that

```rust
const LIBSMBCLIENT: &[u8] = include_bytes!("libsmbclient.so");

fn init_libsmbclient() {
    let lib = tempfile::NamedTempFile::new().unwrap();
    lib.write_all(LIBSMBCLIENT).unwrap();
    let lib = libloading::Library::new(lib.path()).unwrap();
}
```

Or something like that. I've got no idea if it works, I will maybe try that in the future.

If some of you knows if it works, please email me at  
[christian.visintin at veeso.dev](mailto:christian.visintin@veeso.dev), because it would be a great solution for vendoring shared objects.

![science-lab](./science-lab.gif)

## Conclusions

So that's it, I hope this guide **will help you to vendor your C/C++ dependencies in Rust** and I hope it becomes a reference for the future, maybe **linked/copied somewhere in some Rust book**. You can do it, as long as I'm credited.

### References

- [libloading](https://docs.rs/libloading/latest/libloading/index.html)
- [openssl-sys build](https://github.com/sfackler/rust-openssl/blob/master/openssl-sys/build/main.rs#L47)
- [openssl-sys build vendored](https://github.com/sfackler/rust-openssl/blob/master/openssl-sys/build/find_vendored.rs)
- [pavao](https://github.com/veeso/pavao)
