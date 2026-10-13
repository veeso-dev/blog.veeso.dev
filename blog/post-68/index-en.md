---
date: "2026-10-13 11:30:00 Europe/Rome"
title: "No one cares about your reverse-engineered Photoshop clone"
description: "AI can replicate software. But can it replicate everything that makes that software worth paying for?"
author: "veeso"
featured_image: featured.jpeg
category: tech-commentary
reading_time: "6"
---

## Photocraft

A couple of weeks ago, someone released [PhotoCraft](https://github.com/storytold/photocraft), an open-source reimplementation of Adobe Photoshop written in Rust.

The internet immediately exploded with excitement. People were claiming that "Adobe is trembling in fear," that this was "the fall of a colossus," and that big tech's legal departments would soon have their hands full.

After the hype, other developers started doing the same with Microsoft Office and other popular commercial software.

My reaction, however, was rather underwhelming.

My reaction, instead, was pretty bland, and I don't really care. I don't think this will have much impact on the industry, and I don't think either Adobe or Microsoft will see any sales impact.

## The software is not the product

There's a fundamental misunderstanding about what companies actually pay for when they purchase software.

For an individual user, the equation is relatively simple: I need a tool, the tool does what I need, and I pay for it.

If someone offers me the same functionality for free, why shouldn't I take it?

For businesses, however, things are considerably more complicated.

When a company adopts a piece of software, it's not just evaluating its features. It's making a long-term investment, and that investment comes with questions:

- How many employees already know how to use it?
- How much will training cost?
- Will the product still be maintained in 5, 10, or 20 years?
- Who do we contact when something breaks?
- Can we rely on security updates and a predictable release cycle?
- Does the software meet our security, compliance, and contractual requirements?
- How well does it integrate with our existing infrastructure and workflows?
- What happens if the project is abandoned tomorrow?

These are not secondary concerns. They're often what determines whether software gets adopted in the first place.

And this is precisely why recreating Photoshop's interface and features doesn't automatically mean you've recreated Photoshop as a commercial product.

You're competing with much more than a codebase.

## Software no one can maintain

When it comes to maintainability, it's easy to see why these clones are irrelevant.

They may work now, even if I have serious doubts about how far they have been tested (and I don't care how many reviews the dev went through; LLM-generated code will always have many bugs).

It's basically impossible for a single developer to maintain this long-term.

Yes, because even if it's a clone, you can already see it has hundreds of bug reports, which means the "1:1 clone" didn't go too well.

So, on day 0, you already have software with hundreds of bugs compared to the original version, and everything is maintained by a person who has **no idea how the software works, how it is structured, or where to put their hands on it**.

But the LLM will take care of it, right? Meh, no. As a software engineer who uses LLMs to write code, I can assure you that if you don't know what the code does, it is really hard to get the agents to do what you expect.

And the worst has yet to come: what happens when updates come?

Someone replied to me on X.com,

> you can just set up a cron job that every week decompiles again

Yep, such a great idea.

First, it's basically economically unsustainable. It would cost you thousands of dollars a month.

Second issue: you would end up accumulating bugs over bugs, and even if you could merge only the changes from the update, they would have to coexist with the previous bug fix, turning everything into a giant mess with even more bugs than before.

Bugs that nobody can actually test because they don't have hundreds of QA specialists to do it.

And the fun part is: who pays the developers for this effort? The dev is now maintaining software that is usually handled by a huge company, paid millions of dollars a year, with hundreds of employees taking care of it.

But the dev is doing this for free. Yeah, I bet in 10 years he will still be there, spending tokens on it.

## The ecosystem matters

Now let's imagine that our clone is perfectly maintained, reliable, and feature-complete.

Would companies switch?

Some might. But many would still have little incentive to do so.

Because when companies buy Photoshop, they're not necessarily buying Photoshop alone.

They're investing in Creative Cloud, shared libraries, collaboration workflows, file compatibility, integrations, enterprise administration, and an ecosystem their employees and external partners already know.

The same applies to Microsoft Office.

A company that uses Microsoft 365 isn't just paying for Word and Excel. It's paying for SharePoint, OneDrive, Teams, Entra ID integration, centralized management, enterprise support, and an entire set of interconnected services.

Sure, you can clone Word, but you can't clone the ecosystem around it.

And more importantly, would a company willingly replace an established ecosystem with a collection of independently maintained clones just to save on licensing fees?

This is also why projects such as LibreOffice and GIMP, despite being mature and useful alternatives, haven't displaced Microsoft Office or Adobe Photoshop across the professional market.

They demonstrate something important: building a viable alternative is possible, but technical capability alone doesn't guarantee mass adoption.

And unlike these new AI-generated clones, those projects have had decades to mature.

## Trusting anonymous

Another thing worth mentioning is that anyone using this software must know they are running software no one has really checked, since it's huge, and it could potentially ship with anything. And by anything, I mean viruses and spyware.

I have no doubt that in the next few weeks, with the clone craze, someone will be able to crawl thousands of users' private data using one of these clones.

People are downloading trustless anything just because they were told it's a clone of software they would never pay for.

## So, should Adobe be worried?

Not because someone recreated Photoshop in a few weeks.

The impressive part of projects like PhotoCraft is what they demonstrate about the decreasing cost of software development. AI makes it possible to build increasingly complex applications with far fewer resources.

But there's a difference between lowering the barrier to creating software and eliminating the barriers to running a sustainable software business.

The real competitive advantage of established vendors isn't necessarily that their developers can write better code or that their applications have features nobody else can implement.

It's the ecosystem, distribution, support, compatibility, accumulated trust, and capability to maintain a product over time.

Of course, none of those advantages is permanent. Open-source alternatives can mature, communities can grow, and businesses can reconsider whether expensive proprietary licenses are worth their cost.

But that takes years of engineering, organization, and sustained investment. Not just a few impressive prompts.

And perhaps that's what bothers me most about the current hype: we've become so fascinated with how quickly AI can generate software that we've started confusing the ability to create something with the ability to maintain it.

You can clone the code. You can't clone a decade of trust, support, and ecosystem integration overnight.

That's why Adobe probably isn't trembling in fear.

And that's why your Photoshop clone, impressive as it may be, won't bring down a software giant tomorrow.
