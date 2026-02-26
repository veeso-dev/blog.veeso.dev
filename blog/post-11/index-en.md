---
date: '2024-04-12 12:30:00'
slug: 'the-bitcoin-utopia-is-a-lie'
title: 'The Bitcoin Utopia is a Lie'
description: 'Why we all have been lied about Bitcoin'
author: 'veeso'
featured_image: featured.jpeg
category: blockchain
reading_time: '15'
---

## Preamble

I want to be clear on some aspects before starting this article:

1. **This is not going to be a Fiat Vs. Bitcoin argumentation**: I both believe both of them are equally bad
2. **There's not any alternative**: I'm not here to tell you "you shouldn't use Bitcoin, use XXXXXX instead!".
3. I've been in the community long enough and I have a **technical expertise** to be able to expose this theory.
4. **I'm not an economist**, so I cannot be trusted at 100% on the economic impact of the scenario I'm going to illustrate in the next chapter.
5. Most of people advocating for Bitcoin has a very poor technical knowledge of how it actually works.

Said so, let's start from the beginning.

## There are three kind of persons who advocate for Bitcoin

I've been in the Bitcoin community long enough to be able to recognize 3 kind of persons when it comes up to Bitcoin advocacy, and when I talk about Bitcoin advocacy, I'm referring to any kind of activity which promotes Bitcoin as the best option to replace the current FIAT standard with the **Bitcoin standard**. These kind of activities consists in spreading the credo from a tweet to a no-profits organizing and promoting conferences.

### Those who are there for money

This is the first category we can identify, which are all of those people who promote **bitcoin for a personal economic return**. The more people use Bitcoin, the more its value will be and the more money I will make.

I have nothing against this category, except the fact they probably don't really believe in Bitcoin from an ideological point of view, but probably because this makes them richer.

But, **Business is business**, so I can't blame them.

![business](./business.gif)

### Anti-governmentalists

People who are in any case and with no exception against everything the government says and does. We have many of them in Europe and they find in Bitcoin the weapon to fight against taxes, confiscation of assets, FIAT electronic payments, CBDC, vaccines, green politics and yet, everything which has to do with the institutions.

![conspiracy](./conspiracy.gif)

### Libertarians

This is the category I'm more worried about. Personally I don't consider myself a libertarian and to be honest I find many aspects of this ideology utopistic, like communism and far from a real world implementation, but I would say that 99% of them a pro-bitcoin since it can perfectly fit with libertarism.

![perfect-fit](./perfect-fit.gif)

## Bitcoin and Libertarism

If we wanted to resume in a couple of key-points the aspects that make Bitcoin for libertarians a perfect match, we could just list these points:

- **Decentralization**: Bitcoin operates on a decentralized network, meaning no single entity controls it. This aligns with libertarian views against centralized control by governments or central banks.
- **Limited Supply**: The total supply of Bitcoin is capped at 21 million, which prevents devaluation through inflation, a common critique of fiat currency systems by libertarians.
- **Financial Sovereignty**: Bitcoin allows individuals to have full control over their money, without needing permission from banks or government institutions for transactions.
- **Privacy**: While not completely anonymous, Bitcoin transactions can offer more privacy than traditional banking systems, aligning with the libertarian value of individual privacy.
- **Censorship Resistance**: Transactions cannot be easily censored or blocked by states or financial institutions, promoting freedom of commerce.
- **Borderless**: Bitcoin can be sent and received anywhere in the world with an internet connection, facilitating global trade without the need for currency exchange or government oversight.
- **Access to credit**: Bitcoin makes access to credit feasible for everyone, since there's no bank account to open. A mobile or a computer is enough to have access to their account.

I want to be clear: these aspects of Bitcoin are 100% accurate, for the moment at least.

But there is a huge problem with that: **these aspects won't be possible in the long terms**.

![the-rock-gif](./rock-wait.gif)

Well, at least not all of them. Some of them are actually feasible nowadays and they will always be in the long terms, such as access to credit, borderless and privacy (more or less)

## Feepocalypse: the single point of failure of Bitcoin

Before diving in the reasons Bitcoin is a huge lie, I need to explain what the huge issue with Bitcoin is, **the big fat elephant in the room** that nobody wants to see when we talk about Bitcoin as a currency: **Fees**.

![elephant](./elephant.gif)

### Why do we pay fees

We all know we need to pay a certain amount of fee when we send BTC from an address to another, but why is that necessary? The reason is quite simple and it's done mainly for these reasons:

- **Priority**: Miners prioritize transactions with higher fees because they earn more rewards from including those transactions in blocks. Since there's a limited space in each block, transactions offering higher fees are more likely to be included promptly.
- **Security**: Fees act as a security measure against spam and denial-of-service attacks. If transactions were entirely free, malicious actors could flood the network with countless transactions, causing congestion and disrupting the normal operation of the Bitcoin network.
- **Network Maintenance**: Miners invest resources (such as electricity and computational power) to validate transactions and secure the network by mining new blocks. Fees compensate miners for these costs and provide an incentive for them to continue maintaining the network's integrity.

And the amount of BTC we pay as fee it's determined by the network demands, which in a few words means the more transactions in the pool, the higher the fees.

![hasbulla-money](./hasbulla-money.gif)

### What's wrong with Bitcoin fees

So what's wrong with this system? Well, it's easy to guess actually. At the moment we could affirm fees are _low_, if you consider acceptable to **pay 7 dollars to exchange 100**, but at this time **the network load is small, actually close to zero** if we consider that Bitcoin should be used for. We are spreading the idea that Bitcoin should become the **worldwide people's currency**, so we could expect to use Bitcoin in place of traditional payment systems. Currently we have already accepted the idea that paying a coffee for a couple of dollars is infeasible, but what if we used it to pay goods and services with a current USD price above 100$ for instance? **The network load would soon become unsustainable** and the amount of BTC to pay for a single transaction would soon reach **thousands of dollars**.

And yes, you can think that we'll never reach the time when 7 billions of people use Bitcoin as their main currency. The issue with this, is that this scenario doesn't require billions of people paying with bitcoin to happen, but just some hundreds of millions. Let's say the population of the European Union or of the USA. That would be enough to reach the **breaking point**.

In addition to that, once there will be no more reward for miners, everything will just rely on fees, which means the network fees will become even higher.

Actually it's true there are solutions to fix this, but let me explain you why there is a **HUGE** problem with them in the next paragraph.

### Possible solutions

Up to now we have imagined two possible solutions for the **feepocalypse**.

1. **Increase the block size and/or lower the block time**: currently Bitcoin has a fixed size of 1MB for block size (actually we can store more than that) and an average block time of 10 minutes. So increasing the blocksize and eventually reducing the blocktime would allow the blockchain to accomodate more **transactions per second** in the ledger and so make the transactions more affordable. This has actually already been implemented before, but has always caused hard forks to happen, which has led to the creation of the **Bitcoin-Cash and BSV** blockchains. The issue with them is they are considered **wrong** by the Bitcoin mainstream for several reasons. So since this has happened several times in the past and has always lead to a failure, it's hard to imagine that in the future this solution could be adopted again. In addition to that, the blocksize should be increased by far more bytes than the current 1MB to be able to use the blockchain for so many transactions.
2. **n-layer chain**: Bitcoin could be used as a ledger for several user transactions on one or more layered blockchains, such as Polygon on Ethereum. This is considered the main and best solution, but as we'll see in the next chapter it comes with a terrible issue with it.

### Multi-layer scenario

Multi-layer for Bitcoin would work well as a scaling solution, so let's see how it should work.

In order to make fees affordable the layer-2 solution should have a large block size and a lower block-time, such as it's implemented in Solana.
So Alice and Bob would have their BTC2 wallets with some BTC2 pegged to some BTC in the layer-1 ledger. So for instance, if Alice wants to send 1BTC2 to Bob, the transaction is included after a validation of Alice's amount in the layer-2 pool, and after a minute the transaction is executed. At this point the validator in the layer-2 blockchain has a wallet pegged 1:1 on the layer-1, so in a 10 minutes interval it collects all the transactions in the layer-2 and then it creates a single transaction on the layer-1 to exchange BTC on the layer 1 to commit changes.

![math](./math.gif)

### The layer-2 is adopted - What happens next

So let's imagine the layer-2 blockchain were adopted. What would happen next?

We're in a world where the _feepocalypse_ is spreading and people want to use Bitcoin to buy goods and services and the layer-2 blockchain has just launched. The first thing most of people will do is to exchange their BTC for BTC2. But how the exchange happen?

In order to happen, the Layer-1 BTC are sent to **validators**, which will be the layer-2 miners, which need both to validate transactions in the layer-2, but overall have to bridge BTC to the layer-2 token. So basically validators hold a huge amount of BTC, basically the 99% of the circulating supply on the layer-1, in order to make the transactions possible.

So basically everything works well you may think. But as we're now going to see, this solution is the death to all the values Bitcoin represents today.

![pepe-nuke](./pepe-nuke.gif)

### Bitcoin and Money sovereignty

While money sovereignty over your Bitcoin is a thing at the moment, that just the status quo and as I said before **we haven't even nearly approached the maturity stage for Bitcoin**.

In case of the multi-layer scenario in particular, money sovereignty would just become part of the past. Why you say? Let me explain:

While on layer-1 if you own 1BTC you actually own that, on layer-2, if you own 1BTC2 you don't own any BTC. Instead, you just own a promise of 1BTC. Basically the layer-2 validators will let you spend 1BTC on the layer-1, but you'll never actually own it. The only users which own layer-1 BTC in this scenario are the layer-2 validators and miners, and the latters with any probability would just sell their BTC to layer-2 validators, in order to become able to spend them in the layer-2 blockchain.

So let me recap: Alice doesn't actually own any value, she just a token which lets her spend the pegged value on the layer-1. Alice just owns **tokens**, not Bitcoins.

Does that sound familiar? No? Need a hint? What about... **The current bank system**.

Yeah, exactly what Bitcoin is meant to fight. So basically, everybody who's advocating for Bitcoin is telling you to **join Bitcoin to leave the current bank system, to join a new bank system**, based on the blockchain, but which actually works exactly in the same way.

![always](./dumbledore-always.gif)

### What about decentralization

At least you may think that nobody is going to touch the algorithm and the consensus, so at least nobody can cheat on Bitcoin as it happens in the FIAT system.

But with the layer-2 used by everyone and the layer-1 used just by validators, **the network decentralization would be really threatened**. The reason is quite simple: the more BTC a validator has, the more power it has on the layer-2, which creates a **oligopoly** on the layer-1 in terms of BTC holders, with a tendency to become nearly a **monopoly**. This would lead to a **total loss of power of layer-1 nodes**, because even if the few validators agreed to arbitrarily change the consensus, people at this point **would need the layer-2 to survive**, **reluctant, but needy to accept the new system.**

And do you remember when at that conference you heard about **confiscation** and how Bitcoin is resistant to it? Well, with layer-2 and with such a poor decentralization, validators could easily confiscate your BTC2, making you unable to spend your tokens.

In such a controlled scenario, also **censorship and privacy could soon become just a memory of the past**. Once the layer-1 oligopoly has taken control of the blockchain, controlling the transactions and the users on the level-2 would be a piece of cake.

![monopoly](./monopoly.gif)

### Bitcoin could be a Honeypot

What's even worse in this hypotetical scenario is what would happen to smaller BTC holders. In the event of a massive migration to a layer-2 blockchain, those who have smaller amounts of Bitcoins (1k-100k) could see their funds locked forever in the layer-1, making Bitcoin a **Honeypot** for many people around the world. It is indeed not certain **whether these people would be able to exchange their BTC for the BTC2 token**, due to the huge fee amount in the trading. There could be different scenarios, the first where these users pay an absurd amount of their money to pay the exchange transaction, losing most of their saves, or they might create a **PSBT** with other people in their same situation to create a transaction to make the exchange.

![honeypot](./honeypot.gif)

It is worth to mention that it **is really unlikely that validator would create a gateway to help these people** in making their exchange possible, since if we have a look to the Bitcoin supply distribution, these people's BTC amount would just be dust compared to the circulating (and at this point already exchanged) value.

## Bitcoin is not people's currency

One of the recurrent point I often hear about Bitcoin is the fact it is **the people's currency**, as the opposite of the FIAT money which is in the hand of a very few inviduals and banks or governments.

While I agree with the second one, I can't say the same for the first. **Bitcoin is not actually in people's hands and it will never be!**

![banks](./banks.gif)

If we take the total supply of **21,000,000 BTC**, we can see the very uneven and peculiar distribution of it:

- Approx. **1,000,000** BTC ipotetically in the hand of Satoshi Nakamoto and so probably locked/lost forever
- Approx. **5,000,000** BTC are lost due to loss of private keys
- Approx. **5,000,000** BTC are held by Whales (those who owns 1-5k BTC) and Humpbacks (those who own more than 5k BTC), those are **less than 1,500 individuals**.
- Approx. **4,000,000** BTC are held by smaller fish
- Approx. **1,800,000** BTC are held by Miners
- Approx. **2,200,000** BTC are held by Exchanges
- Approx. **1,300,000** BTC still to be mined
- And the remaining **1,700,000** BTC in common people's hands.

![BTC supply distribution](./bitcoin-supply.svg)

So we can affirm less than 10% of the total Bitcoin supply could be held by common people. So I wouldn't say that this makes Bitcoin a more equal than FIAT money.

### Some thoughts about supply distribution

It's in my opinion important to state that the BTC amount could be redistributed at a certain time to the wallets of those who have a real wealth, like the owners of commodities, such as gold, diamonds, oil etc etc. So I want to make clear that Bitcoin can't actually redistribute wealth, since this is Bitcoin should be considered a currency, which means it is a tool to exchange goods. This means the amount of Bitcoin should actually be redistributed according to the quantity each individual needs to trade. But there is a spread sentiment of Bitcoin seen as the god who will redistribute wealth, so why not to prove them wrong?

## Whales and inflation

The last point I want to talk about it's **inflation**. I've always been told that Bitcoin cannot experience inflation, since the distributed supply is deflationary thanks to the mechanism of halving.

While it's actually undeniable that Bitcoin has a fixed maximum supply, which anyway could be easily changed in case of a ologopolistic network, that doesn't mean that Bitcoin can't experience inflation.

We have already seen in the previous chapter how massive amounts of Bitcoins are owned by few hands, and several millions of them are locked. In case at a certain time a **whale** holding a massive amount of Bitcoins decided to move them into the pool, that would actually create **inflation** for a certain period of time. In case billions of people were using Bitcoin as their main currency, **even the release of a couple of thousands of BTC would create a tsunami**, **devaluating the BTC** and causing a scenario which is very similiar to the inflation we often see in the FIAT system.

![whale-alert](./whale-alert.gif)

So should you prefer FIAT money to keep your saves safe from inflation? Of course not, but Bitcoin is for sure not the only option.

I often see the Bitcoin supporter seeing the world in black and white. It's FIAT or Bitcoin. But it's not like that at all! What about Gold, ETF, bonds? Gold in particular, is still up to day the best way to protect your saves from inflation.

## Final thoughts - Don't get me wrong

As I said at the beginning, this is not an article Pro FIAT against BTC. I just believe both systems are wrong and have several vulnerabilities within.

I also feel sad to write this article. I've been a convinced supporter of Bitcoin for a long time, sure it could have brought to the world a solution to the current awful FIAT system.

I don't even think we're doomed to keep up with the FIAT system forever. I think an alternative to Bitcoin may be a thing at a certain time in the history. A new technology which will perfectionate Bitcoin will may exist in the next decades, and it may not even rely on the blockchain.

If you believe in all the values people are spreading about Bitcoin, that's good. We're on the same boat. But those values belongs to a healthy currency, that still doesn't exist, not to Bitcoin.

Bitcoin is definitely too much polluted by investors and by people who often have a different interest for it beside of adopting it as the main currency. For example many of them want to spread the adoption of Bitcoin as a payment system just to avoid paying taxes.

In conclusion, I believe Bitcoin won't die soon, because it's still too much used as an asset for investments, but it definetely will fail in the moment people will realise it will never be able to become a real currency. This doesn't mean it will die at a certain time. It will just keep existing as is.
