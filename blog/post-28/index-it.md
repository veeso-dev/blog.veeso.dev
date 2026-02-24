---
date: '2025-02-21 15:15:00'
slug: 'come-configurare-un-pool-di-mining-bitcoin-in-solitaria'
title: 'Come configurare un pool di mining Bitcoin in solitaria'
subtitle: 'Oggi impareremo come configurare un pool di mining Bitcoin in solitaria con un Raspberry Pi'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: bitcoin
---

## A proposito del lottery mining

Questa è un'espansione del mio precedente articolo ["Come iniziare con il Bitcoin Lottery Mining"](https://blog.veeso.dev/blog/it/come-fare-lottery-mining-con-bitcoin/) .Quindi, se ti interessa **fare lottery mining su pool pubblici** , puoi interrompere la lettura qui e andare direttamente al precedente articolo.

## Perché fare solo mining su un pool privato?

Preferire un pool privato invece di affidarsi a pool pubblici come **public-pool.io** o **ckpool.org** offre diversi vantaggi:

- **Privacy** : Non devi condividere la tua potenza di mining con altri.
- **Controllo** : Puoi impostare le tue regole e commissioni.
- **Sicurezza** : Puoi essere certo che il pool non stia barando.
  - Questo è particolarmente importante per il **lottery mining**; nei pool pubblici alcuni miner sono semplicemente macchine malevole con un falso hashrate, che possono rubarti l'occasione di minare il blocco.
- **Nessuna commissione** : Alcuni pool hanno una commissione minima del 5% o più che va pagata al proprietario del pool.
- **Interruzioni** : public-pool è spesso offline, quindi potresti non poter minare per un certo periodo.

Se ti ho convinto a configurare il tuo pool, iniziamo!

## Configurazione del Pool

### Requisiti

Per configurare il tuo pool, avrai bisogno di una macchina Linux che possa funzionare 24/7.

Ti consiglio di usare un Raspberry Pi modello 4 o 3, perché è economico ma allo stesso tempo offre una quantità decente di RAM e CPU.

Il Raspberry Pi 2 è probabilmente troppo lento, e il Raspberry Pi 1 è decisamente fuori discussione.

Inoltre, è richiesta una conoscenza minima di Linux e scripting shell.
Ti serviranno anche le seguenti dipendenze da installare con `apt`:

```bash
sudo apt update
sudo apt install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils git screen yasm libzmq3-dev
```

### Monitoraggio

Dal momento che il nostro pool deve funzionare 24/7, è necessario un software che controlli se il pool è attivo e lo riavvii in caso contrario.
Di solito opto per **monit** . Ecco come configurarlo:

```bash
sudo apt update
sudo apt install monit

# Abilitare monit
sudo systemctl enable monit
sudo systemctl start monit
```

Poi devi creare un file di configurazione per monit.

Per prima cosa, spostiamoci nella cartella di configurazione di monit:

```bash
cd /etc/monit/conf-available
```

E scriviamo tutte le configurazioni dei servizi di cui abbiamo bisogno.

```bash
nano bitcoin-pool
```

A questo punto colleghiamo la configurazione ai file _enabled_ e ricarichiamo monit:

```bash
cd /etc/monit/conf-enabled
ln -s /etc/monit/conf-available/bitcoin-pool
monit reload
```

### Configurare Bitcoin-RPC

A questo punto dobbiamo configurare il servizio `bitcoind`.

Per far funzionare il nostro pool, dobbiamo avere un full node attivo, ma non preoccuparti dello spazio su disco: conserveremo solo la quantità minima di dati, circa 5000 blocchi (il minimo richiesto per ckpool dovrebbe essere tra 500 e 1000).

Puoi scaricare l'ultima versione di Bitcoin Core dal [sito ufficiale](https://bitcoin.org/en/download) .Scarica il link per `ARM 64 Linux (64bit)`, se utilizzi un Raspberry Pi 3/4.

```bash
mkdir -p /app
wget -O /tmp/bitcoin.tar.gz https://bitcoin.org/bin/bitcoin-core-27.0/bitcoin-27.0-aarch64-linux-gnu.tar.gz
tar xzvf /tmp/bitcoin.tar.gz
cd /app/bitcoin-27.0
sudo cp bin/* /usr/local/bin

# Impostare la configurazione per bitcoind
nano /etc/bitcoin.conf
```

E scrivi questa configurazione (puoi cambiare `rpcuser` e `rpcpassword` se lo desideri):

```conf
# blocchi da mantenere
prune=5000
# directory dati
datadir=/app/bitcoin/data
nodebuglogfile=1
server=1
rpcuser=pi
rpcpassword=bitcoind
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
```

Infine, dobbiamo configurare la directory per bitcoin:

```bash
mkdir -p /app/bitcoin/data

touch /app/bitcoin/service.sh
chmod +x /app/bitcoin/service.sh
nano /app/bitcoin/service.sh
```

E per `bitcoind` abbiamo finito. Tieni presente che una volta avviato `bitcoind`, la sincronizzazione della blockchain potrebbe richiedere molto tempo.

Nel mio caso, la sincronizzazione della blockchain ha richiesto circa una settimana.

### Configurare CkPool

Ora dobbiamo configurare il software `ckpool`.

`CkPool` è un software open-source che ti permette di gestire il tuo mining pool.

Per prima cosa, clona il repository git e compila il software:

```bash
git clone https://bitbucket.org/ckolivas/ckpool.git /app/ckpool

cd /app/ckpool
./autogen.sh
./configure
make -j 2

# Collegare i binari al PATH
ln -s /app/ckpool/src/ckpool /usr/local/bin/ckpool
ln -s /app/ckpool/src/ckpmsg /usr/local/bin/ckpmsg
```

Infine, configuriamo `ckpool`:

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

Quindi, devi solo cambiare:

- `BITCOIN_RPC_USERNAME` e `BITCOIN_RPC_PASSWORD` con i valori che hai impostato nel file `bitcoin.conf`.
- `YOUR_BITCOIN_ADDRESS_WHERE_TO_RECEIVE_BTC` con il tuo indirizzo Bitcoin, dove vuoi ricevere i BTC minati.

### Collegare i tuoi miner al pool

Ecco fatto! Ora puoi collegare i tuoi miner al tuo pool.
Per farlo, imposta l'URL RPC come `IP_DEL_TUO_RASPBERRY:3333`.Se necessario, imposta il tuo username come `YOUR_BITCOIN_ADDRESS.HOSTNAME`, dove:

- `YOUR_BITCOIN_ADDRESS` è il tuo indirizzo Bitcoin.
- `HOSTNAME` è il nome della macchina miner.

### Verificare che tutto funzioni

Se hai già eseguito `monit reload`, dovresti vedere i servizi attivi.Puoi controllare con `monit summary` per verificare che tutto sia impostato su `OK`.Puoi anche controllare i log dei servizi usando `screen`:

```bash
screen -r bitcoind

# output del log
# premi CTRL+A e poi D per uscire dalla sessione

screen -r ckpool

# output del log
# premi CTRL+A e poi D per uscire dalla sessione
```

## Conclusioni

Ecco fatto! Hai configurato con successo il tuo **Bitcoin Solo Mining Pool** . 🚀

Questo articolo insieme a ["Come fare lottery mining con Bitcoin"](https://blog.veeso.dev/blog/it/come-fare-lottery-mining-con-bitcoin/), può essere considerato **La guida definitiva al mining di Bitcoin in solitaria**.

![noot-intensifies](./noot.gif)
