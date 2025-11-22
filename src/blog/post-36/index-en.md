---
date: '2025-04-30 12:00:00'
slug: 'all-my-dead-open-source-projects'
title: 'All my Dead Open Source Projects'
subtitle: 'Showcasing successful projects is mainstream, but what about the dead ones?'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
draft: false
tag: open-source
---

## Introduction

For every project that is successful, there are many that are not.

In my case it's like 1 successful in 10 projects.

So in this article I want to bring some glory to my dead projects, because afterwards some were somewhat good, but I didn't have the time/interest to finish them, some were just experiments, some other quite useless, and some other just bad.

This is something that I've never seen done by other open source developers, but I think it's quite fun and maybe someone will find it useful.

So let's get started!

## Donmaze

[Donmaze](https://github.com/veeso/donmaze) is an interactive maze game running on the terminal.

It is implemented using [ratatui](https://github.com/ratatui/ratatui), a Rust library for building terminal user interfaces and my framework [tui-realm](https://github.com/veeso/tui-realm).

The purpose of the game is of course to escape the maze, so you need to find the key and the exit, but be careful, the maze is full of monsters and of course there is **Don Maze** who will OHKO you.

It was done by simulating an isometric view with lines drawn in the terminal, there are also items and 8 bit music, even if it sucks.

The game is fully playable and you can beat it, but it wasn't really finished, I wanted to add more monsters, items and a map to help you navigate the maze; also it's not really fun to play.

<iframe width="100%" height="420" src="https://www.youtube.com/embed/ZEnvUns7XW8" title="Donmaze Gameplay" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Cren

[Cren](https://github.com/veeso/cren) 🥬 Cren – A modern build and package manager for C, inspired by Cargo.

![cren](./cren.webp)

I'm not sure if this is a dead project or not, but I haven't touched it in a while. My idea is to make it my project for the final exam of my degree in 2027/2028 (ideally), but it's huge.

Basically, I wanted to make a package manager for C, like Cargo for Rust, and the metadata is already defined and the parser is done; you can try it out yourself.

At the moment only the build system is implemented, without dependencies AND it actually works.

You can actually **build cren with cren**.

I'm not sure though if I will continue with this project for two reasons:

1. lack of time (as always)
2. C is a huge rabbithole when it comes to setting flags for the compiler and the current machine architecture. If you ever tried to use `./configure` you'll see tons of flags for libc, ordering, etc. and I don't want to deal with that.

## Instagram-scraper-rs

[Instagram-scraper-rs](https://github.com/veeso/instagram-scraper-rs) was a Rust library to scrape and download Instagram user's photos and videos.

It worked fine, until Instagram changed their API and up to now it is not known how to scrape Instagram anymore.

So RIP I guess.

## Bitpanda730

Who doesn't love taxes?

![tax-season](./tax-season.gif)

I've used Bitpanda for a while to make some trading a couple of years ago, and I wanted to create a tool which given the CSV with all the transactions was able to generate the fields to fill in the tax form for Italy.

[Bitpanda730](https://github.com/veeso/bitpanda730) was exactly that, but I never finished it because I didn't have the time and I don't use Bitpanda anymore.

What's interesting though, is that it implemented quite well the tax filling process, so if you want to use it for your own taxes, you can just fork it and adapt it to your needs. Of course it's only for Italy, but the logic is there.

## Opentapo-wearos

Let's start with the streak of my WearOS projects.

[Opentapo-wearos](https://github.com/veeso/opentapo-wearos) was a WearOS app to control your Tapo smart home devices, so you could basically turn on the lights from your watch when you're on the pot.

![ben-ten](./benten.gif)

Did it work? Yes, but it was terrible. Basically the devices have not a way to **discover** them on your network, unless you use the Tapo cloud, which of course is closed source and I don't want to use it.

So eventually I opted to send discovery HTTP packets on the entire network to find them out, but it was slow and unreliable.

Actually this was the story I told on my first post ever: [Dev Horror Story #1 — An Android Nightmare](https://blog.veeso.dev/blog/en/dev-horror-story-1-an-android-nightmare/).

I discontinued it because it was too slow/unreliable and developing on Android is shit.

## Yubico Authenticator WearOS

Yet another WearOS project, [Yubico Authenticator WearOS](https://github.com/veeso/yubico-authenticator-wearos) was basically a client for YubiKey for WearOS, so instead of plugging the key into your computer you could have got your tokens by using your watch's NFC technology.

![look at my gucci](./look-at-my-gucci.gif)

Pretty cool huh? Yep, BUT once implemented the app, I found out that **Google disabled NFC for non-payment operations** on Wear OS.

Yeah, WearOS is quite useless, I wonder why it was a global failure after all.

## ATtila

[ATtila](https://github.com/veeso/ATtila) was a Python module to communicate easily with modems and RF modules using AT commands.

In one of my previous company I had to deal a lot with modems and AT commands.

The idea was to create an alternative to **Chatscript**, which is a tool with query/expected response format to send AT commands to modems; eventually I finished it and it even worked.

```txt
# ATtila - AT command interface
# Syntax:
# COMMAND;;RESPONSE_EXPR;;DELAY;;TIMEOUT;;["COLLECTABLE1","...","COLLECTABLEn"];;DOPPELGANGER;;DOPPELGANGER_RESPONSE
# Set up communication parameters
DEVICE /dev/ttyUSB0
BAUDRATE 115200
TIMEOUT 10
BREAK CRLF
#Abort on failure
AOF True
#Get the SIM PIN and the APN
GETENV SIM_PIN
GETENV APN
#Let's start with modem setup
PRINT Configuring modem parameters
#+++ doesn't want a break
BREAK NONE
+++
BREAK CRLF
ATH0;;;;5000
ATE0;;OK
ATZ;;OK
ATE0;;OK
#I'm going to verify signal etc, we don't need to aof
AOF False
AT+CSQ;;OK;;;;;;["AT+CSQ=?{rssi::[0-9]{1,2}},","AT+CSQ=${rssi},?{ber::[0-9]{1,2}}"]
AT+CGSN;;OK;;;;;;["?{IMEI::^[0-9]{15}$}"]
AT+CREG?;;OK
#Now I'm configuring modem for dialup, so AOF it's important
AOF True
AT+CPIN?;;READY;;0;;5;;;;AT+CPIN=${SIM_PIN};;OK
AT+CGDCONT=1,"IP","${APN}";;OK;;1000
#Dial APN
PRINT Dialing your ISP...
AT+CGDATA="PPP",1;;CONNECT
```

It supported quite a lot of commands, also to gather information from the modem and then to save them into files.

The project is still working I guess, but I discountinued because I don't even have a modem anymore to debug it.

## TermiWin

Okay, [termiWin](https://github.com/veeso/termiWin) is actually **SHIT**.

It's my first opensource project ever and it is

> a termion porting for Windows

Did it work? Of course not. Well, it worked for just a couple of things, but in general it didn't work.

Like 3 years ago I've written this on the project README and archived it:

> I'm no longer working on this project, so this should be considered as an abandoned project. Feel free to fork it, but please, consider that even forking this project should be considered wrong, and here's why:
>
> First of all, I think this project is just wrong. I've implemented this in 2017, when I had just started my career as a dev, and many things have changed since then, even the way I see software. At the time I saw no issue with something like termiwin, but now, personally, I think termiwin is a huge mistake, I even feel ashamed for implementing it. It is so far from my idea of how software should work, that I just feel bad every time someone stars this project. Portings are a cool thing, but termiwin is not a porting. It's just a copy-paste of some linux headers and "pray it works and be thankful to the creator of the world if it runs on your machine".
>
> why didn't you fix it to make it good, then?
>
> Well, I tried at least, but it's just not possible. If there is not a porting of termios out there for windows, it's because there cannot be one. I/O on linux is so much different from how I/O is managed on Windows, that this thing cannot just work. I felt so smart when I implemented this like
>
> I'm so cool yo, I'm the only one who wrote a porting of termios for Windows
>
> Do you think MinGW devs are stupid? No, they're F not.
>
> In addition to this, I have just no interest in this project:
>
> First of all, I've moved away from C/C++ development, thanks, god. You should do it too.
> I've developed software for Windows once in my lifetime and I promised myself that I would never do this. Do you know what Windows is good for? Playing videogames. And not because games run fine there, but just because the game producers, won't develop games for other platforms. If I didn't play games, I wouldn't even use Windows. When I develop on Windows, I'm on a terminal running WSL all the time. So I don't even think of developing on this damned operating system again.
> I've got many other projects that received much more interest from the community.
> TL;DR I won't work on this project anymore. Stop asking me to solve your issue, because I won't be able to. I hate Windows.

It gets me every time I read it, but I think it's a good way to show how much I've changed in the last years.

The only problem is there are still people forking it and using it. **PLEASE STOP**.

![stop](./stop.gif)

## Pyc-shell

This is fun actually, [pyc-shell](https://github.com/veeso/pyc-shell) (Pronounced "Rus") is a simple CLI application, written in Rust, which allows you to interface with your favourite shell, giving you the possibility to perform commands in cyrillic and other alphabets, through command and output transliteration.

Yes, you got it right, so for instance it was a shell which allowed you to write `чд` instead of `cd`, and it would transliterate it to `cd` and execute it.

It was a fun project, it worked actually, but come one, who needs it?

And if you think I stopped after implementing just Russian, you're so wrong, this is the full list of supported languages:

- Belarusian Cyrillic - According to belarusian cyrillic GOST 7.79-2000 with some differences
- Bulgarian Cyrillic - According to bulgarian cyrillic GOST 7.79-2000 with some differences
- Serbian Cyrillic - According to serbian cyrillic GOST 7.79-2000 with some differences
- Russian Cyrillic - According to russian cyrillic GOST 7.79-2000 with some differences
- Ukrainian Cyrillic - According to ukrainian cyrillic GOST 7.79-2000 with some differences

Fun fact: I'm not even Russian. At the time I was learning Russian and I was quite a lot into cyrillic, so I thought it was a good idea to implement this.

What's good though? WELL, there is [a GOST 7.79-2000 transliteration](https://github.com/veeso/pyc-shell/blob/master/src/translator/lang/russian.rs) table in Rust, but with [some differences](https://github.com/veeso/pyc-shell/blob/master/docs/translators/ru.md) which could be easily reverted.

## Octopipes

This was a huge but dead project and one my first ones in Rust.

[Octopipes](https://github.com/veeso/Octopipes) was an IPC protocol based on pipes, with a publish/subscribe model, which allowed you to communicate between processes using pipes.

Basically it was like MQTT, but with pipes.

That's because in the industry many use MQTT for IPC, but I think it's a huge overkill for that. So I wanted to create something simpler and easier to use with pipes, that were born to be used for IPC.

In this project you can see some rare bad practices of Rust.

If you're interested in reading more, [this is the protocol reference](https://github.com/veeso/Octopipes/blob/master/docs/protocol.md).

## Conclusion

And that's it for the moment, probably in like 5 years a part 2 will come out with more dead projects.

Actually there is still one more to cover, but I want to give it an entire article, because it comes with some advices I can give you on what not to do in open source projects.

Hope it was fun and feel free to fork something if you like it, **but please, don't fork termiwin**.
