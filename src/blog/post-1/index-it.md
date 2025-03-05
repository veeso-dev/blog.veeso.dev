---
date: '2023-01-25 00:00:00'
slug: 'dev-horror-story-1-an-android-nightmare'
title: 'Dev Horror Story #1 — An Android Nightmare'
subtitle: "Un viaggio verso una delle mie più stressanti esperienze nello sviluppo software: un'app per WearOS"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
tag: open-source
---

## Premessa

_Riflessioni sulla nostra percezione di Android_

Torniamo indietro agli anni 2010, ero ancora uno studente al liceo e c'era una rivalità tra utenti iOS e Android. Tutti cercavano di evidenziare cosa rendesse uno dei due sistemi operativi migliore dell'altro, anche se tutti sapevamo che il punto decisivo era se potevi permetterti o meno un iPhone.

![android-ios](./android-ios.gif)

**Ma**, c'è qualcosa che è sempre stato detto su Android, che avrebbe potuto farti optare per un dispositivo con questo sistema operativo: la libertà. Se hai un dispositivo Android, sei libero di farci ciò che vuoi.

Non voglio dire cosa penso al riguardo per ora, e questo articolo parla principalmente di questo, quindi continua a leggere se sei interessato, ma posso certamente dire che nel 2023 configurare una suoneria personalizzata per il tuo iPhone è una seccatura e quando mia madre mi chiede di farlo per lei, ho solo voglia di piangere. Convertire un file mp3 in un m4a e poi rinominarlo in m4r e quindi sincronizzare l'iPhone tramite iTunes è semplicemente sciocco e ti fa sentire prigioniero quando usi i dispositivi iOS; ma questo significa comunque che Android significa libertà?

Quindi, per tutta la mia vita, ho sempre comprato solo dispositivi Android con questa idea in mente di poterli "hackare". Ho mai sviluppato un'app per "hackerarli"? No, mai, ma nella mia mente potevo sempre svilupparne una in qualsiasi momento, senza problemi.

Ho finalmente deciso persino di comprare un orologio WearOs (un Galaxy Watch 4 per essere precisi) e ne ero entusiasta, poiché lo porti sempre al polso e hai il potere nelle tue mani per fare ciò che vuoi con esso, quindi sembra molto comodo e potente.

![benten](./benten.gif)

Non avrei mai potuto immaginare quanto fossi sbagliato a riguardo...

## L'app Yubico WearOs

Nel dicembre 2022 ho comprato la mia prima Yubikey, che trovo molto utile, ma non sempre comoda da prendere il telefono per ottenere i token. Quindi mi sono detto

> E se potessi generare il TOTP dal mio orologio, semplicemente toccando la chiave su di esso?

Un'idea geniale e quello che ho scoperto è che tutte le app Yubico sono open source, quindi avrebbe dovuto essere probabilmente molto facile da implementare per il mio dispositivo WearOs.

Quindi ho installato Android Studio, mi sono familiarizzato con Kotlin, dato che conoscevo solo Java per lo sviluppo Android, e ho iniziato a implementare il mio [Yubico Authenticator per WearOS](https://github.com/veeso/yubico-authenticator-wearos).

In poche ore l'avevo implementato. Ho inserito le impostazioni per gli sviluppatori sul mio orologio e ho abilitato il debug Wi-Fi e infine ho premuto Esegui sulla mia IDE: la compilazione è stata riuscita, lo schermo del mio orologio è diventato nero e dopo un secondo, si è bloccato e è tornato alla schermata dell'orologio. Accidenti!

![this-is-fine](./fine.gif)

Ho subito iniziato a leggere il log e c'era un errore che diceva che il dispositivo non era in grado di attivare il lettore NFC.

Forse manca un permesso? Forse NFC è disabilitato nelle impostazioni del mio orologio? Forse devo utilizzare una diversa API per i tag NFC su WearOS?

No. Tutto sembrava a posto. Quindi ho fatto l'unica cosa che un programmatore può fare in questa situazione. Ho cercato l'errore su Google.

Primo risultato da un povero ragazzo su Reddit:

> È possibile leggere i tag NFC su WearOS? Se no, perché diavolo no! Lo sviluppo di WearOS di Google è frustrante a volte!

Risposta:

> Ho scoperto altrove che non è possibile. Per l'amor del cielo, Google, perché non riesci a non annoiarti con un prodotto e continuare lo sviluppo per più di 30 secondi!

![no god please no](./the-office.gif)

Non so davvero cosa possa aver portato a questa decisione da parte di Google. Forse è davvero una questione di sicurezza (ma perché dovrebbe essere possibile usarlo sul mio cellulare allora), ma qualcosa mi fa pensare che Google non tiene alla larga dei suoi prodotti dopo un mese dal rilascio. Siamo onesti, a nessuno importa di WearOs, dato che si può fare davvero poco con esso, ma Google sembra non capire che questo è dovuto al fatto che non si impegnano molto in ciò che fanno. \*Questa è solo la mia umile opinione

Quindi questa è la fine della storia del Yubico Authenticator per WearOS. Almeno mi sono dato la soddisfazione di mettere questa frase alla fine della readme del repository su GitHub e dire addio allo sviluppo Android (o forse no...)

> Purtroppo questo è solo un sogno. Una volta implementata l'app, ho scoperto che Google ha disabilitato NFC per operazioni non di pagamento. Secondo me WearOS è completamente inutile e gli sviluppatori non possono fare nulla al riguardo.
>
> Continuate a sognare per un sistema operativo indossabile veramente decente...

![fuck off](./fuck-off.gif)

"Purtroppo questo è solo un sogno", avevo così torto. Questo sta per diventare un incubo perché, per i record, in ogni storia c'è sempre un lato A e un lato B.

## L'app OpenTapo - o come sono diventato pazzo per accendere le luci di casa

### Come ci sono arrivato

Alcune settimane prima di scrivere questo articolo ho avuto l'idea folle di sostituire tutte le luci in casa con luci smart controllate da Alexa, quindi ho optato per i dispositivi Tp-Link Tapo. Davvero, non farlo. È figo e ti fa sentire come se fossi in Blade Runner, ma allo stesso tempo è pazzesco che tu debba dire ad Alexa che stai andando in bagno in modo che possa accendere le luci al posto tuo invece di usare un interruttore.

![blade runner](./blade-runner.gif)

A volte mi capita di dimenticare di chiedere ad Alexa di accendere le luci in bagno e ho lasciato il telefono in soggiorno e quando sono lì, l'unica cosa che posso fare è urlare ad Alexa di accendere le luci. Non molto comodo. Così ho pensato che sarebbe potuto essere una buona idea implementare un'app per il mio smartwatch WearOs per controllare i miei dispositivi Tapo, dato che non esiste un'app per farlo.

OpenTapo WearOs: sarebbe stato il nome per la mia app. Il vero incubo inizia qui.

### La luce verde in fondo al molo

Prima di tutto, ho verificato se il protocollo Tapo fosse aperto. Ovviamente non lo è.

![mamma mia](./dammit.gif)

> Ok, allora verifichiamo se qualcuno ha già invertito il protocollo e ha pubblicato qualche tipo di libreria su Github.

Qualcuno sostiene di essere riuscito a controllare i suoi dispositivi Tapo e la libreria è anche scritta in Rust. Perfetto, ho pensato (complimenti a Mihai Dinculescu per la sua [libreria Tapo](https://github.com/mihai-dinculescu/tapo)).

Dopo questo, la prima cosa da fare è stata convertire la loro libreria da Rust a Kotlin, ma una volta fatto, ho notato qualcosa che non sembrava affatto corretto.

La libreria ti consente di comunicare con i dispositivi Tapo, ma con una condizione: devi conoscere l'indirizzo IP del dispositivo.

Ora, questo potrebbe anche funzionare se, ad esempio, si costruisse un'applicazione per controllarli tramite un Raspberry Pi o qualcosa del genere, anche se dobbiamo considerare che questi dispositivi sono configurati con un indirizzo DHCP; ma è sicuramente inaccettabile per un dispositivo WearOs.

### Passo successivo: come possiamo scoprire tutti i dispositivi Tapo sulla nostra rete?

La prima cosa che ho fatto è stata, ancora una volta, controllare su GitHub se qualcuno è riuscito a scoprire i dispositivi Tapo.

Risposta: no, ma qualcuno l'ha fatto per i dispositivi **Kasa**. (Kasa è il prodotto smart home legacy di TpLink).

Quello che ho scoperto dalla libreria client di Kasa è che essi non controllavano direttamente il servizio web del dispositivo, ma tramite un endpoint cloud.

Quindi, facile, ho pensato, basta usare il cloud per controllare i dispositivi

### Fallimento #1 - L'approccio basato su cloud

In sostanza, il flusso di lavoro del cloud di TpLink per controllare i dispositivi sembrava molto semplice:

1. Effettua l'accesso tramite API con il tuo nome utente/password
2. Ottieni l'elenco dei dispositivi
3. Raccogli l'ID del dispositivo da ciascuna voce nell'elenco dei dispositivi
4. Invia un comando a ciascun dispositivo fornendo l'ID del dispositivo nella richiesta inviata al cloud

Una volta implementato tutto, l'unica cosa che rimaneva era eseguire l'applicazione nel debugger:

1. Accesso: OK
2. Ottieni l'elenco dei dispositivi: OK, posso vedere tutti i miei dispositivi Tapo
3. L'ID del dispositivo è lì, nella risposta

Poi ho finalmente inviato una richiesta "power_on", ma il server mi ha risposto con

![nope](./nope.gif)

> No... Il dispositivo è offline

Cosa significa che è "offline"? Posso controllarlo con la mia app, quindi deve essere connesso.

Ero disperato, di nuovo. Doveva esserci qualcosa di sbagliato con la mia implementazione, ma tutto sembrava a posto per me.

Come ho sempre fatto in questi casi, ho cercato i problemi del progetto Kasa per verificare se qualcuno aveva cercato di controllare i suoi dispositivi Tapo.

Tutti avevano lo stesso problema. Così ho iniziato a sentirmi sconfitto, ma fortunatamente qualcuno ha affermato di essere riuscito a comunicare con i loro Tapo tramite il cloud utilizzando alcune richieste diverse. Ha funzionato? Ovviamente no. Perché? Perché questo metodo è stato disabilitato dopo un po' di tempo da TpLink. Quindi l'unico modo per comunicare con i dispositivi Tapo al giorno d'oggi sembra essere inviare direttamente le richieste al servizio web integrato.

![dammit](./dammit2.gif)

### Una revisione del protocollo ARP

Non so se hai mai studiato lo stack ISO-OSI, ma se lo hai fatto probabilmente non ricorderai il protocollo ARP; ma non preoccuparti, perché te lo farò ricordare.

Quello che non ho menzionato prima è che nella risposta dal cloud con tutti i dispositivi, per ciascun dispositivo c'è un attributo super importante specificato: il suo indirizzo MAC. Sapevo che avrei potuto usarlo per ottenere l'IP dei miei dispositivi. Come? Grazie alla tabella ARP.

Come funziona? Quindi, in sostanza, il tuo modem è anche uno switch e i dispositivi nella rete locale sono risolti dallo switch utilizzando l'indirizzo MAC invece dell'indirizzo IP. Le richieste utilizzano gli indirizzi IP, quindi in pratica, ogni dispositivo ha una tabella di lookup chiamata tabella ARP che memorizza per ciascun indirizzo IP, l'indirizzo MAC associato.

![matematica](./math.gif)

### Fallimento #2 - L'approccio basato sulla tabella ARP

Quindi, se ho l'elenco di tutti gli indirizzi MAC dei miei dispositivi, posso semplicemente cercare nella tabella ARP del mio smartwatch per scoprire qual è l'indirizzo IP del dispositivo, giusto? GIUSTO???

Quindi ho dovuto implementare il lettore della tabella ARP nella mia app e creare il meccanismo di ricerca.

> Gli sviluppatori di Google nel frattempo

![ridere](./laughing.gif)

L'applicazione è partita e si è bloccata con l'errore: **"Permesso negato"** quando cercava di leggere la tabella ARP. Mhm, mi sembrava strano, soprattutto perché ho visto sviluppatori che affermavano di essere riusciti a farlo. Forse il sistema dell'orologio intelligente non ha una tabella ARP, ma voglio dire, è sempre basato su Linux, quindi non dovrebbe avere molto senso. In effetti, una volta connesso alla shell del dispositivo, ho potuto leggerlo con il comando cat. Qual era il problema, allora...

Beh, fondamentalmente, da Android 10, Google ha reso impossibile leggere la tabella ARP dalle app. Per **"ragioni di sicurezza"**, come al solito...

Qualcuno su Stack Overflow afferma che è ancora possibile recuperarla eseguendo il comando shell "ip neigh list", ma di nuovo: il permesso è negato. Google ha vietato l'uso di questo comando dalle app a partire da Android 11...

Quindi come puoi leggere la tabella ARP da un'app Android? Beh, in sostanza... non puoi farlo più...

![lo sapevo](./i-knew-it.gif)

Questa volta, stavo per rinunciare. Seriamente, ho iniziato a pensare che Google semplicemente non voglia che io lavori su app Android.

### Non rimarrò in un bagno al buio, Google

Arthur Conan Doyle una volta scrisse:

> Quando hai eliminato tutto ciò che è impossibile, ciò che resta, per quanto improbabile, deve essere la verità — Sherlock Holmes

Che ho applicato qui più come:

> Quando hai eliminato tutto ciò che Google vieta, ciò che resta, per quanto brutto e scadente, deve essere implementato.

Google! Accenderò la luce del mio bagno dal mio smartwatch, qualunque cosa ci voglia.

Sapevo che c'era solo una possibilità, quella brutta. Fondamentalmente, in modo brutale, provare a inviare una richiesta HTTP a ogni indirizzo nella rete locale e vedere se si comportano come un dispositivo Tapo.

È una soluzione buona? NO. Funziona? Probabilmente.

Così ho eliminato tutte le ricerche nella tabella ARP e l'API basata sul cloud e l'ho sostituita con un servizio "DeviceScanner" che fondamentalmente:

1. Ottiene l'indirizzo IP dell'orologio e la maschera di rete
2. Calcola la rete e l'indirizzo di broadcast
3. Per ciascun indirizzo IP intermedio cerca di inviare una richiesta "Handshake" come previsto dal protocollo Tapo
4. Per ciascun IP che invia una risposta, lo registra come dispositivo e consente all'utente di interagire con esso.

Non potevo crederci, finalmente questa soluzione ha funzionato. Beh, era molto lenta e non era una grande implementazione, infatti ho dovuto fare molto per ottimizzarla al fine di evitare la scansione di rete, la memorizzazione nella cache delle connessioni e degli indirizzi, ma alla fine ha funzionato.

![è bello](./is-nice.gif)

## Conclusioni

Quindi quale è la conclusione di questa storia?

Innanzitutto, ora sono finalmente in grado di accendere la luce mentre sono seduto sul water, poi...

Ho imparato che viviamo in un mondo in cui il software non è realmente fatto per gli sviluppatori, ma per gli utenti finali. Voglio dire, installo alcune lampadine in casa mia e il suo protocollo è totalmente closed-source; Google ha bloccato un sacco di funzionalità agli sviluppatori in nome della "sicurezza".

Ma è vero? Impedire alle app di leggere i tag NFC da un orologio, o di leggere la tabella ARP, rende i nostri dispositivi più sicuri?

Mi sembra sempre che qualcosa sia andato completamente storto con i dispositivi smart, come i telefoni cellulari e gli orologi, sembra che siano diventati scatole nere senza alcuna possibilità di lavorare su di essi o personalizzarli; ma questo è probabilmente un argomento per un altro momento.

Nel frattempo sono seduto aspettando che Google Play approvi la mia app.

![pablo](./pablo.gif)

Se vuoi dare un'occhiata al progetto lo trovi in questo [repository](https://github.com/veeso/opentapo-wearos).
