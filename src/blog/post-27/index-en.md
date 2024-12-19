---
date: '2025-01-06 10:15:00'
slug: 'a-journey-into-file-transfer-protocols-in-rust'
title: 'A journey into File Transfer Protocols in Rust'
subtitle: 'How basically I became a file transfer protocol expert in Rust'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
draft: true
---

## How it started

I can for sure affirm that you've used File transfer protocols before. Let's exclude HTTP from here, because, of course it is currently used also to transfer files, but it's not bi-directional and it mostly a workaround added at a certain time with HTTP/2. But I'm sure that you've used FTP at least once, or SFTP or if you're into AWS things, S3.

Even if everyone of us has used these protocols, we usually don't care much about how they work, and not very often we need to use a client for these protocols, even more unlikely to implement a client by scratch.

But I had to. Why? Not because I meant to implement one by myself, but because of this:

![winscp](./winscp.webp)

I don't know if you've ever heard of **WinSCP**, but it is a GUI file transfer client for Windows with support for SFTP and FTP basically.

So let's step back. It's December 2020 and I've been using Rust for almost one year, as a hobbyst only at the time and I've just found out of [tui-rs](https://github.com/fdehau/tui-rs).

At the time I had to work a lot with **SFTP**, because I worked in embedded development and I quite often needed to upload compiled applications on the devices, and I could have used WinSCP. There were just two problems:

1. **WinSCP** is, as the name suggests, for **Windows** only.
2. I'm not a GUI fan. I think that GUIs make developers' jobs slower, while the terminal makes everything fast (I still don't use NeoVim tho').

So on that day of December 2020, I started to work on [termscp](https://github.com/veeso/termscp).

## What is termscp

So from the Github repo

> termscp is a feature rich terminal file transfer and explorer, with support for SCP/SFTP/FTP/Kube/S3/WebDAV.

So yeah, at the origin the idea was to replicate WinSCP on the terminal. But time has passed and probably termscp is now much more evolved than WinSCP is. There is support for basically every existing file transfer protocol, but the concept of `file transfer` is actually not expressing well enough what termscp has become.

Termscp is **more than just a simple file transfer**, it has become a remote file system explorer.

It provides the same functionalities Nautilus provides, and **even more actually**, but with the possibility to operate on both localhost and a remote host, creating a channel between them, and even if between two different remote file systems.

But creating termscp has never been simple. Creating rich stateful terminal user interfaces it's not simple, so I came up with [tui-realm](https://github.com/veeso/tui-realm), but that's a topic for another article. But even harder was **creating a client capable of operating with several protocols** to operate on the remote file system.

## Abstraction was required

The idea has always been to support more than just a protocol. I decided to start with `SFTP`, basically for two reasons:

1. it was the protocol that most fit with my needs (or at least so I thought).
2. the client was apparently quite simple to implement.

So I decided that my `Activity` (which is the Model for a view in termscp - yeah, the idea was stolen from **Android**) would have a client field, defined as this in the first termscp version:

```rust
pub trait FileTransfer {
    /// Connect to the remote server
    /// Can return banner / welcome message on success
    fn connect(
        &mut self,
        address: String,
        port: u16,
        username: Option<String>,
        password: Option<String>,
    ) -> Result<Option<String>, FileTransferError>;

    /// Disconnect from the remote server
    fn disconnect(&mut self) -> Result<(), FileTransferError>;

    /// Indicates whether the client is connected to remote
    fn is_connected(&self) -> bool;

    /// Print working directory
    fn pwd(&mut self) -> Result<PathBuf, FileTransferError>;

    /// Change working directory
    fn change_dir(&mut self, dir: &Path) -> Result<PathBuf, FileTransferError>;

    /// List directory entries
    fn list_dir(&mut self, path: &Path) -> Result<Vec<FsEntry>, FileTransferError>;

    /// Make directory
    /// You must return error in case the directory already exists
    fn mkdir(&mut self, dir: &Path) -> Result<(), FileTransferError>;

    /// Remove a file or a directory
    fn remove(&mut self, file: &FsEntry) -> Result<(), FileTransferError>;

    /// Rename file or a directory
    fn rename(&mut self, file: &FsEntry, dst: &Path) -> Result<(), FileTransferError>;

    /// Stat file and return FsEntry
    fn stat(&mut self, path: &Path) -> Result<FsEntry, FileTransferError>;

    /// Send file to remote
    /// File name is referred to the name of the file as it will be saved
    /// Data contains the file data
    /// Returns file and its size
    fn send_file(&mut self, local: &FsFile, file_name: &Path) -> Result<Box<dyn Write>, FileTransferError>;

    /// Receive file from remote with provided name
    /// Returns file and its size
    fn recv_file(&mut self, file: &FsFile) -> Result<Box<dyn Read>, FileTransferError>;

    /// Finalize send method.
    /// This method must be implemented only if necessary; in case you don't need it, just return `Ok(())`
    /// The purpose of this method is to finalize the connection with the peer when writing data.
    /// This is necessary for some protocols such as FTP.
    /// You must call this method each time you want to finalize the write of the remote file.
    fn on_sent(&mut self, writable: Box<dyn Write>) -> Result<(), FileTransferError>;

    /// Finalize recv method.
    /// This method must be implemented only if necessary; in case you don't need it, just return `Ok(())`
    /// The purpose of this method is to finalize the connection with the peer when reading data.
    /// This mighe be necessary for some protocols.
    /// You must call this method each time you want to finalize the read of the remote file.
    fn on_recv(&mut self, readable: Box<dyn Read>) -> Result<(), FileTransferError>;
}
```

And my `FileTransferActivity` had this field in its definition:

```rust
struct FileTransferActivity {
// ...
    client: Box<dyn FileTransfer>
// ...
}
```

> What is actually incredible, it's that after over than 4 years since the release of the first version, most of the code base is still the same.

So defined the `FileTransfer` trait, at this point I just had to implement `SftpFileTransfer`.

And starting from `SFTP`, I kept implementing the others protocols starting from `SCP`.

> Why is SCP required? Well, old devices, such as the SBC we used at my previous workplace, which run on Linux 2.14, didn't support SFTP, so in that case the only vialable option is SCP, which doesn't actually expose anything but read and write operation on file. So when we talk about SCP file explorer, we actually talk about a mix of SCP for get and put operations and SSH for anything else. And of course SSH commands output need to be parsed.

But implementing clients for the other protocols was immediately challenging; why you may ask. Well, let's say that Rust file transfer protocol libraries are... _not a priority_.

## The status of file transfer protocol libraries in Rust

So at the end of 2020, when I started to implement file transfer protocols into termscp, I faced a not trivial challenge: find the libraries.

So at the time the situation was more or less the following:

### SFTP

SFTP was probably the easiest library to bridge, because support for the protocol is provided by [ssh2](https://docs.rs/ssh2/latest/ssh2/).
The ssh2 library is great, and it's actually directly implemented by devs involved in the development of the rust core project.
The only cons is it fully relies on the libssh2 C library.

Currently a new Rust native SSH library - [russh](https://github.com/Eugeny/russh) - is being implemented,
so in the future the client could be changed to depend on it.

The implementation for this library was quite simple, even if over time I people
asking me to make it able to rely on the ssh2 config file (i.e. `~/.ssh/config`), so I implemented a library called
[ssh2-config](https://github.com/veeso/ssh2-config).

### SCP

As I said before SCP it provides just `recv` and `send` operations, which are basically `read` and `write` operations.

But if you gave a look at the `FileTransfer` trait, you'll have noticed that many other functionalities are exposed.
And so all these functionalities require shell commands to be achieved,
and since both SCP and SFTP rely on SSH, we can always have a shell.

So basically everything relies on this function

```rust
/// Perform shell command in current SSH session
pub fn perform_shell_cmd<S: AsRef<str>>(session: &mut Session, cmd: S) -> RemoteResult<String> {
    // Create channel
    trace!("Running command: {}", cmd.as_ref());
    let mut channel = match session.channel_session() {
        Ok(ch) => ch,
        Err(err) => {
            return Err(RemoteError::new_ex(
                RemoteErrorType::ProtocolError,
                format!("Could not open channel: {err}"),
            ))
        }
    };
    // Execute command
    if let Err(err) = channel.exec(cmd.as_ref()) {
        return Err(RemoteError::new_ex(
            RemoteErrorType::ProtocolError,
            format!("Could not execute command \"{}\": {}", cmd.as_ref(), err),
        ));
    }
    // Read output
    let mut output: String = String::new();
    match channel.read_to_string(&mut output) {
        Ok(_) => {
            // Wait close
            let _ = channel.wait_close();
            trace!("Command output: {}", output);
            Ok(output)
        }
        Err(err) => Err(RemoteError::new_ex(
            RemoteErrorType::ProtocolError,
            format!("Could not read output: {err}"),
        )),
    }
}
```

And since sometimes we need to read the RC, I had to implement this ugly command where you echo `$?` at the end of the execution:

```rust
/// Perform shell command and collect return code and output
pub fn perform_shell_cmd_with_rc<S: AsRef<str>>(
    session: &mut Session,
    cmd: S,
) -> RemoteResult<(u32, String)> {
    let output = perform_shell_cmd(session, format!("{}; echo $?", cmd.as_ref()))?;
    if let Some(index) = output.trim().rfind('\n') {
        trace!("Read from stdout: '{}'", output);
        let actual_output = (output[0..index + 1]).to_string();
        trace!("Actual output '{}'", actual_output);
        trace!("Parsing return code '{}'", output[index..].trim());
        let rc = match u32::from_str(output[index..].trim()).ok() {
            Some(val) => val,
            None => {
                return Err(RemoteError::new_ex(
                    RemoteErrorType::ProtocolError,
                    "Failed to get command exit code",
                ))
            }
        };
        debug!(r#"Command output: "{}"; exit code: {}"#, actual_output, rc);
        Ok((rc, actual_output))
    } else {
        match u32::from_str(output.trim()).ok() {
            Some(val) => Ok((val, String::new())),
            None => Err(RemoteError::new_ex(
                RemoteErrorType::ProtocolError,
                "Failed to get command exit code",
            )),
        }
    }
}
```

If you think it's one of the worst thing you've ever seen, you're right, but it's also how all the
file transfers using SCP work.

So the entire library is execute this shell command and parse the output. Probably this one was the hardest to implement,
but it works somehow.

BIG BRAINS

### FTP

At the beginning of 2021, FTP was provided by [ftp](https://docs.rs/ftp/latest/ftp/).

Unfortunately though, the library was totally unmaintained at the time, it had several security
issues and it missed many ftp commands and functionalities.

So I decided to do the more obvious thing to do: I adopted it.

[suppaftp](https://github.com/veeso/suppaftp) was born!

![suppaftp logo](./suppaftp.webp)

Since then, many releases have come and I, with the help of the community,
have implemented all the missing commands, the async client and in 2023 we managed to classify through
the audit the original ftp library **unsafe** and suppaftp has raised as the standard ftp library for Rust basically.

Suppaftp has also recently **reached 1 Million of downloads**, so it's been a great achievement for my open-source career.

ELON MUSK GIF

### SMB

If you think I had struggled a lot with FTP, you're right, but never as much as for SMB.

#### SMB for Windows

For Windows I actually found out that SMB is natively supported by the Operating system, which means that you can access
a SMB share like it was a file on Windows.

If you're interested in accessing SMB shares on Windows with Rust,
you can check this article: [How to access an SMB share with Rust on Windows](https://blog.veeso.dev/blog/en/how-to-access-an-smb-share-with-rust-on-windows/) from my blog.

VIOLIN FEELS GOOD

#### SMB for Linux/MacOs

In this case SMB requires a library, like for any other protocol.
So I started to implement a native Rust library for SMB in 2021, because I didn't want to rely on **libsmbclient**.

The main reason for that is that I dind't want to force termscp user to install it on their system to work with SMB,
because we all know: installing C libraries it's always _an interesting experience_.

So I started to go through the entire SMB protocol spec, but I gave up after one month.
The protocol is extremely complicated and the benefits would probably not compensate the effort put in implementing it.

So, eventually after two years, I decided to rely on libsmbclient C bindings of course and implement a Rust friendly library.

And so here you go with [Pavao](https://github.com/veeso/pavao) - **A Rust client library for SMB 🦚**.

![pavao logo](./pavao.webp)

And if you think the logo comes from Pavé from Animal Crossing, you're right.

In the readme you can find this:

```txt
Pavão |> Pavé |> Animal Crossing |> Carnival |> Rio De Janeiro |> Samba |> SMB
```

In Italian they called Pavé "Pavão", so that explains the name.

![pavao](./pavao.gif)

But going back to the library, people are currently happy with that,
but I'd really love to have a rust native library for SMB,
so in case you're interested my original branch with the
native version is still there on the [native-client branch](https://github.com/veeso/pavao/tree/native-client).

### AWS S3

This will be short:

> In 2020 AWS implementation far from being stable.
> I had to rely on community libs, now it has become stable.
> Now AWS SDK is stable

![feels-good](./feels-good.gif)

That's a lie though! I still have to migrate to the AWS SDK 😅

### WebDAV

Really, who uses WebDAV? Do you even know what WebDAV is? I do even know what WebDAV is?

Probably not, but I implemented the client anyway.

Oh, there's actually an [RFC](https://www.rfc-editor.org/rfc/rfc4918) for it!

Unfortunately, the existing library for Rust _didn't work_, so

1. I created a [pr](https://github.com/d-k-bo/webdav-rs/pull/1).
2. The PR was rejected
3. I took the code and I embedded into my WebDAV client.
4. Stonks

### Kube

Kube has been one of the funniest and most interesting implementation I worked on.

Luckily the support for Kube is very good, thanks to the [kube](https://crates.io/crates/kube) crate.

The first implementation allowed the user to connect to a single container inside a certain pod, but in 0.2.0
I managed to implement something extremely cool, which is mounting a kube namespace as a file system, which means that
this could provide a "file system" with this structure:

```txt
/
    /pod-a
        /container-a
            /bin
            ...
            /tmp
        /container-b
            /bin
            ...
            /tmp
    /pod-b
        /container-a
            /bin
            ...
            /tmp
        /container-b
            /bin
            ...
            /tmp
```

but this a story for another time (maybe?).

## A need for a remotefs interface

But basically of this at the time was embedded into termscp, which led to two issues:

1. The termscp codebase as huge
2. Nobody could take advantage of this file transfer abstraction

so I started receiving from different users on Github requests to migrate the file transfer trait and clients into a separate project, more focused on a different concept, compared to the existing `FileTransfer`, and this core concept was: **Remote FS**.

The idea was to base everything on the `std::fs` library to build the `RemoteFs` trait and types.

So I wrote after a few days the trait for `RemoteFs`:

```rust
/// Defines the methods which must be implemented in order to setup a Remote file system
pub trait RemoteFs {
    /// Connect to the remote server and authenticate.
    /// Can return banner / welcome message on success.
    /// If client has already established connection, then `AlreadyConnected` error is returned.
    fn connect(&mut self) -> RemoteResult<Welcome>;

    /// Disconnect from the remote server
    fn disconnect(&mut self) -> RemoteResult<()>;

    /// Gets whether the client is connected to remote
    fn is_connected(&mut self) -> bool;

    /// Get working directory
    fn pwd(&mut self) -> RemoteResult<PathBuf>;

    /// Change working directory.
    /// Returns the realpath of new directory
    fn change_dir(&mut self, dir: &Path) -> RemoteResult<PathBuf>;

    /// List directory entries at specified `path`
    fn list_dir(&mut self, path: &Path) -> RemoteResult<Vec<File>>;

    /// Stat file at specified `path` and return Entry
    fn stat(&mut self, path: &Path) -> RemoteResult<File>;

    /// Set metadata for file at specified `path`
    fn setstat(&mut self, path: &Path, metadata: Metadata) -> RemoteResult<()>;

    /// Returns whether file at specified `path` exists.
    fn exists(&mut self, path: &Path) -> RemoteResult<bool>;

    /// Remove file at specified `path`.
    /// Fails if is not a file or doesn't exist
    fn remove_file(&mut self, path: &Path) -> RemoteResult<()>;

    /// Remove directory at specified `path`
    /// Directory is removed only if empty
    fn remove_dir(&mut self, path: &Path) -> RemoteResult<()>;

    /// Removes a directory at this path, after removing all its contents. **Use carefully!**
    ///
    /// If path is a `File`, file is removed anyway, as it was a file (after all, directories are files!)
    ///
    /// This function does not follow symbolic links and it will simply remove the symbolic link itself.
    ///
    /// ### Default implementation
    ///
    /// By default this method will combine `remove_file` and `remove_file` to remove all the content.
    /// Implement this method when there is a faster way to achieve this
    fn remove_dir_all(&mut self, path: &Path) -> RemoteResult<()> {
        if self.is_connected() {
            let path = crate::utils::path::absolutize(&self.pwd()?, path);
            debug!("Removing {}...", path.display());
            let entry = self.stat(path.as_path())?;
            if entry.is_dir() {
                // list dir
                debug!(
                    "{} is a directory; removing all directory entries",
                    entry.name()
                );
                let directory_content = self.list_dir(entry.path())?;
                for entry in directory_content.iter() {
                    self.remove_dir_all(entry.path())?;
                }
                trace!(
                    "Removed all files in {}; removing directory",
                    entry.path().display()
                );
                self.remove_dir(entry.path())
            } else {
                self.remove_file(entry.path())
            }
        } else {
            Err(RemoteError::new(RemoteErrorType::NotConnected))
        }
    }

    /// Create a directory at `path` with specified mode.
    fn create_dir(&mut self, path: &Path, mode: UnixPex) -> RemoteResult<()>;

    /// Create a symlink at `path` pointing at `target`
    fn symlink(&mut self, path: &Path, target: &Path) -> RemoteResult<()>;

    /// Copy `src` to `dest`
    fn copy(&mut self, src: &Path, dest: &Path) -> RemoteResult<()>;

    /// move file/directory from `src` to `dest`
    fn mov(&mut self, src: &Path, dest: &Path) -> RemoteResult<()>;

    /// Execute a command on remote host if supported by host.
    /// Returns command exit code and output (stdout)
    fn exec(&mut self, cmd: &str) -> RemoteResult<(u32, String)>;

    /// Open file at `path` for appending data.
    /// If the file doesn't exist, the file is created.
    ///
    /// ### ⚠️ Warning
    ///
    /// metadata should be the same of the local file.
    /// In some protocols, such as `scp` the `size` field is used to define the transfer size (required by the protocol)
    fn append(&mut self, path: &Path, metadata: &Metadata) -> RemoteResult<WriteStream>;

    /// Create file at path for write.
    /// If the file already exists, its content will be overwritten
    ///
    /// ### ⚠️ Warning
    ///
    /// metadata should be the same of the local file.
    /// In some protocols, such as `scp` the `size` field is used to define the transfer size (required by the protocol)
    fn create(&mut self, path: &Path, metadata: &Metadata) -> RemoteResult<WriteStream>;

    /// Open file at specified path for read.
    fn open(&mut self, path: &Path) -> RemoteResult<ReadStream>;

    /// Finalize `create_file` and `append_file` methods.
    /// This method must be implemented only if necessary; in case you don't need it, just return `Ok(())`
    /// The purpose of this method is to finalize the connection with the peer when writing data.
    /// This is necessary for some protocols such as FTP.
    /// You must call this method each time you want to finalize the write of the remote file.
    ///
    /// ### Default implementation
    ///
    /// By default this function returns already `Ok(())`
    fn on_written(&mut self, _writable: WriteStream) -> RemoteResult<()> {
        Ok(())
    }

    /// Finalize `open_file` method.
    /// This method must be implemented only if necessary; in case you don't need it, just return `Ok(())`
    /// The purpose of this method is to finalize the connection with the peer when reading data.
    /// This might be necessary for some protocols.
    /// You must call this method each time you want to finalize the read of the remote file.
    ///
    /// ### Default implementation
    ///
    /// By default this function returns already `Ok(())`
    fn on_read(&mut self, _readable: ReadStream) -> RemoteResult<()> {
        Ok(())
    }

    /// Blocking implementation of `append`
    /// This method **SHOULD** be implemented **ONLY** when streams are not supported by the current file transfer.
    /// The developer using the client should FIRST try with `create` followed by `on_written`
    /// If the function returns error of kind `UnsupportedFeature`, then he should call this function.
    /// In case of success, returns the amount of bytes written to the remote file
    ///
    /// ### Default implementation
    ///
    /// By default this function uses the streams function to copy content from reader to writer
    fn append_file(
        &mut self,
        path: &Path,
        metadata: &Metadata,
        mut reader: Box<dyn Read + Send>,
    ) -> RemoteResult<u64> {
        if self.is_connected() {
            trace!("Opened remote file");
            let mut stream = self.append(path, metadata)?;
            let sz = io::copy(&mut reader, &mut stream)
                .map_err(|e| RemoteError::new_ex(RemoteErrorType::ProtocolError, e.to_string()))?;
            self.on_written(stream)?;
            trace!("Written {} bytes to destination", sz);
            Ok(sz)
        } else {
            Err(RemoteError::new(RemoteErrorType::NotConnected))
        }
    }

    /// Blocking implementation of `create`
    /// This method SHOULD be implemented ONLY when streams are not supported by the current file transfer.
    /// The developer using the client should FIRST try with `create` followed by `on_written`
    /// If the function returns error of kind `UnsupportedFeature`, then he should call this function.
    /// In case of success, returns the amount of bytes written to the remote file
    ///
    /// ### Default implementation
    ///
    /// By default this function uses the streams function to copy content from reader to writer
    fn create_file(
        &mut self,
        path: &Path,
        metadata: &Metadata,
        mut reader: Box<dyn Read + Send>,
    ) -> RemoteResult<u64> {
        if self.is_connected() {
            let mut stream = self.create(path, metadata)?;
            trace!("Opened remote file");
            let sz = io::copy(&mut reader, &mut stream)
                .map_err(|e| RemoteError::new_ex(RemoteErrorType::ProtocolError, e.to_string()))?;
            self.on_written(stream)?;
            trace!("Written {} bytes to destination", sz);
            Ok(sz)
        } else {
            Err(RemoteError::new(RemoteErrorType::NotConnected))
        }
    }

    /// Blocking implementation of `open`
    /// This method SHOULD be implemented ONLY when streams are not supported by the current file transfer.
    /// (since it would work thanks to the default implementation)
    /// The developer using the client should FIRST try with `open` followed by `on_sent`
    /// If the function returns error of kind `UnsupportedFeature`, then he should call this function.
    /// In case of success, returns the amount of bytes written to the local stream
    ///
    /// ### Default implementation
    ///
    /// By default this function uses the streams function to copy content from reader to writer
    fn open_file(&mut self, src: &Path, mut dest: Box<dyn Write + Send>) -> RemoteResult<u64> {
        if self.is_connected() {
            let mut stream = self.open(src)?;
            trace!("File opened");
            let sz = io::copy(&mut stream, &mut dest)
                .map_err(|e| RemoteError::new_ex(RemoteErrorType::ProtocolError, e.to_string()))?;
            self.on_read(stream)?;
            trace!("Copied {} bytes to destination", sz);
            Ok(sz)
        } else {
            Err(RemoteError::new(RemoteErrorType::NotConnected))
        }
    }

    /// Find files from current directory (in all subdirectories) whose name matches the provided search
    /// Search supports wildcards ('?', '*')
    #[cfg(feature = "find")]
    fn find(&mut self, search: &str) -> RemoteResult<Vec<File>> {
        match self.is_connected() {
            true => {
                // Starting from current directory, iter dir
                match self.pwd() {
                    Ok(p) => self.iter_search(p.as_path(), &WildMatch::new(search)),
                    Err(err) => Err(err),
                }
            }
            false => Err(RemoteError::new(RemoteErrorType::NotConnected)),
        }
    }
}
```

So if we exclude some functions such as `find` and `connect/disconnect` which are related to remote connection and utilities,
these function look a lot like the `std::fs` module.

There are of course several differences, such as:

1. no use of `std::io::Error`: the reason in this case is that file transfer protocols should allow a more extended error type
2. No platform specific: everything is implemented for _extended_ systems, which basically means _POSIX-derived systems_, indeed the `Metadata` types contain the `UnixPex`, which are the classic UNIX style file permissions. This is done because in any case we should consider that most of the servers running file transfer protocols, run on GNU/Linux, more than Windows; and feature gating wasn't a great idea, neither was to have two variants for `Metadata`.

So, we've almost reached the end of this story and everything I've mentioned so far can be found in the [remotefs](https://github.com/remotefs-rs) project.

There's just one problem that still needs to be solved: **RemoteFs isn't really a File system yet**.

## remotefs-FUSE: Making Remote-fs actually a FS

So in the last months of 2024 I started to wonder whether it could be possible to mount a remote file system on the local file system. And so I came across [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace), which is a Unix kernel module that allows non-privileged users to create their own file systems without editing the kernel code.

With that now I could start implementing my library to mount a file system using FUSE and the remote-fs library.

So I started to work on [remotefs-fuse](https://github.com/remotefs-rs/remotefs-rs-fuse) and after one month of work, I managed to make it work and it is successfully able to mount a remote file system. It also comes with a handy **cli** tool to mount the file system using the different existing drivers.

You can checkout the cli tool from [crates.io](https://crates.io/crates/remotefs-fuse-cli).

And even if FUSE is only a Linux and MacOS thing, I came across [Dokany](https://github.com/dokan-dev/dokany) which basically does the same thing on Windows.

So currently the remotefs-fuse library is both compatible with Windows, Linux and MacOS.

Huge thanks to the authors of the [fuser](https://crates.io/crates/fuser) and [dokan](https://crates.io/crates/dokan) crates, which made this possible.

## The future of the remotefs project

There are actually many thing to come in the remotefs project. In the past years I've received many design suggestions
and feature requests, which were also kinda revolutionary in the API design.

At the moment in my opinion there are two things that need to be done:

- Stabilizing the FUSE implementation. FUSE is a very complex thing and it requires a lot of testing and debugging,
  and can be very dangerous if not implemented correctly. I know for sure that the Linux implementation is quite stable,
  but for example I have weird behaviour when using the `symlink` implementation of Rust. And the Windows implementation is
  much more unstable due to the complexity of the Dokany library, which requires many features that I can't exactly
  implement correctly when using the remotefs library.
- Going async: this often requested, but it's very problematic. Let's see why in details.

### Going async - it ain't easy

This part is quite related to what I wrote a couple of weeks ago in this article "[You don't (_always_) need async](https://blog.veeso.dev/blog/en/you-dont-always-need-async/)".

There are quite a few reasons why going async is not easy:

1. Async traits are still a pain

   So the first thing is that async traits are still a pain in Rust.
   Some things are just **complex** to achieve in the async world.

   Let's take the `open` function for instance:

   ```rust
   fn open(&mut self, path: &Path) -> RemoteResult<ReadStream>;
   ```

   or even worse:

   ```rust
   fn on_written(&mut self, _writable: WriteStream) -> RemoteResult<()>
   ```

   where these types are defined as:

   ```rust
   pub struct ReadStream {
       stream: StreamReader,
   }

   /// The kind of stream contained in the stream. Can be [`Read`] only or [`Read`] + [`Seek`]
   enum StreamReader {
       Read(Box<dyn Read + Send>),
       ReadAndSeek(Box<dyn ReadAndSeek>),
   }

   /// A trait which combines `io::Write` and `io::Seek` together
   pub trait WriteAndSeek: Write + Seek + Send {}

   /// The stream returned by [`crate::RemoteFs`] to write a file from the remote server
   pub struct WriteStream {
       pub stream: StreamWriter,
   }

   /// The kind of stream contained in the stream. Can be Write only or [`Write`] + [`Seek`]
   pub enum StreamWriter {
       Write(Box<dyn Write + Send>),
       WriteAndSeek(Box<dyn WriteAndSeek>),
   }
   ```

   These types in async are just a pain to manage, due to requirements async has, such as pinning etc.
   I tried, I think even different times but with no success.

2. Not all clients are async

   Okay, this is not a huge deal actually, but yeah. Some of the clients are not even async, such as the SFTP/SCP clients.

3. I'm not a huge fan of async in place of sync

   Listen up, sometimes async is just not needed. Not everyone needs async, and async requires tons of dependencies.
   Take **termscp** for instance. It is currently the biggest user of the remotefs library and it is not using async.
   And it's not because I'm lazy, but because it doesn't need it and I don't want to add dependencies that are not needed.

   So why should I migrate everything to async then?

   As I said in the article async currently doesn't provide any simple way to implement both the sync and async version.
   I would like to implement something to make this possible, but I'm quite busy right now.

   So I want async, but I want both versions. But having both versions requires me to have both versions for each client.
   And this is just a huge work.

![not going to be easy](./it's-not-gonna-be-easy-usain-bolt.gif)

## I'm looking for help

So yeah, I'm also looking for help on this. In particular there are three things to do:

1. Stabilize the FUSE/Dokany implementations
2. Migrate to AWS-SDK
3. Implement async

So whoever wants to help, feel free to open a PR on the [remotefs repos](https://github.com/remotefs-rs).

Thank you for reading this article, I hope you enjoyed it. If you have any questions, feel free to ask me on [X.com](https://x.com/veeso_dev).
