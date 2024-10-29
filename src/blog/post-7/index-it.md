---
date: '2023-10-04 17:00:00'
slug: 'ive-replaced-google-analytics-with-umami'
title: 'Ho rimpiazzato Google Analytics con Umami'
subtitle: 'e perché dovresti fare lo stesso'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
---

## Google Analytics è spesso sopravvalutato

Ho usato GA4 per il mio sito nei mesi precedenti, fin da quando l'ho lanciato a inizio 2023, ma ad essere onesto, non sono mai riuscito ad apprezzarlo più di tanto. Infatti, ho trovato diversi punti deboli nella piattaforma:

### La User experience non è proprio il massimo

Devo ammetterlo: non sono un grande fan delle dashboard di Google. Sono sia utente di GA che di GoogleADs, e per entrambi devo dire che l'interfaccia non è secondo me un granché.
Le dashboard sono poco intuitive, con moltissimi accordion che tendono ad aprirsi come fisarmoniche concentriche.
Inoltre, per quanto riguarda Analytics visualizzare gli eventi non è per niente immediato, per non parlare dei parametri che inviamo con gli eventi custom. Questi possono infatti solo essere visualizzati nei report.
Solo io lo trovo estremamente scomodo e poco intuitivo?

Vogliamo parlare delle performance? **Analytics è molto lento**, con caricamenti lunghi e che a volte si bloccano lasciandoti lì ad aspettare che la vista si popoli.

Non ho nessun dubbio, che magari per siti enormi che hanno bisogno di molte analisi di dati, Google Analytics abbia qualcosa da offrire, ma per il **sito medio**? Offre davvero un servizio di cui abbiamo bisogno e di cui ne siamo contenti?

### E poi c'è il GDPR

![layers](./lawyers.gif)

GDPR, cookie e privacy policy sono sempre una questione delicata. Qualsiasi volta in cui devo progettare un sito, devo verificare in quale categoria rientra ogni cookie, aggiungere un paragrafo alla cookie policy ed un altro alla privacy policy. Ovviamente, se abbiamo i cookie, abbiamo anche una cookie bar. Nel mio [articolo precedente](https://blog.veeso.dev/blog/it/how-to-migrate-from-reactjs-to-gatsby/), ho parlato di come la cookie bar mi ha causato parecchi problemi in termini di performance con Gatsby. Certo, sono riuscito a risolverli, ma ciò non toglie che la cookie bar sia spesso un fastidio per a livello di visualizzazione ed implementazione del sito.

Ma perché? Potreste chiedervi. Perché abbiamo bisogno di paragrafi di cookie e privacy policy per usare Google Analytics? **Abbiamo veramente bisogno di tracciare dati sensibili per fare analitica del comportamento**? Beh, **in realtà no**. Ma allora perché Google sì? Il punto è che Google usa i dati analitici per profilare gli utenti e quindi convogliare pubblicità più attraenti agli utenti, in base alla loro esperienza di navigazione.

Infatti **Google Analytics**, come qualsiasi altro prodotto Google, **non è gratis**. Offrono un servizio ed in cambio vogliono i dati dei nostri utenti.

Quindi ho deciso che I've got to break free e dire addio a GA una volta per tutte!

![break-free](./break-free.gif)

Ci sono in realtà diverse alternative a Google Analytics, ma io ho optato per [Umami](https://umami.is). Vediamo perché.

## Perché Umami è la miglior soluzione per l'analitica

[Umami](https://umami.is) è un semplice tool di web analytic. Fornisce uno script che dev'essere incluso sul nostro sito per tracciare eventi e pagine visitate ed un'intefaccia web dove è possibile configurare tutti i domini che vogliamo tracciare. L'interfaccia utente è veramente facile da utilizzare, inoltre è molto performante e semplice nell'utilizzo.
La pagina web di Umami ci permette inoltre di configurare diversi utenti, per i quali possiamo associare diversi permessi e domini da gestire.

Attualmente, Umami può sia essere utilizzato gratuitamente se hostato su un VPS di proprietà, oppure può essere "acquistato" come soluzione SaaS, ma in ogni caso è piuttosto **economico**.

La dashboard mostra una panoramica del traffico per ogni sito che stiamo tracciando

![dashboard](./dashboard.webp)

Poi possiamo visualizzare le diverse pagine che visualizzano gli utenti e con quali agent:

![users](./users.webp)

Infine abbiamo una panoramica per gli eventi tracciati e la località degli utenti che visitano il sito. Per ogni evento poi abbiamo anche una vista in dettaglio che ci mostra i diversi parametri associati:

![events](./events.webp)

## Come migrare da Google Analytics ad Umami

Migrare da Google Analytics ad Umami è un lavoro piuttosto facile e veloce e impiega circa 30 minuti seguendo questa guida. In questo tutorial mostrerò come farlo utilizzando la soluzione _self-hosted_ di Umami, ma puoi saltare il primo capitolo se hai scelto la version SaaS.

### Configurazione di Umami su VPS

Per prima cosa ci serviranno **Docker** e **Docker-compose**.
Poi, dalla tua app directory, dobbiamo scaricare il repository di umami `git clone https://github.com/umami-software/umami.git` e da dentro la directory, fare il checkout dell'ultima release `git checkout v2.7.0`.

Ora, dobbiamo cambiare la secret key per umami `vi docker-compose.yml`:

```yml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: CHANGE THIS VALUE
```

A questo punto possiamo lanciare umami con `docker-compose up -d`.

Ora, se vogliamo rendere la UI di Umami accessibile da un indirizzo web pubblico, dobbiamo esporla tramite Web server utilizzando un reverse proxy. Per farlo, io uso NGINX:

```conf
server {
  server_name mydomain;

  location ~ /.well-known {
    allow all;
    root /var/www/html;
  }


  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  listen 443 ssl; # managed by Certbot
  ssl_certificate /...; # managed by Certbot
  ssl_certificate_key /...; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /...; # managed by Certbot

}

server {
  if ($host = mydomain) {
    return 301 https://$host$request_uri;
  } # managed by Certbot


  server_name mydomain;
  listen 80;
  return 404; # managed by Certbot

}
```

A questo punto, puoi fare il setup del sito e degli utenti accedendo alla web ui di umami e seguendo la [documentazione ufficiale](https://umami.is/docs/login).

### Come usare Umami sul tuo frontend

Per questo tutorial userò il mio sito web, che usa Gatsby come SSR. Per prima cosa, dobbiamo installare il plugin di Umami con `yarn add gatsby-plugin-umami` e aggiungerlo a `gatsby-config.ts`:

```ts
{
  resolve: `gatsby-plugin-umami`,
  options: {
    websiteId: 'YOUR_WEBSITE_ID',
    srcUrl: 'https://mydomain/script.js',
    includeInDevelopment: false,
    autoTrack: true,
    respectDoNotTrack: false,
  },
},
```

In questo tutorial invece non andrò ad usare **Partytown**, dal momento in cui sono riuscito a farlo funzionare per Umami a causa di alcuni problemi di CORS, quindi ho tolto il supporto di Partytown dal sito. In ogni caso, non ho notato perdita di performance senza partytown con umami, al contrario di quanto accadeva con Google Analytics.

Se usi TypeScript e hai bisogno di inviare eventi da script, abbiamo bisogno della definizione di `window.umami`. Quindi dobbiamo installare i tipi: `yarn add -D @types/umami-browser`.

A questo punto possiamo liberarci della cookie bar e se necessiti di inviare eventi da script, puoi semplicemente usare questa funzione:

```ts
const pushAnalyticsEvent = (eventName: string, parameters: any) => {
  if (typeof window === 'undefined') {
    return;
  }

  const canUseUmami = window.umami !== undefined;

  if (canUseUmami) {
    try {
      window.umami.track(eventName, parameters);
    } catch (e) {
      console.error(`failed to track ${eventName}: ${e}`);
    }
  }
};
```

A questo punto dovresti vedere gli eventi tracciati dalla dashboard di Umami.

![analytics](./analytics.gif)

## Extra: Un'alternativa da tenere sott'occhio (per il futuro) - Cloudflare Analytics

L'altro giorno un mio amico mi ha fatto sapere dell'esistenza di [Cloudflare Website Analytics](https://www.cloudflare.com/web-analytics/), che altro non è che un'alternativa a Google Analytics **GDPR compliant**, che non richiede cookie. In pratica è anche gratis. Ci ho buttato un occhio, ma sfortunatamente non sembra che supporti eventi custom inviati da script, quindi potrebbe essere una buona soluzione in caso non tu non abbia bisogno di questi ultimi, ma per me è no.

Sicuramente lo terrò d'occhio nel futuro, per vedere se magari aggiungono la possibilità di inviare eventi da script.

## Conclusioni

Sono veramente contento di aver completato la migrazione ad Umami. Penso che il mio sito ne beneficerà molto, e penso che chiunque rientri nella categoria di quelli che non necessitano per forza degli strumenti Google, possa fare lo stesso. Questo non solo perché funziona meglio di GA, ma anche perché i tuoi utenti sarebbero felici che non stai più vendendo i loro dati a Google.

![joe-nods](./joe-nods.gif)
