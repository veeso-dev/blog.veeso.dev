---
date: '2024-12-18 13:00:00'
slug: 'rivoluzionare-il-mercato-immobiliare-con-ekoke-dao'
title: 'Rivoluzionare il mercato immobiliare con EKOKE DAO'
subtitle: 'con EKOKE DAO vogliamo sostituire il tradizionale mutuo bancario con un modello sostenibile e decentralizzato basato su rate sulla blockchain'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
---

## Introduzione

Nell'ultimo anno ho lavorato intensamente allo sviluppo del progetto [**EKOKE DAO**](https://ekokedao.com). Sono il principale ingegnere software del progetto e ho personalmente progettato l'architettura e implementato gran parte del codice.

Ora, dopo più di un anno di duro lavoro, siamo finalmente pronti a lanciare il progetto. Permettetemi di presentarvi **EKOKE DAO**.

## Cos'è EKOKE DAO

EKOKE DAO è un sistema che ha il potenziale di **rivoluzionare** il modo in cui le persone comprano e vendono immobili.

### Il problema che vogliamo risolvere

Attualmente, gli immobili vengono venduti principalmente con il pagamento dell'intero importo del prezzo della proprietà o tramite un **mutuo**.

Il problema è che i mutui sono recentemente diventati problematici a causa del **crescente tasso di interesse**.  
I mutui a tasso variabile possono portare il compratore a pagare una somma che arriva fino a **il doppio del prezzo della proprietà**!

In uno scenario in cui **i giovani non possono permettersi di acquistare immobili** come accadeva nei decenni passati, **affrontare un mutuo è diventato un problema**.

E se potessimo avere un sistema che permetta di pagare gli immobili a rate **con un tasso di interesse fisso**?

### Ecco che arriva EKOKE DAO

Con EKOKE DAO abbiamo implementato un sistema decentralizzato che consente a chiunque di acquistare una casa a rate con un **tasso di interesse fisso tra il 5% e il 15%**.

Ma come funziona?

### Processo di vendita

1. Per ogni vendita di proprietà facciamo firmare a **agenzia**, **compratore** e **venditore** un contratto di vendita che contiene le seguenti informazioni, concordate dalle parti:

    - prezzo di una rata
    - numero di rate (installments)
    - data di scadenza del contratto

2. La nostra DAPP (un'applicazione che opera sulla blockchain) registra il contratto di vendita nel registro e genera un **NFT**, chiamato **Deferred**, per ogni rata. Tutti gli NFT generati vengono assegnati al **venditore** della proprietà.
3. Il **compratore** acquista periodicamente il prossimo token con USDT attraverso il **Marketplace**.

Ma perché tutto questo è vantaggioso? Qual è il **vantaggio per il venditore** e come può partecipare la comunità se questo è un DAO?

Vediamolo!

### Parliamo prima dei token

Nell'ambiente di **EKOKE DAO** esistono **3 diversi token**:

- **Deferred**: Deferred è un token NFT (**ERC721**). **Ogni token** rappresenta una **rata** (*installment*) di un contratto di vendita. I token Deferred vengono **generati** quando un **contratto di vendita viene creato**. Esiste un token per ogni rata e ha un prezzo fisso espresso in dollari. Inizialmente sono di proprietà del venditore dell'immobile e devono essere acquistati dal compratore per pagare il venditore.
- **EKOKE**: EKOKE è un token fungibile (**ERC20**). Viene utilizzato come ricompensa per gli investitori che *prestano* denaro al compratore. La quantità totale di EKOKE è fissata a **8,880,101.01** token e la ricompensa per gli investitori diminuirà automaticamente nel tempo seguendo un algoritmo predefinito.
- **EKOGOV**: Il token per la governance di EKOKE DAO.

> Nota: il smart contract di Deferred è condiviso tra tutti i contratti di vendita, quindi non c'è uno smart contract separato per ogni vendita.

### Prestiti - Chiunque può pagare le rate

Tutti gli NFT, fintanto che sono ancora di proprietà del **venditore**, possono essere acquistati da **chiunque** sul marketplace. Ma perché?

Abbiamo detto che gli **investitori** (la terza parte che acquista l'NFT) possono *prestare* denaro al compratore. Questo avviene acquistando il token **Deferred** sul Marketplace.

In questo momento gli **investitori** ricevono immediatamente una ricompensa in **token EKOKE ERC20**.

Ovviamente il denaro speso dall'**investitore** per acquistare l'NFT Deferred non è perso! Verrà rimborsato dal **compratore** quando pagherà quella rata.

E **tutto ciò avviene automaticamente**! **Non è necessario mettere in vendita il token manualmente**, il token viene **automaticamente listato** nel marketplace di EKOKE DAO e rimane lì fino a quando il compratore non lo acquista da te.

### L'uso del token EKOKE

Il token EKOKE è pensato come un **asset** che **dovrebbe aumentare di valore nel tempo**. Vediamo perché:

1. Le ricompense date agli **investitori** diminuiscono con ogni contratto creato. Ad esempio, il primo contratto potrebbe offrire una ricompensa di **50 EKOKE** per ogni NFT acquistato, il secondo **49 EKOKE**, il terzo **48.5** e così via. Questo rende estremamente conveniente per un utente acquistare una rata, poiché la ricompensa che riceverà aumenterà di valore nel tempo.
2. La quantità di token EKOKE è limitata a **8,880,101** token, rendendo il token scarso.
3. Quando il pool di ricompense si esaurisce, **venditori** o **compratori** dovranno bruciare token per ricaricare il pool. Per questo motivo, il **Reward Pool** inizierà con il 66% della fornitura totale, ma ogni ricompensa erogata ridurrà la sua liquidità. Quando raggiungerà lo 0, gli utenti dovranno bruciare token per consentire la generazione di nuove ricompense.

## Un sistema Win-Win per tutti

EKOKE DAO offre un sistema Win-Win per **compratori**, **venditori** e **investitori**:

- **Compratori**: possono pagare le proprie case con rate gestibili e tassi di interesse bassi e fissi.
- **Venditori**: ricevono ricompense per utilizzare EKOKE DAO e possono vendere la proprietà a un prezzo più alto, poiché il compratore può permettersi di pagare di più senza subire alti tassi di interesse.
- **Investitori**: ricevono una ricompensa che funziona come un asset il cui prezzo aumenterà nel tempo.

![Ciclo di vita di un contratto di vendita](./lifecycle.webp)

## Il ruolo del DAO

Ogni attore può contribuire al DAO in diversi modi:

- **Sviluppatori**: possono migliorare il codice del progetto EKOKE DAO tramite i repository su Github. Il codice è **100% open-source** e chiunque è invitato a contribuire.
- **Agenzie immobiliari**: sono invitate a unirsi a **EKOKE DAO** per iniziare a proporre immobili tramite la nostra infrastruttura. Le agenzie devono **registrarsi e essere approvate dal DAO**. Una volta approvate, ricevono una **ricompensa** in token EKOKE.
- **Venditori di immobili**: possono scegliere di utilizzare EKOKE per vendere i loro immobili e ricevere ricompense.
- **Acquirenti di immobili**: chiunque cerchi una casa evitando enormi interessi sui mutui tradizionali può unirsi a EKOKE.
- **Comunità**: può contribuire in due modi principali:
  - **Acquistando token Deferred** sul marketplace.
  - **Votando**: il DAO consente a tutti di votare tramite il token **EKOGOV**.

### Votazioni

La comunità potrà votare su:

1. **Approvazione delle agenzie immobiliari**: le agenzie immobiliari devono essere approvate dal DAO per poter proporre immobili tramite EKOKE DAO.
2. **Nuove funzionalità**: la comunità può proporre nuove funzionalità per il DAO.
3. **Rimborsi per frodi**: se un contratto di vendita viene annullato a causa di frodi, il DAO può votare per rimborsare gli investitori accedendo alla pool di liquidità della DAO.

## Lancio

Il lancio avverrà all'inizio del **2025** con il seguente calendario:

- **7 gennaio 2025**: Giveaway su [EKOKE DAO Website](https://ekokedao.com/giveaway), dove 50 persone avranno la possibilità di vincere **100 EKOKE** dal valore di **100$**.
- **15 gennaio 2025**: Presale su [EKOKE DAO Website](https://ekokedao.com/presale). La presale durerà **3 mesi** e avrà un prezzo di partenza di **1 EKOKE = 1 USDT**. Il prezzo aumenterà di **1 USDT** ogni **20,000 EKOKE** venduti.
- **Q2 2025**: Lancio del DAO e creazione del primo contratto di vendita.
- **Q2/Q3 2025**: Il DAO sarà completamente operativo sulla NNS e tutti potranno partecipare alla governance del DAO.

## Conclusioni

Non perdere l'opportunità di unirti al progetto EKOKE DAO, che ha il potenziale di rivoluzionare il mercato immobiliare rendendolo più equo e sostenibile per tutti.

Quindi, cosa stai aspettando? Unisciti al progetto EKOKE DAO ora!

[**Unisciti a EKOKE DAO**](https://ekokedao.com)

Seguici su [X.com](https://x.com/ekoketoken) e [Telegram](https://t.me/ekokeTOKENgroup) per restare aggiornato.

![hype train meme](./hype.gif)
