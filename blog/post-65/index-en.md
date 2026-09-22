---
date: "2026-09-22 16:25:00 Europe/Rome"
title: "Mount remote file systems locally, whatever the protocol, with Fusibile"
description: "Remote file systems are easy to use until you want them to behave like real file systems."
author: "veeso"
featured_image: featured.jpeg
category: rust-projects
reading_time: "6"
---

An SFTP client can download a file. An S3 client can list objects. A WebDAV client can create directories. But what if I simply want to run:

```bash
ls ~/remote
```

and have that directory actually be an SFTP server, an S3 bucket, or a Kubernetes pod?

That is what Fusibile does: it mounts remote file systems as local volumes, with support for SFTP, SCP, FTP, SMB, WebDAV, AWS S3, Google Cloud Storage, and Kubernetes.

Getting there, however, required a few layers.

## The RemoteFs project

Many years ago, I started working on [RemoteFs](https://github.com/remotefs-rs/remotefs-rs), a Rust library providing a common interface for file systems accessible through network protocols.

You can think of it as something similar to std::fs, except the files may live on an SFTP server, an FTP server, an S3 bucket, or somewhere completely different.

At its core there is the RemoteFs trait:

```rust
/// The blocking contract for a protocol-backed remote file system.
pub trait RemoteFs: Send + Sync {
    /// Connects to the remote server and authenticates the client.
    ///
    /// # Errors
    ///
    /// Returns a connection or authentication error when setup fails.
    fn connect(&mut self) -> RemoteResult<()>;

    /// Disconnects from the remote server.
    ///
    /// # Errors
    ///
    /// Returns [`crate::fs::RemoteErrorType::NotConnected`] when no connection exists.
    fn disconnect(&mut self) -> RemoteResult<()>;

    /// Returns the cached connection state without probing the transport.
    fn is_connected(&self) -> bool;

    /// Returns the operations natively supported by this client.
    fn capabilities(&self) -> Capabilities;

    /// Lists the direct children of an absolute directory path.
    ///
    /// # Errors
    ///
    /// Returns [`crate::fs::RemoteErrorType::InvalidPath`] for relative paths and the
    /// backend's lookup error when the directory cannot be listed.
    fn list_dir(&self, path: &Path) -> RemoteResult<Vec<File>>;

    /// Returns metadata for an absolute path without following symlinks.
    ///
    /// # Errors
    ///
    /// Returns [`crate::fs::RemoteErrorType::InvalidPath`] for relative paths and the
    /// backend's lookup error when the entry cannot be inspected.
    fn stat(&self, path: &Path) -> RemoteResult<File>;

    /// Reports whether an absolute path exists.
    ///
    /// A missing entry is `Ok(false)`; invalid paths and transport failures are
    /// returned as errors.
    fn exists(&self, path: &Path) -> RemoteResult<bool>;

    /// Changes the specified metadata fields of an absolute path.
    ///
    /// # Errors
    ///
    /// Returns [`crate::fs::RemoteErrorType::UnsupportedFeature`] when metadata changes
    /// are unavailable.
    fn set_metadata(&self, path: &Path, metadata: &SetMetadata) -> RemoteResult<()>;

    /// Creates a directory at an absolute path.
    ///
    /// The optional mode is ignored when POSIX permissions are unavailable.
    fn create_dir(&self, path: &Path, mode: Option<UnixPex>) -> RemoteResult<()>;

    /// Removes a file or symbolic link at an absolute path.
    fn remove_file(&self, path: &Path) -> RemoteResult<()>;

    /// Removes an empty directory at an absolute path.
    fn remove_dir(&self, path: &Path) -> RemoteResult<()>;

    /// Renames an absolute source path to an absolute destination path.
    fn rename(&self, src: &Path, dest: &Path) -> RemoteResult<()>;

    /// Copies an absolute source path to an absolute destination path.
    fn copy(&self, src: &Path, dest: &Path) -> RemoteResult<()>;

    /// Creates a symbolic link at `path` pointing to an absolute `target`.
    fn symlink(&self, path: &Path, target: &Path) -> RemoteResult<()>;

    /// Opens an absolute file path for a ranged read.
    fn open(&self, path: &Path, opts: &ReadOptions) -> RemoteResult<ReadStream>;

    /// Creates or truncates an absolute file path for writing.
    fn create(&self, path: &Path, opts: &WriteOptions) -> RemoteResult<WriteStream>;

    /// Opens or creates an absolute file path for appending.
    fn append(&self, path: &Path, opts: &WriteOptions) -> RemoteResult<WriteStream>;
}
```

The [remotefs](https://github.com/remotefs-rs/remotefs-rs) crate provides the trait and associated types, while individual crates implement clients for each protocol.

Up to September 2026, there are clients for the following protocols: SCP, SFTP, FTP, SMB, AWS-S3, Google Cloud Storage, Kube (Single-pod and multi-pod), and WebDAV.

There is also an asynchronous `AsyncRemoteFs` API, which is what Fusibile currently uses.

The nice part is that applications using RemoteFs don't really need to care about the protocol anymore. Once the client is initialized, listing a directory or opening a file uses the same interface regardless of where that file actually lives.

## RemoteFs was not really a filesystem

The problem with the library, though, is that even if it provides a good API for interacting with remote filesystems, some users felt it lacked truly transparent interaction between the local and remote filesystems.

The API was similar, but `remotefs::` was not `std::fs`.

This brought me to FUSE.

FUSE lets you implement a filesystem in userspace while exposing it to applications through the normal filesystem interface.

The kernel asks things such as:

> What files are in this directory?
> What are the attributes of this inode?
> Give me these bytes from this file.

Your program answers those requests.

What happens behind those operations is entirely up to you. The data could come from a disk, a database, an API, an SSH connection, or something completely virtual.

Which sounded suspiciously similar to what RemoteFs was already doing.

## Remotefs-fuse was born

With the capability of fuse, [macfuse](https://github.com/macfuse/macfuse) for MacOS, and their Windows counterpart [Dokany](https://github.com/dokan-dev/dokany/releases), I was able to implement [remotefs-fuse](https://github.com/remotefs-rs/remotefs-rs-fuse), which is a wrapper around any `RemoteFs` instance, providing `fuse` and `dokany` interaction for it.

```rust
pub struct Driver<T: RemoteFs> { 
    #[cfg(unix)]
    inner: Mutex<unix::DriverInner<T>>,
    #[cfg(windows)]
    remote: RwLock<T>,
    // ... 
}
```

So the FUSE layer doesn't need to know whether it is talking to SFTP, S3, SMB, or anything else.

It sees a RemoteFs.

This means that any application can take a RemoteFs client and expose it as a local filesystem without implementing a FUSE driver for every single protocol.

That solved the abstraction problem, but using the library still required writing a small Rust program to configure the backend and mount it.

So one last obvious step remained.

## Finally, Fusibile came to life

In late summer 2026, I decided to create a simple CLI tool that lets users mount any remote file system with a simple command-line interaction.

Fusibile comes with support for all the existing remote FS clients, which include SFTP, SCP, FTP, SMB, WebDAV, AWS S3, Google Cloud Storage, and Kube.

The tool is extremely simple to use:

```bash
fusibile --to <path> --volume <name> <PROTOCOL> [protocol_options]
```

For instance:

```bash
fusibile /tmp/raspberry --volume raspberry sftp --hostname 192.168.1.59 --username pi --password $RASPBERRY_PASSWORD
```

## Dealing with different GID and UID

One particularly annoying detail when turning a remote filesystem into a Unix filesystem is that users don't necessarily have the same UID and GID on both machines.

Imagine that my local user has UID 1000, but files returned by an SFTP server report UID 1002.

From FUSE's point of view, those files belong to somebody else, even though I authenticated to the remote server with credentials that are perfectly allowed to access them.

Fusibile therefore allows overriding the UID and GID used by the local permission checks:

```bash
fusibile \
    --to /tmp/raspberry \
    --volume raspberry \
    --uid "$(id -u)" \
    --gid "$(id -g)" \
    sftp \
    --hostname 192.168.1.59 \
    --username pi
```

This does not chown anything on the remote machine.

It simply bridges a semantic mismatch between the ownership information the remote protocol exposes and the user accessing the mounted filesystem locally.

There is also --default-mode for protocols where Unix permissions don't really exist at all — S3 being the obvious example.

Because, well, an object store was never supposed to pretend to be a POSIX filesystem.

But now it can.

## Conclusions

What started as a common interface for a few file-transfer protocols eventually became a fairly complete stack.

Fusibile is just the last layer that makes all of that usable without writing Rust code.

And I think that is what makes the project interesting: the operating system and applications don't need to understand SFTP, S3, Kubernetes, or whatever protocol is behind the mount.

To them, they are just files.

Fusible is still young, so I wouldn’t mount your only copy of irreplaceable data and immediately start stress-testing `rm -rf`.

You can install fusibile with a simple shell command:

```bash
curl -sSLf https://remotefs-rs.github.io/remotefs-rs-fuse/install.sh | sh
```

```powershell
irm https://remotefs-rs.github.io/remotefs-rs-fuse/install.ps1 | iex
```

Or visit the [project repository](https://github.com/remotefs-rs/remotefs-rs-fuse).
