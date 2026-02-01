---
date: '2023-03-20 00:00:00'
slug: 'for-a-sustainable-open-source-community-start-pointing-the-finger-at-the-mirror'
title: 'Per una community open-source sostenibile, comincia a guardarti allo specchio'
subtitle: "Una riflessione su come siamo tutti parte del problema della sostenibilità dell'open-source"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
tag: dev-life
---

## Premessa

Siamo a novembre 2020 e improvvisamente diversi servizi NodeJs smettono di funzionare. Il panico si diffonde nella comunità e subito qualcuno individua un possibile pacchetto NPM ampiamente utilizzato dalla maggior parte delle applicazioni Node. Scoprono che un programmatore di nome Marak Squires ha deciso di sabotare due dei suoi progetti, faker.js e color.js. In seguito, NPM ha ritirato le due versioni sabotate e ha impedito a Marak di pubblicare nuovi aggiornamenti per i suoi progetti.

Molti sviluppatori hanno aperto issue nei suoi progetti, segnalando cosa impediva il corretto funzionamento delle librerie, e sorprendentemente nessuno ha pensato che avesse deliberatamente deciso di sabotare i due progetti. Ma successivamente ha aperto l'issue 1046 sulla pagina Github di faker.js, che recitava:

> Niente più lavoro gratuito da Marak - Pagatemi o forkate questo progetto
>
> Con rispetto, non supporterò più grandi aziende (e altre aziende di dimensioni più ridotte) con il mio lavoro gratuito.
>
> Non c'è molto altro da dire.
>
> Prendetelo come un'opportunità per inviarmi un contratto annuale a sei cifre o fare il fork del progetto e far lavorare qualcun altro su di esso.

Questo ha scatenato un grande dibattito sulla sostenibilità della comunità open source e se le aziende dovrebbero sostenere gli sviluppatori.

![opensource](./opensource.webp)

## Dovremmo aspettarci di essere pagati per il nostro lavoro open source?

Migliaia di sviluppatori in tutto il mondo hanno sviluppato progetti incredibili nel corso degli anni, e la maggior parte di loro non riceve ancora il riconoscimento che meritano per ciò che hanno fatto.

Posso persino parlare per me stesso, anche se non ho sviluppato nessun grande progetto open source, ho raccolto migliaia di stelle su Github, ma guadagno meno di 50$ all'anno. Inoltre, spesso ricevo issue aperte nei miei repository da persone che si aspettano che io soddisfi le loro richieste in breve tempo e come vogliono loro. Una volta ho deciso di dire "no" a una richiesta di funzionalità e mi è stato addirittura detto che avevo un "atteggiamento deludente" per averlo fatto. Dopo di che, alla fine ho deciso di implementare la funzionalità, ma non ho ricevuto nulla in cambio.

E credimi, ho passato **migliaia di ore** sui miei progetti open source.

L'ho fatto per soldi? Assolutamente no, voglio essere chiaro su questo. Penso che le principali motivazioni per uno sviluppatore open source dovrebbero essere principalmente per motivi come:

- **autoapprendimento** e miglioramento delle proprie competenze.
- **imparare qualcosa di nuovo**, cosa che spesso non abbiamo il tempo di fare al lavoro.
- avere qualcosa da **mostrare ai recruiter**.
- **per divertimento**, perché amiamo programmare.

Ma ovviamente posso capire del tutto il vedere molti utenti fare affidamento sui tuoi progetti, soprattutto quando i tuoi utenti sono grandi aziende, può portare a molta frustrazione se non ricevi un centesimo per tutto l'impegno che metti nel tuo lavoro.

**Ho letto anche a volte che non dovremmo aspettarci alcun supporto, dato che non stiamo fornendo alcuna garanzia per ciò che facciamo**.

Ed è in qualche modo qualcosa con cui concordo. Le licenze software che utilizziamo per i nostri progetti (come la licenza MIT), affermano sempre qualcosa del genere:

> IL SOFTWARE È FORNITO "COSÌ COM'È", SENZA GARANZIA DI ALCUN TIPO, ESPLICITA O IMPLICITA, COMPRESA MA NON LIMITATA A GARANZIE DI COMMERCIABILITÀ, IDONEITÀ PER UN PARTICOLARE SCOPO E NON VIOLAZIONE.

che rende i nostri progetti in qualche modo "non affidabili". Non stiamo fornendo un servizio a nessuna azienda, stiamo solo affermando che il nostro codice dovrebbe funzionare.

In sostanza, l'open source è l'opposto di un contratto: mentre il contratto ti obbliga a far funzionare e completare il progetto e tu ricevi un compenso per questo, la licenza open source non ti lega a nessun obbligo e quindi le aziende non devono pagare per il tuo lavoro.

_Quindi, il caso è chiuso ed è ok non pagare gli sviluppatori open source, giusto?_ **Ovviamente no**.

Il problema è che, sfortunatamente (o no), ogni progetto, **indipendentemente dal fatto che sia open source o commerciale**, si basa totalmente su migliaia e migliaia di progetti open source. E noi, come sviluppatori, ignoriamo questo fatto.

- Ignoriamo i potenziali rischi di fare affidamento su codice che potenzialmente potrebbe non essere sicuro.
- Ignoriamo il fatto che questi progetti sono sviluppati da lavoratori non riconosciuti per il loro lavoro.

E non possiamo pensare di sostituire tutte le nostre dipendenze open source con implementazioni interne closed source, sia perché ci vorrebbero decenni per sostituire tutto, sia perché probabilmente sarebbe meno efficiente, affidabile e sicuro.

L'unica soluzione che abbiamo è creare una comunità open source sostenibile in cui il lavoro degli sviluppatori sia riconosciuto economicamente.

## Quali soluzioni abbiamo ora?

### Fondazioni software

Sì, forse non lo sapevate, ma esistono fondazioni software per i progetti open source e agiscono attivamente come intermediari tra le aziende e i progetti open source. Raccolgono denaro sia dalle donazioni di altri sviluppatori sia dalle aziende e con una parte di questo denaro lo donano ai progetti open source.

Sembra fantastico, problema risolto? Sfortunatamente no, intendo dire, penso che le fondazioni software siano ottime e le amiamo, ma ci sono principalmente due problemi:

- non raccolgono abbastanza soldi per sostenere una quantità decente di sviluppatori.
- di solito supportano solo i progetti principali. Ciò significa che a meno che tu non abbia sviluppato tokio, probabilmente non vedrai soldi da loro.

> Non sto dicendo che siano malvagi, sto solo dicendo che non hanno abbastanza risorse per sostenere tutti.

### Assunzione di sviluppatori open source

Le aziende di tecnologia **potrebbero cambiare il modo in cui assumono sviluppatori**. Probabilmente scriverò un articolo sul terribile sistema di assunzione per gli sviluppatori in un futuro post (quindi restate sintonizzati), ma quello che posso dire ora è che la maggior parte delle aziende non guarda nemmeno il tuo profilo GitHub, anche se lo inserisci in continuazione nel tuo curriculum e su LinkedIn. Ed è davvero **triste**.

Sarebbe un ottimo modo di riconoscere gli sviluppatori se un'azienda che utilizza uno dei tuoi progetti ti contattasse per **proporre un lavoro**.

Sfortunatamente, ciò accade raramente. Ho partecipato a molte interviste nella mia carriera, ma nessuno si è interessato minimamente ai miei progetti open source.

### Le aziende dovrebbero sostenere i progetti open source

![bla bla bla](./blablabla.gif)

### Dimentica ciò che ho appena detto

Ok, tutto sembra così bello e facile, ma non lo è. Sfortunatamente, queste sono solo parole e le cose non cambieranno, perché in realtà non possiamo fare molto per far accadere queste cose.

Inoltre, questo è solo un altro esempio di come continuiamo a dare la colpa agli altri per non avere una comunità open source sostenibile. Sì, è proprio come per l'ambiente, tutti continuano a dire che è colpa della Cina, ma poi mangiamo carne tutti i giorni.

Quello che POSSIAMO fare in REALTÀ

## Cosa possiamo effettivamente fare

### Diventare un sostenitore attivo

Questa è probabilmente la via più ignorata per contribuire alla sostenibilità della comunità open source.

Tutto è iniziato con la storia di Marak e di molti altri, come l'exploit di Log4J. Ho pensato che fosse ingiusto che nessuno ci avesse dato un centesimo per ciò che facciamo e ho iniziato a pensare a come una comunità open source potesse diventare sostenibile.

Ma ho anche capito un'altra cosa. **Non ho mai dato un solo dollaro a nessun altro sviluppatore**.

Quindi come possiamo pensare a un'industria sostenibile, se prima non diamo un buon esempio?

Quindi, a partire da quest'anno, ho deciso di fare la mia parte: **donerò 5$ ogni mese a un diverso progetto open source per il quale sono grato**.

So cosa stai pensando: **"wow, che soldi"**.

![wow such money](./much-money.jpg)

So che è **poco**, ma **quanti di voi stanno effettivamente donando denaro a progetti open source?** Cosa succederebbe se ognuno di noi donasse 5$ a un progetto diverso ogni mese?

E vorrei persino essere in grado di donare di più, ma il mio stipendio non è ancora così alto, ma ogni volta che sarò in grado di farlo, lo farò.

Essere un sostenitore attivo non riguarda solo il fatto di fare donazioni. Se davvero non puoi permettertelo, sensibilizza i tuoi amici su questo argomento e cerca anche di portare all'attenzione della tua azienda quanto dobbiamo all'open source.

**L'azione di uno da sola non può fare molto, ma insieme possiamo costruire una comunità open source migliore e più sostenibile**, e sono sicuro che questo cambiamento deve iniziare con il nostro impegno.
