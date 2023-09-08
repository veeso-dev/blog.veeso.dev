---
date: '2023-01-25 00:00:00'
slug: 'dev-horror-story-1-an-android-nightmare'
title: 'Dev Horror Story #1 — An Android Nightmare'
subtitle: 'A journey into one of my most painful development: a Wear Os App'
author: 'Christian Visintin'
featuredImage: ./featured.jpeg
lang: en
---

## Preamble

_Reflecting on our Android perception_

Let's jump back to the 2010s, I was still a student at the high school and there was a feud between iOS and Android users. Everybody used to point out what made one of the two operating systems better than the other, even if we all knew that basically, the actual turning point was if you could or not afford an iPhone.

![android-ios](./android-ios.gif)

**But**, there is something which has always been said about Android, that could have made you opt for a device of this operating system: freedom. If you have an Android device you're free to do what you want with it.

I don't want to say what I think about it yet, and this article is mostly about that, so keep reading if you're into it, but I can certainly say that in 2023 just set up a custom ringtone for your iPhone is a hustle and when my mum asks me to do it for her, I just wanna cry. Converting an mp3 to an m4a and then just renaming it to m4r and then syncing your iPhone via iTunes is just foolish and just makes you feel jailed when using iOS devices; but, still, does this mean Android means freedom?

So, for my entire life, I've always bought only Android devices with this idea in mind of being able to hack them. Have I ever even developed an app then to hack them? No, never, but in my mind, I could always develop one, any time, with no problems.

I finally even decided to buy a WearOs watch (a Galaxy Watch 4 to be precise) and I was very enthusiastic with it since you always wear it on your wrist and you've got the power in your hand to do what you want with it, so it looks very comfortable and powerful.

![benten](./benten.gif)

I could have never imagined how much I was wrong about this, though…

## The Yubico WearOs App

In December 2022 I bought my first Yubikey, which I find very useful, but not always that comfortable to take my phone to get the tokens. So I told myself

> what if I could generate the TOTP from my watch, just tapping the key on it?

A brilliant idea and what I found out was all the Yubico apps are open-source, so that should have been probably super easy to implement for my WearOs device.

So I installed Android Studio, familiarized myself with Kotlin since I only knew Java for Android Development and I started to implement my [Yubico Authenticator for WearOS](https://github.com/veeso/yubico-authenticator-wearos).

In just a few hours I had it implemented. I entered the developer settings on my watch and have the WiFi debugger enabled and finally I pressed Run on my IDE: the build was successful, the screen on my watch went black and after one second, it just crashed and returned to the watch face. Damn it!

![this-is-fine](./fine.gif)

I immediately start reading the log and there was an error saying that the device wasn't able to activate the NFC reader.

Maybe permission is missing? Maybe NFC is disabled in my watch settings? Maybe I must use a different API for NFC tags on WearOS?

No. Everything looked fine. So I did the only thing a dev can do in this situation. Google the error.

First result from a poor guy on Reddit:

> Is it possible to read NFC tags on WearOS? If not, why the hell not! Google development of WearOS is frustrating at times!

Answer:

> Found elsewhere that this isn't possible. Frig sake Google why can't you not get bored with a product and continue development for more than 30 seconds!

![no god please no](./the-office.gif)

I don't really know what could lead to this decision from Google. Maybe it's really a security issue (but why should I'd be able to use it on my mobile then), but something makes me think that it's just Google giving a about its products after one month after the release. Let's be honest, nobody cares about WearOs, since you can do really a little with them, but Google seems not to understand that this is because of them giving poor effort in what they do. \*This is just my humble opinion

So this is the end of the story of the Yubico Authenticator for WearOS. At least I gave myself the satisfaction to put this line at the end of the repository readme on GitHub and say goodbye to Android Development (or maybe not…)

> Unfortunately this is just a dream. Once implemented the app, I found out that Google disabled NFC for non-payment operations. Imo WearOS is just useless, and devs can't do anything on it.
>
> Keep dreaming for a real decent wearable OS…

![fuck off](./fuck-off.gif)

“Unfortunately this is just a dream”, I was so much wrong. This is going to be a nightmare because as for records, there's always a side A and a side B in each story.

## OpenTapo app — or how I got mad for turning on the lights in my house

### How I got there

A few weeks before writing this article I had the insane idea of replacing all the lights in my house with smart lights controlled by Alexa, so I opted for Tp-Link Tapo devices. Really, don't do it. It's cool and makes you feel like you're in Blade Runner, but at the same time, it's insane you need to tell Alexa you're going to the toilet so she can turn the lights on for you instead of using a switch.

![blade runner](./blade-runner.gif)

Sometimes it happens I forget to ask Alexa to turn the lights in the bathroom and I've left the mobile in the living room and when I'm there the only thing I can do is shout to Alexa to turn the lights on. Not very comfortable. So I thought it could have been a good thing to implement an app for my WearOs smartwatch to control my Tapo devices since there's no app to do that.

OpenTapo WearOs: that would have been the name for my app. The real nightmare starts here.

### The green light at the end of the dock

First, I checked whether the Tapo protocol is open. Obviously is not.

![dammit](./dammit.gif)

> Okay, then let's check whether someone has already reverse-engineered the protocol and published some kind of library on Github.

Someone claims to have been able to control its Tapo devices, and the library is also written in Rust. Perfect I thought (kudos to Mihai Dinculescu for its [Tapo lib](https://github.com/mihai-dinculescu/tapo)).

After that, the first thing to do then has been converting their library from Rust into Kotlin, but once done, I noticed something that didn't look right at all.

The library indeed allows you to communicate with Tapo devices, but with one condition: you must know the device's IP address.

Now, this could even work if, for example, one builds an application to control them via a Raspberry Pi or something like that, even if we need to consider that these devices are configured with a DHCP address; but it's surely unacceptable for a WearOs device.

### Next step: how can we discover all the Tapo devices on our network?

The first thing I did was, again, to check on GitHub whether someone has managed to discover its Tapo devices.

Answer: no, but someone did for **Kasa devices**. (Kasa is the legacy smart home product from TpLink).

What I found out from the Kasa client library is that they were controlled not directly interacting with the device web service, but via a Cloud endpoint.

So, easy I said, just use the cloud to control the devices

### Failure #1 — The cloud approach

Basically, the TpLink cloud workflow to control the devices was apparently very simple:

1. Login via the API with your username/password
2. Get the device list
3. Collect the device ID from each entry in the device list
4. send a command to each device providing the device ID to the request sent to the cloud

Once implemented everything, the only thing remaining was to run the application in the debugger:

1. Login: OK
2. Get the device list: OK, I can see all my Tapo devices
3. The device ID is there, in the response

Then I finally sent a “power_on” request, but the server responded to me with

![nope](./nope.gif)

> Nope… The device is offline

What does it mean it's “offline”? I can control it with my app, so it must be connected.

I was despaired, again. There must have been something wrong with my implementation, but everything looked fine to me.

As I always did in these cases, I tried to look at the issues of the Kasa project to check whether someone tried to control their Tapo devices.

Everybody had the same issue. So I started to feel defeated, but luckily someone affirmed they managed to communicate with their Tapo via the cloud using some different requests. Did it work? Obviously not. Why? Because this method has been disabled after some time by TpLink. So the only way to communicate with the Tapo devices nowadays seems to be sending directly the requests to the built-in web service.

![dammit](./dammit2.gif)

### A review of the ARP protocol

I don't know if you've ever studied the ISO-OSI stack, but if you did you probably won't recall the ARP protocol; but don't worry, since I'm going to make you remember it.

What I didn't mention before, is that in the response from the cloud with all the devices, for each device there is a super important attribute specified: its MAC address. I knew I could have used that to get the IP of my devices. How? Thanks to the ARP table.

How does it work? So, basically, your modem, is also a switch and the devices on the local network are resolved by the switch using the MAC address instead of the IP address. Requests use IP addresses though, so basically, each device has a lookup table called ARP table which stores for each IP address, the associated MAC address.

![math](./math.gif)

### Failure #2 — The ARP table approach

So, if I have the list of all the MAC addresses of my devices, I can just look up my smart watch's ARP table to find out what the device IP address is, right? RIGHT???

So I just had to implement the ARP table reader in my app and create the lookup mechanism.

> Google devs in the meantime

![laughing](./laughing.gif)

The application started and crashed with the error: **“Permission denied”** when reading the ARP table. Mhm, that's weird I thought, especially because I've seen devs claiming they managed to do that. Maybe the smart watch system doesn't have an ARP table, but I mean, it's always Linux based, so it shouldn't make much sense. Indeed, once connected to the device shell, I was able to read it with the cat command. What was the matter then…

Well, basically since Android 10, Google has made it impossible to read the ARP table from apps. For **“Security reasons”**, as usual…

Someone on Stack overflows, claims it is still possible to retrieve it by running the shell command “ip neigh list”, but again: permission is denied. Google forbid the usage of this command from apps since Android 11…

So how can you read the ARP table from an Android app? Well, basically… you can't do it anymore…

![i knew it](./i-knew-it.gif)

This time, I was about to give up. Seriously, I started to think Google just doesn't want me to work on Android apps.

### I won't stay in a dark toilet, Google

Arthur Conan Doyle once wrote:

> When you have eliminated all which is impossible, then whatever remains, however improbable, must be the truth — Sherlock Holmes

Which I've applied here more like

> When you have eliminated all which Google forbids, then whatever remains, however ugly and crappy is, must be implemented.

Google! I will turn my bathroom light on from my smartwatch, whatever it takes.

I knew there was just one last possibility, the ugly one. Basically, in a brute-force way, try to send an HTTP request to each address on the local network and see whether they act like a Tapo device.

Is it good? NO. Does it work? Probably.

So, I scrapped all the ARP table lookup and the Cloud API, and replaced it with a “DeviceScanner” service which basically:

1. gets the watch IP address and the netmask
2. calculates the network and the broadcast address
3. for each IP address in between try to send a “Handshake” request as expected by the Tapo protocol
4. for each IP which sends a response, register it as a device and make the user able to interact with it.

I couldn't believe, that finally this worked. Well, it was very slow and sucked a lot as implementation, indeed I had to do a lot to optimize it in order to prevent the network scan, caching connections and addresses, but finally, it works.

![is nice](./is-nice.gif)

## Conclusion

So what's the conclusion of this story?

First, I'm finally able to turn the light on while seated on the toilet, then…

I've learned that we live in a world where software isn't really made for developers, but more for end users. I mean, I install some light bulbs in my house and its protocol is totally closed-source; Google has blocked tons of features to developers in the name of “security”.

But is that true? Is preventing apps from reading NFC tags from a watch, or reading the ARP table making our devices safer?

I always feel like something has gone totally wrong with smart devices, such as mobiles and watches like they ended up being black boxes without any possibility to work on or customize them; but this is probably a topic for another time.

In the meantime I'm seated here, waiting for Google to approve my App on the Play Store.

![pablo](./pablo.gif)

If you want to give a look at the OpenTapo project, here is the [repository](https://github.com/veeso/opentapo-wearos).
