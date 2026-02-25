---
date: '2025-08-14 11:15:00'
slug: 'prs-taking-too-long-to-be-reviewed'
title: 'PRs taking too long to be reviewed'
description: 'The dilemma of assigning Pull Requests Reviews'
author: 'veeso'
featured_image: featured.jpeg
tag: dev-life
reading_time: '4'
---

## Introduction

I think there's something every developer working in an environment where PR must be reviewed has experienced: **PRs taking too long to be reviewed**.

Every company has its own process for assigning reviews and setting the amount of minimum reviews required before a PR can be merged. Every company sets its own expectations for how quickly reviews should be completed, but everyone expects to have their PR reviewed within a reasonable timeframe (ideally within a day if the PR is not huge); the problem is that these expectations are often not met.

## Assigning reviews

Let's start with the most important factor, which is **Who to assign the review to**.

We can basically have these strategies:

### Assigning the PR to someone with context and expertise

This is a good approach to ensure a timely review, with good chances of catching issues early.

The issue is that this creates some **gatekeeping** of knowledge, since people with less experience or context in that area will never have the opportunity to learn and grow.

### Assigning the PR to random people

This approach can help distribute knowledge more evenly across the team, as it forces people to engage with different parts of the codebase. However, it can also lead to longer review times and potentially lower quality feedback, as the reviewers may not have the necessary context to provide valuable insights.

### Mixed approach

Probably my favourite approach is to choose between 3 people, two with expertise and one without: this is very good to have both good comments and feedbacks and to help someone to grow their knowledge in that area.

### Assigning to the team

This is the current approach at my company and it's idealistically effective because everybody can choose what to review, how they want in the most effective way possible according to their own knowledge and interests. This can lead to more engaged reviewers and potentially higher quality feedback.

There is in my opinion one big issue with it though: the **Bystander effect**.

> The bystander effect is a social psychological phenomenon in which individuals are less likely to offer help to a victim when other people are present.

It seems to happen quite often, that if someone is not explicitly assigned to a PR, they may feel less inclined to review it, assuming that someone else will take care of it. This can lead to important reviews being delayed or overlooked entirely. Indeed devs, with this approach, may feel not the best person to take care of a review, and so will lazily wait for someone else to step in.

## How many reviews are enough?

Another important rule to set in PRs is how many reviewers should be enough to ensure a good quality review.

First of all in my opinion there is an important difference between the **minimum** and the **recommended** amount of reviewers.

Honestly it would be really cool to have the possibility to have some granularity based on the PR size, but in practice, no git platform currently offers this feature, so we need to set a number for the minimum required reviews independently from the PR size.

In the past I've worked for a company where the **minimum** amount of approves was set to two, and sometimes it worked, but mostly it didn't I would say. Most of the PRs are eventually small, and in some case just one review should be enough to merge.

This doesn't mean that one reviewer is always sufficient, indeed there are cases where multiple perspectives are needed to catch potential issues.

So probably I would go for an approach like this:

- Minimum reviewers: 1
- Small PRs: 1/2 reviewers
- Medium PRs: 2/3 reviewers
- Large PRs: >= 3 reviewers

## Invalidating reviews

I could make a long talk about whether you should require reviews after each change, but please, just no.

It's a super annoying rule to keep in your repo, especially because most of the time it happens if you just rebased your branch and you actually did not a single change.

Of course, this doesn't mean that if someone **actually** made some meaningful changes he shouldn't require a review; in that case he should definitely ask for one. But for repository rules, I think it's better to avoid unnecessary friction and let developers use their judgment.

## Conclusion

Short article today, but some thoughts that I really wanted to express.
Of course these are just opinions and I encourage everyone to find their own way of handling code reviews.

So, TL;DR

- Assign reviews based on context and expertise
- Consider a mixed approach for balanced feedback
- Be aware of the bystander effect in team reviews
- Set clear guidelines for the number of reviewers needed
- Avoid unnecessary review requests after minor changes
- **Weak rules**, but **strong self-judgment**.
