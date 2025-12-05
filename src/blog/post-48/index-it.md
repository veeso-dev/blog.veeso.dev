---
date: '2025-11-22 14:10:00'
slug: 'converti-istantaneamente-hanzi-in-pinyin-con-biangbiang-hanzi'
title: 'Converti istantaneamente Hanzi in Pinyin con BiangBiang Hanzi'
subtitle: "Un'app veloce e precisa per iOS e Android per convertire caratteri cinesi in Pinyin con OCR da fotocamera"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
draft: false
tag: app
---

## Introduzione

𰻝𰻝汉子 BiangBiang Hanzi è un'applicazione per iOS e Android che permette di convertire Hanzi (caratteri cinesi) in Pinyin e tradurre testi cinesi in qualsiasi lingua. Supporta sia i caratteri tradizionali che semplificati e include funzionalità OCR per riconoscere il testo dalle immagini, sia in diretta che tramite fotocamera.

L'app è stata sviluppata in Swift e SwiftUI, sfruttando la potenza del framework Vision di Apple per l'OCR, mentre la versione Android utilizza Kotlin e Jetpack Compose. È progettata per essere intuitiva, veloce e accurata, rendendola uno strumento prezioso per studenti di lingue, viaggiatori e chiunque abbia bisogno di traduzioni rapide.

## Perché ho creato questa app

Ho sviluppato questa app per aiutare me stesso e gli altri a imparare il cinese in maniera più efficace, offrendo un modo semplice per leggere e comprendere i caratteri Hanzi. Mi è capitato molte volte, quando ero in Cina, di non riuscire a leggere un menu al ristorante perché non sapevo come pronunciare i caratteri; ma se avessi potuto conoscerne il pinyin, sarei riuscito a leggerli ad alta voce e ordinare da mangiare. Questa app vuole risolvere anche questo problema, oltre a essere un utile strumento per lo studio del cinese in generale.

Purtroppo la fotocamera di sistema fornisce solo traduzioni, ma non la conversione in pinyin, cosa che rende piuttosto difficile ordinare cibo in Cina, per esempio. Quindi ho pensato che sarebbe stato utile avere un'app che facesse proprio questo.

## Funzionalità

- **Conversione Hanzi → Pinyin**: Converti istantaneamente i caratteri cinesi in Pinyin con i toni.
- **Traduzione**: Traduci testi cinesi in qualsiasi lingua grazie ai servizi di traduzione integrati.
- **OCR da fotocamera**: Usa la fotocamera del dispositivo per catturare e riconoscere testo cinese in tempo reale.
- **OCR da immagine**: Seleziona immagini dalla libreria foto per estrarre e convertire testo cinese.

### Supporto al cantonese

Nei prossimi aggiornamenti, voglio anche aggiungere il supporto alla conversione in cantonese, permettendo agli utenti di convertire gli Hanzi in romanizzazione cantonese (Jyutping). Ovviamente il cantonese è una lingua più di nicchia (per gli stranieri) rispetto al mandarino, ma credo comunque possa essere una funzione utile per chi vuole impararlo o viaggiare in aree dove si parla, come Hong Kong.

Sfortunatamente, non esiste un supporto diretto al cantonese nelle librerie di sistema di iOS e Android, quindi dovrò affidarmi a librerie o API esterne per implementare questa funzione. Al momento sto ricercando le migliori opzioni disponibili per garantire una conversione accurata e affidabile.

## Conversione del testo

La prima schermata dell'app permette agli utenti di inserire testo cinese manualmente o incollarlo dagli appunti. Una volta inserito il testo, la conversione in pinyin viene mostrata immediatamente sotto il campo di input. Gli utenti possono anche toccare un pulsante per tradurre il testo nella lingua desiderata.

La funzione di traduzione richiede l'installazione dei pacchetti lingua di sistema.

![Preview](./preview.webp)

## OCR da fotocamera

La funzione OCR della fotocamera permette agli utenti di puntare la fotocamera del dispositivo verso testo cinese, come cartelli, menu o documenti. L'app riconosce il testo in tempo reale e mostra sullo schermo il pinyin convertito e la traduzione.

Cliccando sul testo catturato, gli utenti possono copiare il pinyin negli appunti per condividerlo o usarlo altrove.

È anche possibile attivare o disattivare la conversione in pinyin, così da poter copiare solo gli hanzi se lo si preferisce.

Inoltre, gli utenti possono selezionare immagini dalla libreria per estrarre e convertire il testo cinese.

Sfortunatamente, su iOS la posizione delle caselle di testo non è sempre perfettamente allineata al testo reale nell'anteprima della fotocamera, a causa di alcune limitazioni del framework Vision. Tuttavia la precisione dell'OCR rimane molto buona e l'app funziona bene in varie condizioni di luce.

Inaspettatamente, la versione Android sembra avere un migliore allineamento delle caselle di testo, probabilmente grazie alle differenze tra le librerie OCR utilizzate da ciascuna piattaforma.

![Camera OCR](./camera_ocr.webp)

## Conclusione

𰻝𰻝汉子 BiangBiang Hanzi è un'app utile e facile da usare per convertire Hanzi in Pinyin e tradurre testo cinese. Le sue capacità OCR la rendono uno strumento versatile sia per studenti di lingua cinese che per viaggiatori. Con lo sviluppo continuo, incluso il supporto al cantonese, questa app punta a diventare un compagno essenziale per chiunque abbia a che fare con la lingua cinese.

Spero che la prossima volta che sarai in Cina o in una regione sinofona, quest'app ti aiuterà a leggere più facilmente menu e cartelli! Goditi il tuo 奶茶！

L'app è open source e puoi trovare il codice su [GitHub](https://github.com/veeso/BiangBiang-Hanzi), ma tieni presente che è distribuita sotto licenza **Elastic v2**, che non è una licenza permissiva. Puoi usarla gratuitamente, ma ci sono alcune restrizioni, soprattutto se vuoi ridistribuirla o usarla in un prodotto commerciale. Per favore leggi la licenza per maggiori dettagli.

Puoi acquistare l'app sull'[App Store](https://apps.apple.com/app/id6754869174) e sul [Google Play Store](https://play.google.com/store/apps/details?id=dev.veeso.biangbianghanzi).

[![App Store](./app_store_badge.webp)](https://apps.apple.com/app/id6754869174) [![Google Play](./google_play_badge.webp)](https://play.google.com/store/apps/details?id=dev.veeso.biangbianghanzi)
