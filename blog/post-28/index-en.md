---
date: '2025-02-21 15:15:00'
slug: 'how-to-setup-a-bitcoin-solo-mining-pool'
title: 'How to setup a Bitcoin Solo Mining Pool'
description: 'Today we will learn how to setup a Bitcoin Solo Mining Pool with a Raspberry Pi'
author: 'veeso'
featured_image: featured.jpeg
category: blockchain
reading_time: '6'
---

## About lottery mining

This is an expansion of my previous article ["How to get started with Bitcoin Lottery Mining"](https://blog.veeso.dev/blog/en/how-to-get-started-with-bitcoin-lottery-mining/).

So if you're just interested in **lottery mining on public pools**, you can stop reading here and go to the previous article.

## Why solo mining on a private pool?

Preferring a private pool instead of relying on public pools such as **public-pool.io** or **ckpool.org** has several advantages:

- **Privacy**: You don't have to share your mining power with others.
- **Control**: You can set your own rules and fees.
- **Security**: You can be sure that the pool is not cheating.
  - In particular this is important for **lottery mining**; in public-pools some miners are just malicious machines with a fake hashrate, which can steal your lottery ticket.
- **No fee**: Some pool have a minimum of 5% or more fee to pay to the pool owner.
- **Downtimes**: public-pool is quite often down, so you can't mine for a while.

If I have convinced you on setting up your own pool, let's start!

## Setting up the Pool

### Requirements

In order to set your own pool, you'll need a Linux machine that can basically run 24/7.

I suggest you using a Raspberry pi model 4 or 3, because it's cheap, but at the same time we require a decent amount of RAM and CPU.

Raspberry pi 2 is probably too slow, and Raspberry pi 1 is definitely out of the question.

You also need a minimum knowledge of Linux and shell scripting.

You also need for sure these dependencies to be installed with apt:

```bash
sudo apt update
sudo apt install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils git screen yasm libzmq3-dev
```

### Monitoring

Since we need that our pool runs 24/7, we need a software that checks if the pool is running and restart it if it's not.

I usually opt for **monit**. So let's see the setup for it.

```bash
sudo apt update
sudo apt install monit

# Enable monit
sudo systemctl enable monit
sudo systemctl start monit
```

Then you need to create a configuration file for monit.

First let's move to the monit configuration folder:

```bash
cd /etc/monit/conf-available
```

And let's write all the configuration services that we need.

```bash
nano bitcoin-pool
```

```monit
check process bitcoind with pidfile /var/run/bitcoind.pid
   start program = "/app/bitcoin/service.sh start"
   stop  program = "/app/bitcoin/service.sh stop"

check process ckpool with pidfile /tmp/ckpool/main.pid
   start program = "/app/ckpool/service.sh start"
   stop  program = "/app/ckpool/service.sh stop"

# check that network is always reachable
check host internet with address 1.1.1.1
    if failed ping 3 times within 30 cycles then exec "/usr/sbin/reboot"

# optional; only if you want to mine with your raspberry as well
check process cpuminer with pidfile /var/run/cpuminer.pid
   start program = "/app/cpuminer-multi/service.sh start"
   stop  program = "/app/cpuminer-multi/service.sh stop"
```

At this point we link the configuration to _enabled_ configs and reload monit:

```bash
cd /etc/monit/conf-enabled
ln -s /etc/monit/conf-available/bitcoin-pool
monit reload
```

### Setup Bitcoin-RPC

At this point we need to setup the Bitcoind service.

Indeed in order to run our pool, we need to have a full node running, but don't worry about disk space, we'll just keep
the minimum amount of data, about 5000 blocks. (minimum required for ckpool should be between 500-1000).

You can get the latest version of Bitcoin Core from [the official website](https://bitcoin.org/en/download).

Here get the link for `ARM 64 Linux (64bit)`. for Raspberry pi 3/4.

```bash
mkdir -p /app
wget -O /tmp/bitcoin.tar.gz https://bitcoin.org/bin/bitcoin-core-27.0/bitcoin-27.0-aarch64-linux-gnu.tar.gz
tar xzvf /tmp/bitcoin.tar.gz
cd /app/bitcoin-27.0
sudo cp bin/* /usr/local/bin

# set configuration for bitcoind
nano /etc/bitcoin.conf
```

And write this to your configuration (you can change the rpcuser and rpcpassword if you wish):

```conf
# block to keep
prune=5000
# data dir
datadir=/app/bitcoin/data
nodebuglogfile=1
server=1
rpcuser=pi
rpcpassword=bitcoind
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
```

Finally we need to setup the directory for bitcoin:

```bash
mkdir -p /app/bitcoin/data

touch /app/bitcoin/service.sh
chmod +x /app/bitcoin/service.sh
nano /app/bitcoin/service.sh
```

And write this to your service script:

```bash
#!/bin/sh

cd "$(dirname "$0")" || exit 1

APP_NAME="bitcoind"
PIDFILE="/var/run/$APP_NAME.pid"

info() {
    printf '%s\n' "${BOLD}${GREY}>${NO_COLOR} $*"
}

error() {
    printf '%s\n' "${RED}x $*${NO_COLOR}" >&2
}

start() {
  screen -S "$APP_NAME" -d -m bitcoind -pid="$PIDFILE" -conf="/etc/bitcoin.conf" -zmqpubhashblock=tcp://127.0.0.1:28332

  return 0
}

stop() {
  info "stopping $APP_NAME"
  PID=$(cat $PIDFILE)
  if [ -z "$PID" ]; then
    error "Could not find any PID for $APP_NAME"
    return 1
  fi
  info "killing PID $PID"
  kill $PID

  return 0
}

case "$1" in

  "start")
    start
    ;;

  "stop")
    stop
    ;;

  "restart")
    stop
    start
    ;;

  *)
    "unknown operation $OP"
    exit 1
    ;;

esac
```

And for bitcoind we're done. Consider that once started bitcoind it may take a very long time to sync the blockchain.

In my case it took about one week to sync the blockchain.

### Setup CkPool

Now we need to setup the ckpool software.

CkPool is an opensource software that allows you to run your own mining pool.

First of all clone the git repository and build it:

```bash
git clone https://bitbucket.org/ckolivas/ckpool.git /app/ckpool

cd /app/ckpool
./autogen.sh
./configure
make -j 2

# link binaries to PATH
ln -s /app/ckpool/src/ckpool /usr/local/bin/ckpool
ln -s /app/ckpool/src/ckpmsg /usr/local/bin/ckpmsg
```

Then we need to setup the service script for ckpool:

```bash
nano service.sh
```

```bash
#!/bin/sh

cd "$(dirname "$0")" || exit 1

APP_NAME="ckpool"
PIDFILE="/tmp/ckpool/main.pid"

info() {
    printf '%s\n' "${BOLD}${GREY}>${NO_COLOR} $*"
}

error() {
    printf '%s\n' "${RED}x $*${NO_COLOR}" >&2
}

start() {
  screen -S "$APP_NAME" -d -m ckpool -B

  return 0
}

stop() {
  info "stopping $APP_NAME"
  PID=$(cat $PIDFILE)
  if [ -z "$PID" ]; then
    error "Could not find any PID for $APP_NAME"
    return 1
  fi
  info "killing PID $PID"
  kill $PID

  return 0
}

case "$1" in

  "start")
    start
    ;;

  "stop")
    stop
    ;;

  "restart")
    stop
    start
    ;;

  *)
    "unknown operation $OP"
    exit 1
    ;;

esac
```

And finally let's configure ckpool:

```bash
nano /app/ckpool/ckpool.conf
```

```json
{
  "btcd": [
    {
      "url": "localhost:8332",
      "auth": "BITCOIN_RPC_USERNAME",
      "pass": "BITCOIN_RPC_PASSWORD",
      "notify": true
    }
  ],
  "btcaddress": "YOUR_BITCOIN_ADDRESS_WHERE_TO_RECEIVE_BTC",
  "btcsig": "/Proudly mined by a Solo Miner/",
  "blockpoll": 100,
  "nonce1length": 4,
  "nonce2length": 8,
  "update_interval": 30,
  "version_mask": "1fffe000",
  "mindiff": 1,
  "startdiff": 42,
  "maxdiff": 0,
  "zmqblock": "tcp://127.0.0.1:28332",
  "logdir": "logs"
}
```

So just change:

- `BITCOIN_RPC_USERNAME` and `BITCOIN_RPC_PASSWORD` with the values you set in the `bitcoin.conf` file.
- `YOUR_BITCOIN_ADDRESS_WHERE_TO_RECEIVE_BTC` with your Bitcoin address, where you want to receive the mined BTC.

### Connect your Miners to the pool

And that's it! You can now connect your miners to your pool.

To do so, just set the RPC url as `IP_OF_YOUR_RASPBERRY:3333`.

In case it's required just set your username as `YOUR_BITCOIN_ADDRESS.HOSTNAME`, where:

- `YOUR_BITCOIN_ADDRESS` is your Bitcoin address.
- `HOSTNAME` is the hostname of your miner machine.

### Check if it works

At this point, if you've already run `monit reload`, you should see the services running.

You can check with `monit summary` and check if everything is set to `OK`.

Actually you can also check the logs of the services using `screen`:

```bash
screen -r bitcoind

# output of the log
# press CTRL+A and then D to detach from the screen

screen -r ckpool

# output of the log
# press CTRL+A and then D to detach from the screen
```

## Conclusions

So that's it! You've successfully setup your own Bitcoin Solo Mining Pool.

This should be considered along with ["How to get started with Bitcoin Lottery Mining"](https://blog.veeso.dev/blog/en/how-to-get-started-with-bitcoin-lottery-mining/), the **Ultimate guide to Solo Mining On Bitcoin**.

![noot-intensifies](./noot.gif)
