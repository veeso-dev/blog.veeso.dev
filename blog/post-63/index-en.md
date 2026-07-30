---
date: '2026-07-30 11:30:00 Europe/Rome'
title: "Codeberg is self-sabotaging by turning against AI-assisted development"
description: 'Codeberg updated its Terms of Service, opposing cryptocurrencies and, de facto, any real-world use of AI. What does this imply?'
author: 'veeso'
featured_image: featured.jpeg
category: tech-commentary
reading_time: '6'
---

## What happened

In the last week of July 2026, Codeberg made a small but impactful change to its Terms of Service (ToS):

> You must not share projects that mostly consist of code written by "generative AI"-tools (including services such as *Claude*, *OpenAI Codex*). Such projects having an unclear copyright status (see requirements § 2 (1) 1 and § 2 (1) 3) and furthermore have little safeguards to ensure that they do not include harmful code (c.f. § 2 (1) 5).
> […]. We also explicitly do not tolerate: […] Content that harms the reputation of Codeberg, such as cryptocurrency related projects.

These two changes, even if they look small, actually have a huge impact on Codeberg's user base and have already caused several users to flee from the platform.

I put the commits here just to keep track of them:

- [ToU extension to prohibit LLM-extrusions](https://codeberg.org/Codeberg/org/commit/71149c7fc95ccfeae36109b5cddca339e4aa1473)
- [Disallow cryptocurrency projects](https://codeberg.org/Codeberg/org/commit/f383b648fd733ab88083dc390b91e77cd7589980)

## What is Codeberg

If you've never heard of [Codeberg](https://codeberg.org), it's perfectly fine, I guess. Codeberg is a git hosting platform, like GitHub, but it is:

- non-profit
- community-led
- privacy-first
- hosted in Europe

They also claim several things that, at this point, I'm not sure are still valid, like "Software development, but free", or "We celebrate free culture, openness, and creativity" at this point.

## What the two clauses imply

### Let's talk about cryptos

The clause against cryptocurrency projects is quite clear, I think: it just bans any project related to cryptocurrencies, since, according to them, "harms the reputation of Codeberg".

Now, there are different things to say about this: I perfectly agree that most cryptocurrency-related projects are scams, or arguable. **I think Bitcoin itself is a huge pyramid scheme**, but there are still projects which are good in some way.

I've worked for many years on projects running on the Internet Computer, for instance, which at the time used to be great, and honestly, I don't see how that would harm the reputation of Codeberg.

Fun fact: some of these projects were hosted on Codeberg as well, such as my wasm-dbms library, which included an adapter for Internet Computer. This means that wasm-dbms is also now against Codeberg's ToS and needs to be removed.

I also uploaded a harness library for testing with IC (Internet Computer), and now that is *de facto* against the ToS as well, because it can be considered against the ToS too.

Also, it is not clear what `cryptocurrency related projects` means, and it could potentially include many more things than just blockchains or smart contracts.

For instance, a tool that works with transactions from an exchange, or even Revolut itself, which treats ETFs, stocks, and cryptos, could be considered cryptocurrency-related too, and so against the ToS.

I perfectly get that the impact of this clause is surely not as big as the AI one, but I still think it's a pretty strong claim and absolutely **not clear**. I think, and you'll see this in the next chapter, that this is more like a political position-taking than a commercial decision.

## The generative-AI clause has nothing to do with copyright

Let's talk about the other clause, which is very interesting and very concerning.

This clause says that you can't share any project which mostly consists of code written by tools such as Claude or Codex.

### What mostly actually means

There is no clear definition of **what mostly means**, and this is the first problem. It is not clear if it means `>50%`, or `>75%`, or `>90%`, or whatever.

For common understanding, `mostly` means `>50%`, right? Which means that whatever project you have, no matter the effort you put into the design or writing the specification, if it has at least `50.1%` of code written with the use of AI, it is automatically against the ToS.

This, just for the record, also implies that even if you wrote most of the implementation code manually, but you used AI to write the test scenarios, that could still be potentially against the ToS, which is absolutely crazy.

Of course I'm not meaning they explicitly mean 50%, but that `mostly` can be interpreted in any way **they** want.

If you don't think this is crazy, it either means you are an anti-AI yourself, or you've lived under a rock for the last 2 years.

### The copyright claim is bullshit

They defend this clause with one of the most artistic pieces of bullshit I've ever seen; in Italy, we call this kind of justification "*supercazzola*".

They say that if your project is *mostly* written using AI, it **may have an unclear copyright status**.

It is true that in recent years there have been many discussions about copyright when using generative AI, and at the beginning many people were sure that there was no copyright, since it was created by a machine.

The fun part is that this conviction came from a [Monkey taking a selfie](https://en.wikipedia.org/wiki/Monkey_selfie_copyright_dispute). I'm not joking; there is a Wikipedia page about this.

![A monkey taking a selfie](./monkey.webp)

The dispute said that since the monkey took the selfie, the photographer who owned the camera had no copyright claim on the photo. Eventually, the monkey won the trial. For this reason, many people in the last year were still convinced that ai generated content does not belong to the human, but to the machine (which means none).

This thing, though, is generally false. If you have an idea, and you planned the idea, you designed it, and then you used the LLM as a tool to implement the idea, you still have the copyright. This is because you are protecting your idea, your creativity; it's your artwork, not the machine's.

If it weren't like this, Apple could sue you because it was the MacBook that physically wrote bytes of your application, and not you typing.

The only case where the copyright could be disputed is, for instance, if you have a totally autonomous agent writing random code, and you upload that code. In that case, you probably can't claim copyright for it.

But even if it were, why should Codeberg care? I think they may think that if you used an autonomous agent running on Claude, they may think Anthropic has the copyright over it. I honestly don't exactly know how it would work, but I just don't think that's the case; I think no one has copyright over that content.

Finally, if this were true, I think GitHub would be in big trouble, but since they are not putting weird clauses in the ToS, I think it's indeed not a real hazard.

## Conclusions: it's just politics

I think I can make this statement without any issues, and I think everybody can agree with this: banning AI-generated content is just a political take.

There is now way, that if they wanted to prevent spam, or malicious code, they would have put the terms down like this.

It is quite clear that in the last year, Codeberg has mostly been supported and joined by people belonging to arguably different categories, such as the *Buy from EU* (not bad in general, just the extremists) people and *anti-AI* people.

I believe Codeberg knows that it must keep its line in compliance with that of its community, so it decided to become the GitHub of anti-AIs.

I'm truthfully sad about this. I had donated money to Codeberg myself this year, and seeing it wasted with these claims has really disappointed me.

I have no problem claiming that whoever considers themselves an Anti-AI for me is an extremist. It is no different from a no-vax. It is a conspiratorial movement of people who have no idea how this technology works, claiming companies/governments are going to destroy the world as we know it; they are going to lose their job, or die, or whatever, and so they try to boycott it.

For me, LLMs have been the biggest innovation since the creation of the internet. In just two years, it has revolutionised our lives, our way of working, and our way of seeking information, and it's a widespread technology. The change is not always good, but it still happens. Me, you, my mother, your grandma: everybody is using it.

I decided to leave Codeberg immediately and delete my account. I'm sad, but they made a choice that I can't cope with.
