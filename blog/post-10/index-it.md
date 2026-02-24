---
date: '2024-02-15 15:30:00'
slug: 'come-fare-lottery-mining-con-bitcoin'
title: 'Come fare Lottery Mining con Bitcoin?'
subtitle: 'Cosa ti serve per cominciare? Perché fare Lottery Mining? Si può guadagnare Bitcoin?'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: bitcoin
---

## Cos'è il Lottery Mining

Hai mai sentito parlare di **Lottery Mining**?
Il Lottery Mining è una strategia di Mining su Bitcoin con una probabilità bassa di vincita del blocco sulle blockchain Proof-of-work come Bitcoin, e con bassa intendo dire **MOLTO BASSA**.

Per capire come funziona, dobbiamo prima capire come funziona il mining su Bitcoin.

### Come funziona il mining su Bitcoin

Nelle blockchain proof-of-work come Bitcoin, sappiamo che i blocchi vengono aggiunti alla catena di blocchi con un intervallo temporale abbastanza costante. I miner tra un blocco e l'altro devono prendere le transazioni dalla pool, validarle e metterle in un blocco e calcolarne l'hash.

L'hash è una sequenza di numeri, compresi tra 0 e 255 e generalmente viene rappresentata nella sua forma esadecimale, come `3fc6cba4ec7329a78abbfaa59cd394a798fa33b876bf5d100b64b3faf1f70723`.

Nel caso di Bitcoin viene utilizzato l'algoritmo **SHA256**. Questo algoritmo usa sequenze da 32 valori.

Gli algoritmi di Hash rendono impossibili tornare al valore originale che ha generato l'hash e allo stesso tempo valori simili generano hash completamente diversi.

Ad esempio, sha256 di `jack` è `31611159E7E6FF7843EA4627745E89225FC866621CFCFDBD40871AF4413747CC`, mentre lo sha256 di `lack` è `E3F315EA36ABCA8F80BE6AADBEA106FD32431242455FF6693C31B7BE1D07B18F`.

Nel caso di **Bitcoin**, per minare un blocco, i miner devono trovare un valore **Nonce** numerico, il cui valore viene utilizzato per calcolare l'hash del blocco attuale, combinato alle transazioni e all'hash del blocco precedente. Questo hash che i miner devono trovare deve soddisfare la condizione di **iniziare con una certa quantità di zeri**.

Il numero di zeri che l'hash deve avere all'inizio della sequenza, dipende dalla **difficoltà** attuale. Questo parametro cambia ogni **2016 blocchi**, in base all'hashrate attuale della rete e al tempo medio impiegato per minare un blocco negli ultimi **2016** blocchi.

Questo è molto importante, in quanto permette a Bitcoin di scalare in caso in cui la potenza di calcolo aumenti nel tempo, che è esattamente quello che è accaduto a Bitcoin dalla sua nascita.

![block](./block.webp)

Se per esempio prendiamo il blocco genesi di Bitcoin, vedremo che il suo hash è `000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`.

Per riassumere quindi, **un minatore è una macchina che dev'essere capace di calcolare un'enorme quantità di hash al secondo** provando ogni volta con un nonce diverso. **Il primo miner che trova un nonce che soddisfa la condizione dell'hash attuale, vince il blocco e quindi una ricompensa in Bitcoin**.

Questo sistema permette tra l'altro ai validatori di verificare molto facilmente e velocemente se l'hash è valido, in quanto basterà calcolare l'hash del blocco usando le transazioni al suo interno, l'hash del blocco precedente e il nonce fornito.

### Davide contro Golia

Detto questo, negli scorsi anni l'industria del mining ha visto numerosi miglioramenti nel progettare macchine sempre più performanti e con un hash rate sempre maggiore.
**L'hash rate** definisce quanti hash è in grado di calcolare un dispositivo al secondo, al fine di trovare il nonce vincente.

All'inizio di Bitcoin, tutti usavano vecchi computer per fare mining in casa, ma quando farlo è diventato profittevole, ovvero quando si è potuto dare un valore fiat a Bitcoin, gruppi ristretti di persone hanno cominciato a prendere possesso del mercato del mining, prima creando vere e proprie mining farm con migliaia di computer dotati di potenti schede video per calcolare gli hash, ed in seguito utilizzando gli ASIC.

Oggi i miner usano gli ASIC, che sono circuiti integrati progettati specificatamente per fare mining su Bitcoin o altra blockchain e hanno un hash rate di centinaia di Tera Hash (TH/s).

Il costo delle mining farm e ovviamente dell'energia elettrica, ha reso il mining di bitcoin un business non proprio alla portata di tutti, ma bensì per un ristretto gruppo di persone, che possono permettersi di costruire le farm e hanno energia elettrica ad un prezzo basso o perfino energia auto prodotta.

Questo fenomeno ha portato ad un vero e proprio oligopolio del mining, contrario alla filosofia di decentralizzazione di Bitcoin.

![pepe sad](./pepe.gif)

MA, negli scorsi anni, le cose sono un po' cambiate, prima con lo sviluppo di [Valerio Vaccaro di HAN](https://github.com/valerio-vaccaro/HAN) e poi con la versione migliorata e più conosciuta, ovvero [NerdMiner](https://github.com/BitMaker-hub/NerdMiner_v2).

Questi dispositivi sono diventati degli interessanti gadget per nerd per fare **solo-mining**. Simpatici dispositivi da tenere sulla propria scrivania, ma allo stesso tempo un esercito di piccole formiche in guerra contro l'oligopolio delle mining farm.

I nerd miner girano su degli ESP32, ovvero dei micro controlli con una capacità di hash-rate molto bassa e sono coordinate in delle **public pool**, che sono gestite da volontari con nessun guadagno. Chiunque può partecipare alle pool e connettere un qualsiasi miner e se il tuo dispositivo trova il nonce giusto, beh, complimenti, ti porti a casa la bellezza di **6.25BTC**, o **3.125** dopo l'halving di aprile 2024.

Devo però specificare che l'hashrate di un **Nerd Miner** per esempio, è di circa 75KH/s, che sono 75.000 hash al secondo. Un miner ASIC medio in una farm arriva anche a 100 TH/s, ovvero **100.000.000.000.000 Hash** al secondo.

### Perché dovrei fare solo-mining

Una domanda che potresti esserti posto a questo punto è _perché dovrei sprecare il mio tempo a configurare un lottery miner allora?_ ed è una domanda lecita e giusta.
Come puoi immaginare la probabilità di vincere il blocco è **molto più bassa di quella di vincere al SuperEnalotto**.

Ma comunque, non impossibile.

Inoltre, dobbiamo anche considerare l'aspetto filosofico nel farlo: **decentralizzazione** e **partecipazione**.

Il potere di fare mining in Bitcoin, non dovrebbe essere solo in mano ad un ristretto gruppo di persone, ma della collettività. E sì, potresti pensare che un Nerd Miner non farà mai la differenza, ma in realtà se combinati possono.

Per esempio prendiamo [Public-pool.io](https://web.public-pool.io/). Attualmente ci sono 7713 Nerd miner, 192 Bitaxe, 134 cpuminer e un paio di altri dispositivi. L'hash rate totale della pool è di **587 EH/s** (Exa Hash), che è comunque un hashrate enorme, considerando su quali dispositivi viene fatto il mining.

Partecipare al mining è importante anche per **Combattere la censura su Bitcoin**. La censura su Bitcoin consiste nella capacità dei miner di non includere certe transazioni sulla blockchain in base a qualche criterio.

Inoltre, è come se potessi giocare alla lotteria con un paio di biglietti ogni 10 minuti per vincere la reward di mining, anche se è accaduto pochissime volte in passato.

![lotto-gif](./lotto.gif)

## Opzioni disponibili

Se sei interessato al lottery mining e vuoi sapere quali opzioni ci sono a disposizione, qui ne ho un paio da mostrarti:

### Nerd Miner

![nerd-miner](./nerdminer.webp)

Probabilmente il più famoso. Il suo hash rate è abbastanza una schifezza, visto che è di solo circa 75KH/s, ma è un gadget carino da mettersi sulla scrivania ed il consumo energetico è trascurabile. È dai suoi stessi autori considerato più uno strumento per insegnare il mining, che un miner effettivo.

Il mio l'ho comprato da [Satoshistore.io](https://satoshistore.io/) (no adv) per circa 60€.

Per la cronaca attualmente su public pool ce ne sono più di 7.000 attivi con un hashrate totale di circa 500MH/s, che è ancora niente, però chissà, magari nel futuro potrebbe diventare un gigantesco esercito di formichine con Giga Hash di hashrate.

### Raspberry Pi

![raspberry](./raspberrypi5.webp)

Il Raspberry pi è ancora un'opzione valida. Io ne ho due che uso per sviluppo e altre cose.
Per esempio il mio Raspberry pi 5 è sia un nodo Bitcoin, che un miner con **Cpuminer** che gira su un singolo thread, che per la cronaca dà 6.4MH/s per core.

Ho anche ancora il mio vecchio Raspberry pi 2b su cui gira solo **cpuminer** ed ha un hash rate totale di 1.4MH/s, che è ridicolo considerando che un singolo core del pi 5 fa 6 volte tanto, però alla fine è un dispositivo molto low-power, quindi non è malissimo.

![raspberry](./raspberrypi2.webp)

#### Cpuminer setup

Se vuoi sapere come fare il setup di cpuminer su un raspberry basta seguire questi passi:

Ottieni cpuminer da Github:

```sh
git clone https://github.com/tpruvot/cpuminer-multi.git
```

Installa le dipendenze con apt:

```sh
sudo apt install -y automake autoconf pkg-config libcurl4-openssl-dev libjansson-dev libssl-dev libgmp-dev zlib1g-dev make g++
```

Compila cpuminer

```sh
cd cpuminer-multi/
./build.sh
```

Linka l'eseguibile

```sh
sudo ln -s $(pwd)/cpuminer /usr/bin/cpuminer
```

Lancia cpuminer

```sh
USERNAME="<your_bitcoin_address>.<worker_name>"
POOL_URL="stratum+tcp://public-pool.io:21496"
cpuminer -a sha256d -o "$POOL_URL" -u "$USERNAME" -p "x" -D -r 10
```

A questo punto, una volta connesso dovresti poter vedere il tuo worker su public pool public-pool.io/#/app/your_btc_address.

### Bitaxe

![bitaxe](./bitaxe.webp)

Per quelli che vogliono una soluzione orientata alle performance, pur mantenendo dei consumi bassi, il [Bitaxe Ultra](https://bitaxe.org/) è un'ottima soluzione per il solo-mining. È completamente open-source, ha un hash rate di 500GH/s e consuma solo 12W ora.

Costa tra i 200 e i 300 euro ed è molto facile da configurare.

## Fattibilità

Va bene, ma qual è la fattibilità di vincere un blocco con il lottery-mining? Beh, diciamo che, come suggerisce il nome, è davvero una lotteria e devi accettare che, probabilmente, non sarai mai in grado di vincere un blocco.

Attualmente la difficoltà del bitcoin è 10, il che significa che i primi 10 byte dell'hash generato devono essere 0x00. La probabilità di generare un sha256 casuale con questo requisito è `8,27 * 10^-25`, che è estremamente bassa, quindi possiamo serenamente affermare che è molto molto molto improbabile che accada.

### Qualcuno ce l'ha fatta

Ma qualcuno ce l'ha fatta in realtà. Secondo alcune statistiche i lottery miner avrebbero vinto circa un blocco al mese nel 2023.

## Pool privata

Nel caso volessi utilizzare una pool tua, puoi leggere questo articolo per vedere come fare:

[Come configurare un pool di mining Bitcoin in solitaria](https://blog.veeso.dev/blog/it/come-configurare-un-pool-di-mining-bitcoin-in-solitaria/)

## Conclusioni

Penso che il lottery-mining nelle public pool siano una buona pratica per tentare di mantenere decentralizzato il tutto e più persone dovrebbero entrare nel giro. Certo, ora è un hashrate trascurabile, ma magari nel futuro con più persone che tirano su un miner, saremmo capaci di vincere più blocchi.

Inoltre penso che se a casa hai un SBC low-power che magari fa poco lavoro, metterci sopra un miner non sia una cattiva idea.

Il nerd miner invece, lo trovo un gadget molto carino, ma la vedo molto dura farcela.

Spero quindi che ti unisca alla causa e che soprattutto ti diverta
