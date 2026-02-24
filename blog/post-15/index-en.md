---
date: '2024-07-17 17:30:00'
slug: 'termscp-014-released'
title: 'termscp 0.14 has been released'
subtitle: 'come discover many brand new cool features'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: termscp
---

## It's been a long time

It's been 5 months since the last release of termscp came out, so yeah let's party for this new termscp release 🎉.

![train-party](./train-party.gif)

## what's new

So let's see what's new in this version 0.14 of termscp

### Ssh agent

I've received [many](https://github.com/veeso/termscp/issues/226), [many](https://github.com/veeso/termscp/issues/238) and [many others](https://github.com/veeso/termscp/issues/218) issues like [this](https://github.com/veeso/termscp/issues/226). And basically all of them were requesting the **ssh-agent** to be part of termscp. So finally here it is.

What does this mean?

It means that the SFTP/SCP client is now able to automatically use the connection parameters set in your system ssh configuration to resolve the authentication parameters to connect to a remote host.

So finally it is no more required to import keys and ssh configuration inside of termscp to be able to use the ssh configuration 🎉.

### Filter files in the current directory

Currently you could just search for file using `<F>`, which searched for file recursively, but this process takes some time and currently doesn't support regex.

From 0.14 you can use `</>` to filter files in the current directory. It both supports wildmatch and regex and it will support fuzzy search in the next version (0.15).

### Kube protocol

A new file transfer protocol has been added: **Kube**.

What does this mean? It means that you are now able to connect to a **pod's container** and interact with its file system.

For this implementation termscp relies on [kube-rs](https://github.com/kube-rs/kube) to provide the support for the protocol.

By default only the **pod and the container names** are required to connect, since termscp will automatically load the configuration from the environment. Otherwise you can also specify the cluster url, the namespace and other options.

I'm not familiar with kubernetes to be honest, so if you see some parameters are missing, please report an issue on Github and I'll be glad to extend the connection options.

#### Namespace, pod and container explorer

I probably know that you may expect termscp to provide a root view for the kube protocol to be able to select the namespace, the pod, the container and then finally the local fs path, but unfortunately at the moment you can only enter one container at the time.

**This change is to be expected for 0.15**, since I need to make a new side client for kube in [remotefs-kube](https://github.com/veeso/remotefs-rs-kube) to be able to interact with several pods at the same time.

### Minor changes

- From now on, after selecting a file in the explorer, the cursor will jump to the next entry
- You can now deselect all the selected entries in the explorer with `ALT+A`
- Fixed an issue where `@` wasn't allowed in the username when passing the remote argument to the CLI args.

### Dropped support for RPM

Sigh, I had to.

Unfortunately since the first of July 2024, it's impossible to use the centos 7, or any other centos image, I used to build the RPM package.

There is fedora, but unfortunately I'm unable to make it work. I've opened an [issue to track this](https://github.com/veeso/termscp/issues/269), but don't expect to see it fixed soon. If you manage to build on fedora, please submit a PR.

---

I hope you enjoy using termscp, and if you encounter any issue, don't hesitate to report an issue on [github](https://github.com/veeso/termscp).
