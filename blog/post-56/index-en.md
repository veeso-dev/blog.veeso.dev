---
date: '2026-03-27 15:00:00 Europe/Rome'
title: 'Is RustRover Worth It? My 3-Month Review'
description: 'After 3 months of using RustRover, I share my thoughts on whether it's worth the investment for Rust developers.'
author: 'veeso'
featured_image: featured.jpeg
category: software-engineering
reading_time: '6'
---

> TL;DR:
> Great Rust support, but frustrating editor UX and weak Git experience.
> Worth trying if you're already in the JetBrains ecosystem.

Over the last year, I’ve heard many people talking about RustRover, and JetBrains has sponsored many conferences to promote their Rust IDE, so I started to get curious about trying it out.

Honestly, I’m not the kind of person who likes to try new IDEs; instead, I’m really uncomfortable trying new tools, but since I saw many people were happy with it, I decided to try it.

> A Premise: I’ve used Visual Studio Code for 6/7 years so far, across several programming languages, and have basically never used any other IDE since then, except Android Studio and XCode for a couple of mobile app projects.

After 3 months of usage of RustRover, I’ve actually decided to abandon it and switch back to Visual Studio Code, but this won’t be necessarily a negative review, I think the product has many good features, and in the future it will probably become even better, so I don’t even want to exclude that I may retake it in the next years.

## The Good

I want to start with the good features Rust Rover has, and as I will show you now, I think it’s actually very good at working with Rust code, and in general, it performs very well even on huge codebases, but let’s see in detail now.

### The Rust Language experience

Of course, the IDE works very well with the language—that’s really where RustRover shines the most.

Performance is solid even on larger codebases, and the overall responsiveness feels reliable. Auto-completion is accurate and fast, but more importantly, it’s context-aware. It handles generics and traits surprisingly well, which is something that often breaks down in other editors when things get more complex.

For instance, when working with deeply nested generics or trait bounds, suggestions remain relevant instead of becoming noisy or useless. It also does a good job at understanding associated types and trait implementations, which makes navigating abstractions much easier.

Another thing I appreciated is how the IDE helps you reason about your code structure. It highlights duplicated logic that could be extracted into shared functions—even across crates in the same workspace. This can be really helpful when refactoring, although it can feel a bit too eager at times. For example, it may suggest extracting very similar match blocks that are technically reusable but not necessarily worth abstracting.

Overall, the Rust-specific experience feels polished and intentional, and you can tell it was designed with real-world Rust projects in mind rather than being a generic language plugin.

### Copy-paste

One of the best features is that whenever you copy code from one file to another, it automatically imports the types from the source file, so the pasted code works. This feature is really good, but it can also be annoying, actually. If you want, for instance, to copy a boilerplate for a `Struct` called `Foo`, it will copy `crate::path_to_foo::Foo` in the destination file wherever it’s used, which is intended, but not great, honestly.

### Automatically links module

A nice feature is that whenever you create a new source file, RustRover automatically adds the mod line to the parent module. Nothing special, but great for a Rust IDE.

### Project switching

A thing I’ve really enjoyed about using RustRover is that, unlike Visual Studio Code, switching between projects in RustRover means closing the workspace and opening a new one; in Visual Studio Code, you have to `Close Workspace > Open Workspace`. In RustRover, you just have a dropdown for switching projects on the topbar. Nothing special, common to all JetBrains IDEs, but still.

### Features toggling

A nice thing about RustRover is how easy it is to toggle features. You can indeed just check features to enable either from Cargo.toml or from `#[cfg(feature = "…")]` statements.

This thing is actually doable in [VSCode with an extension](https://github.com/itsyaasir/rust-feature-toggler), but it's still worth mentioning.

### Cargo.toml support

One of the best things about RustRover is how easy it is to interact with `Cargo.toml`, indeed, it provides suggestions for keywords and a decent way to warn you about outdated dependencies.

About dependencies, I said decent because Dependi on VSCode is probably more clear, and actually RustRover shows as a new version available the rc, betas, etc, which is really bad honestly.

## The Pain Points

### The editor experience

For me, this is the biggest pain point in using RustRover. The editor is just uncomfortable to use. Compared to Visual Studio Code, navigation feels less intuitive, and by default, it doesn’t even expand the directories containing the open file.

Not to mention the **find-and-replace is SO DUMB**. I hope that everybody on this planet expects the find-and-replace to be on the same view. On RustRover NO. You have the Find and Replace views as separate views. You literally cannot replace with find; you need to open the Find and Replace dialogue instead. Of course, you may say just open the one you need, but it’s so uneasy to use, and it doesn’t make any sense.

### The git experience

An important aspect of editors is how well git changes are shown in the editor view. On RustRover, it’s a disaster. I would expect to have a clear view, like on VSCode's sidebar, of changes made to a file. On RustRover, they are visible but barely. It’s really hard to see and navigate to!

Also, the conflict-resolution view of RustRover is very hard to use. It’s never clear how to use it; it uses meaningless terminology that always comes down to Accept ours or Accept theirs for the entire file. You don’t have a conflict-by-conflict view like in VSCode; you just have two panels, no way to edit them, and two buttons that say "Accept ours" and "Accept theirs." The problem? It doesn’t tell which one is the other, and the git terminology for it is confusing. For instance, if you rebase on main, ours  and theirs logic get twisted and is hard to understand.

### Requires a lot of configuration

While I’ve always found it extremely easy to set up VSCode, RustRover is the opposite. There are way too many settings, and things that you would expect to be the default are instead hard to configure. A good example of this is that I expect opening a file automatically expands its path. Well, this thing isn't even a setting; it’s something you have to set for each project.

The worst part is that it’s really hard to find any documentation about that, because even if you find someone who has asked about it on the forum or the actual documentation page, that’s probably outdated and has changed over the years.

### Working outside of Rust

I don’t know your case, but basically, whichever project I work on, I sometimes have to deal with files written in other languages, either markup, configuration, or programming languages. In those cases, the RustRover experience is decent but not as good as Visual Studio Code, due to minimal support for other languages. So if I knew I had to work on other files, I still usually paired with VSCode.

### Lack of extensions

Eventually, RustRover, like many other IDEs, has very few extensions compared to Visual Studio Code, which makes the overall experience lacking many customisations and extensions to power up the workflow.

## Is it worth it?

While I think the overall experience is still good, I still have to say that, considering it costs 70$ per year, which is not a lot, but VSCode is free, at its current state, I wouldn’t recommend RustRover over Visual Studio Code, especially if you’re already comfortable with VSCode.

If you are already familiar with the JetBrains ecosystem, you may enjoy it more than I did.

I still think it will improve a lot in the future, but JetBrains should really rethink their Editor UX.
