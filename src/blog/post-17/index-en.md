---
date: '2024-07-17 17:30:00'
slug: 'announcing-termscp-015'
title: "Announcing termscp 0.15.0"
subtitle: "with many new features"
author: 'Christian Visintin'
featuredImage: ./featured.jpeg
lang: en
---

## What's new

So let's see what's new in this version 0.15 of termscp

### Fuzzy Search

The find command was a little bit rudimental; it had been introduced in one of the first versions of termscp and basically it has remained the same for a very long time. Finally, things have come to change.

Thanks to an issue reported by [Ktoks](https://github.com/veeso/termscp/issues/249) I've finally managed to introduce **🪄 Fuzzy search 🪄** to termscp.

![fuzzy-search-demo](./fuzzy-demo.gif)

### The find operation can be cancelled

Finally you're able to cancel the find operation if it takes too long with `<CTRL+C>`.

### Multi Pod support

In the last version of termscp, I've introduced the Kube protocol to explore the file system of a container inside a pod. Some of you have asked for an explorer to switch between the pods and containers inside the same namespace and treat them a single file system. Well, I've decided to satisfy your request, indeed termscp 0.15 finally supports multiple pods, seen as children of `/` and containers as children of the pod `/pod-name/container-name/path/to/file`.

## What's next - termscp 0.16

I'm also announcing what's have been planned for termscp 0.16. Actually
JUST
ONE
FEATURE.

### Multi host in termscp - this is big

#### What is multi-host

So currently termscp can only work with a remote in the following way

```txt
|-----------|           |--------|
|           | --------> |        |
| Localhost |           | Remote |
|           | <-------- |        |
|-----------|           |--------|
```

But, what if we could link two remotes?

```txt
|----------|           |----------|
|          | --------> |          |
| Remote A |           | Remote B |
|          | <-------- |          |
|----------|           |----------|
```

#### How it would work

Clearly, it is impossible to directly link two remotes, because they don't run termscp, but we could make termscp in two modes. One is as-is now with Localhost and Remotefs, and the other one would be like this

```txt
|----------|
|          |
| Remote A |
|          |
|----------|
  ^     |
  |     |
  |     |
  |     v
|-------------|           |----------|
|             | --------> |          |
| Host Bridge |           | Remote B |
|             | <-------- |          |
|-------------|           |----------|
```

So this would require a new trait like `HostBridge` to provide the same methods as the current `Host` and then we would implement a `RemoteHostBridge` which interacts with `remotefs` to the RemoteA which is mapped by the Host bridge.

#### Changes to UI

The explorer would remain exactly as-is, while the auth page would be split into two forms, one for panel A and one for panel B. Panel A among all the other protocols, must have as the first option `Localhost` to work as-is.

#### Critical aspects

There are a few open points for the UI:

- How do bookmarks behave when I load a bookmark? Should it be loaded in the last panel or in the first panel which is empty?
- What keybindings do we use to switch between the two views?

### When 0.16

This release will be released probably by the end of 2024.

---

I hope you enjoy using termscp, and if you encounter any issue, don't hesitate to report an issue on [github](https://github.com/veeso/termscp).
