---
date: '2025-05-05 11:30:00'
slug: 'an-abstract-of-a-real-p2p-electronic-cash-system'
title: 'An Abstract of a real P2P Electronic Cash System'
subtitle: 'A draft and analysis of a real P2P Electronic Cash System'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: bitcoin
---

## We have P2P Electronic Cash Systems at home

> Bitcoin: A Peer-to-Peer Electronic Cash System

Sounds familiar? This is the title of the whitepaper of Bitcoin, which starts with a strong claim:

> A purely peer-to-peer version of electronic cash would allow online
> payments to be sent directly from one party to another without going through a
> financial institution

This sounds cool, but the issue with that as I already covered in the past, is that it's not true.

Currently, we don't have any Electronic P2P cash system that works. Why isn't that for Bitcoin?

## What is a P2P Electronic Cash System?

What we need to understand is that a Cash System is made of two parts:

- **Ledger**: This part is the one that keeps track of balances and transactions and also of issuing new money. This part of course is the most important part of a cash system, and it must be trusted.
- **Payment**: This part is the one that allows people to send money to each other. Users should be able to trust other users _enough_ to send money to them, but it's not guaranteed that trust will be 100% of the time.

Bitcoin for instance, is P2P for the **Ledger** part. The ledger is distributed in a P2P way where (more or less - I've already talked about how [Bitcoin is not really decentralized in this article](https://blog.veeso.dev/blog/en/why-bitcoin-is-not-decentralized--in-any-way/)) everybody can partecipate in the network both to create new blocks and to validate them.

Why isn't it P2P for the **Payment** part?

Well, to answer that, we need to think about how a P2P payment system would work.

The best example of course is **cash**.

1. Alice withdraw 10$ from the bank (Ledger)
2. Alice gives Bob a 10$ bill (Payment)
3. Bob gives Alice a sandwich (Payment)
4. Bob deposits the 10$ bill in the bank (Ledger)

Why **isn't Bitcoin P2P for payments** then?

Because during payments all the node partecipate in the transaction. All the nodes must validate that exact transaction and during the block creation, the transaction is validated by all the miners.

## Thinking of a real P2P Electronic Cash System

So, how can we create a real P2P Electronic Cash System?

In this article I will not talk about the **Ledger** part, because we could use anything like Bitcoin for that. I'm not saying that Bitcoin is doing that perfectly (like throughput is a problem), but we can use it as a Ledger. I will focus on the P2P Payment part.

Let's list the requirements and the problems we need to solve.

### Glossary

- **Payment Flow**: with payment flow we mean every payment made between n parties, but with the same withdraw origin. The end of the payment flow is when the money is deposited in the bank from each party involved in the payment flow.

## Problems with Payment Process

To recap, we need to be able to solve this process:

1. Alice withdraw X$ from the account (Ledger)
2. Alice sends Bob X$ (Payment)
3. ... n transactions with the same money can happen in between
4. Everybody that has received the money can deposit it in the bank (Ledger)
5. The Ledger must be able to check if the money is real and if it has been already spent or not.

And we need to have a system that in between of Ledger/Payment/Ledger mechanism is able to solve the following problems:

- **Counterfeiting**: What if Alice gives Bob fake dollars? The authority must take care of making hard to counterfeit money and provide a way for receivers to check if money is real or not.
- **Double spend**: Can Alice deposit the same 10$ after spending it? Well, in the real world this is not possible, because you know we still can't clone matter.
- Or again double spend: If Bob then gives 5$ to Charlie, he must be able to deposit up to 5$ in the bank, so the P2P payment system must be able to take care of _n_ transactions which have been made P2P.
- **Thin-air creation**: Alice mustn't be able to spend money that has been created out of thin air. This means that the system must be able to check if the money is real and was actually withdrawn from the ledger before.

### Medium

We need to have a medium that is able to transfer money from Alice to Bob. This medium must:

- be **Cheap**: The medium must be affordable for everybody. Of course the best solution would be to use mobile phones, because everybody has one.
- be **Programmable**: The medium must be able to make signatures, so it must be performant.
- **Communicate**: The medium must be able to communicate both with the Ledger and with other payment mediums. Of course for the ledger we've got HTTP, but for the other payment we need to exchange messages. We've got many options here, and probably it should be more than one, as long as the protocol is the same for all of them; options are: Bluetooth, NFC, WiFi Direct, copy/paste of message etc.

### Trust

We've got two layers of trust to solve:

1. **Trust during the payment**: Bob must be sure that Alice is not giving him counterfeit money.
2. **Trust between the Ledger and the Payment**: When money is deposited, the Ledger must be able to prevent double deposit and that every party involved in the flow of transactions from the same origin has their part of the money.
   1. Alice withdraw 10$ from the ledger
   2. Alice gives Bob 5$
   3. Alice gives Charlie 2$
   4. Bob gives Charlie 1$

   Eventually the ledger must be able to be sure that Alice can deposit 3$, Bob 4$ and Charlie 3$.

### Fee-less

Do you pay fees when you pay with cash? No. So we need to have a system that is able to transfer money without fees.

Of course this doesn't mean that the deposit/withdraw process is fee-less. Probably it will have fees, but the payment flow must be fee-less.

### Privacy

We need to have a system that is able to transfer money without being tracked.

This means that the entire payment flow must use pseudonymous identifiers, which are unique for each payment flow.

## Implementation abstract

Of course I'm not even working on this project, at least for now, but I wanted to write down an abstract of how this system could work as technology at least.

Of course the main issue with this system is how do we implement the Payment part and solve its issues.

Currently I don't think we have anything like that out there.

So we need to find a way to keep track of all the payments during the payment flow and ensure there's no double spend, so the ledger can eventually be sure that the money is real and that it hasn't been spent twice or created out of thin air. Let's see some ideas:

### ZkSNARKs

ZkSNARKs are a **zero-knowledge proof** technology that allows to prove that a transaction is valid without revealing the transaction itself.

We could have a system where each proof is assigned to a banknote, and each banknote has a unique identifier. This way we can keep track of all the transactions and ensure that the money is real and hasn't been spent twice.

Pros:

- It works offline
- it can be used for P2P
- It can be composed with other payments

Cons:

- It requires a lot of computational power; too much for a mobile phone

### Micro Local Blockchains

This idea consists of creating a local blockchain for each payment flow. This way we can keep track of all the transactions and ensure that the money is real and hasn't been spent twice.

The issue is of course that it must be distributed along all the parties involved in the payment flow, and this means that we need to have a way to communicate with each other.

So they could have a private networks provided by the payment medium.

Pros:

- Decently performant
- Quite easy to implement

Cons:

- Partecipants must be online to sync
- 51% attack is possible
- Takes a lot of space; too much if we have multiple payment flows

### Blind signatures

Blind signatures are a technology that allows to sign a message without revealing the message itself. This way we can keep track of all the transactions and ensure that the money is real and hasn't been spent twice.

The idea is inspired by the [Chaumian e-cash](https://en.wikipedia.org/wiki/Ecash) system, where each banknote is signed by the bank and the signature is blind.

Pros:

- Privacy
- Quite performant
- Can be used for P2P
- Can be composed with other payments flows

Cons:

- Requires the ledger to track the serial numbers of the banknotes: this could be solved if the lifetime of the banknotes is limited to the payment flow, so it could live for a couple of days and limited to that payment flow only.
- Can't split banknotes, unless the ledger exposes a way to do that; like burning the banknote and issuing split banknotes.
- Verification of banknotes must be done online; unless only the initial withdrawer has the serials and can prove they're valid.

### Hybrid solution 1 - ZkSNARKs + Blind Signatures (partially offline)

Probably a good solution would be to combine the solutions above.

For instance we could use Blind Signatures for banknotes and ZkSNARKs to prove the banknotes are valid.

The idea could be this:

1. Alice withdraws 10$ from the ledger. The ledger issues a blind signatures for the banknote and gives it to Alice. It also provides a ZkSNARK proof that the serial numbers are valid and issued by the ledger.
2. Alice gives Bob 5$ and a ZkSNARK proof that the banknote is valid.
3. Bob gives Charlie 1$ and a ZkSNARK proof that the banknote is valid.
4. Alice deposits 3$ in the bank. The ledger checks the ZkSNARK proof and verifies that the banknote is valid and hasn't been spent twice. The serial is burned on the ledger
5. Everybody completes the payment flow and deposits the money in the bank. The ledger checks the ZkSNARK proof and verifies that the banknote is valid and hasn't been spent twice. The serial is burned on the ledger
6. Once all serials are burned, the ledger can destroy the history for that payment flow.

Problems:

- **Split banknotes**: we said before that this would require the ledger to expose a way to split banknotes. This could be done by burning the banknote and issuing two new banknotes with the same serial number. But the issue is that the proof at this point could be inconsistent, unless the proof is somehow already valid also for the split banknotes. Probably it could be possible, but I'm not 100% sure.

### Hybrid solution 2 - ZkSNARKs + Blind Signatures + Commitments (fully offline)

This solution builds upon the previous hybrid approach by adding commitments to support offline and verifiable splitting of banknotes.

The idea is the following:

1. Withdrawal:
   1. Alice withdraws 10$ from the ledger.
   2. The ledger:
      1. issues a blind signature over a banknote commitment (e.g., a Pedersen commitment: C = Commit(serial, amount, randomness))
      2. provides a zkSNARK proof that the commitment was correctly created from valid funds and is unique (i.e., not double-issued)
2. Payment:
   1. Alice wants to pay Bob 5$.
   2. She creates two new commitments:
      1. One for Bob: C_Bob = Commit(serial_Bob, 5$, randomness_Bob)
      2. One for herself (change): C_Alice = Commit(serial_Alice, 5$, randomness_Alice)
   3. She generates a zkSNARK proof that:
      1. The original commitment was valid
      2. The two new commitments together equal the original one in value
      3. The split is non-interactive and doesn't reveal any amounts or serials
      4. A nullifier is attached to the original note to prevent double-spend
   4. She sends to Bob:
      1. The new commitment C_Bob
      2. The zk-proof
      3. The nullifier of the parent note
3. Further payments:
   1. Bob can continue the process and split/spend his commitment with others (e.g., 1$ to Charlie), attaching similar zk-proofs.
4. Deposit:
   1. When any party wants to deposit funds back into the ledger:
      1. They reveal the nullifier of the note
      2. The zk-proof confirms the note is valid, unspent, and derived correctly
      3. The ledger checks that the nullifier hasn't already been used
      4. If valid, the funds are credited and the nullifier is marked as `burned`
5. History pruning:
   1. Once all derived commitments from a payment flow are deposited, the ledger can prune the state and discard all intermediate data.

Pros:

- Offline and P2P payments are fully possible
- Anonymity is preserved
- Splitting banknotes is possible without revealing amounts or serials
- Double-spending is prevented through nullifiers and zk-proofs
- The ledger can prune history once all commitments are deposited, so the state doesn't grow indefinitely

Challenges:

- Currently, zkSNARKs are not performant enough for mobile phones so it may be not feasible yet
- The complexity of the zkSNARK proofs may require advanced cryptographic knowledge to implement correctly
- Commitments and nullifier must be managed carefully to avoid collisions or misuse

## Conclusion

In this article I wanted to provide an abstract of a real P2P Electronic Cash System.

I don't want to care about economics, like is that coin backed by something or not. That's not the point of this article, this could even be used for FIAT money if you ask me. I'm a software engineer, so I care about the technology behind it.

Will I work on this project? I don't know actually, maybe. Of course it could be a revolution for the payment system, but I think that at the moment it could be really hard to implement.
