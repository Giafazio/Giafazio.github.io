# Oracolo — filtro JavaScript B5 approvato

Consegna del 10 ottobre 2026. `oracolo.mjs` è una copia identica, rinominata, del B5 generalizzato approvato dall'utente. È un modulo JavaScript ES autonomo, senza dipendenze, addestramento, accesso alla rete o file esterni necessari a runtime.

## Integrazione nel sito statico

Caricare `oracolo.mjs` fra gli asset del sito e importarlo da uno script di tipo modulo:

```html
<script type="module">
  import { classificaDomanda } from './oracolo.mjs';
  const risultato = classificaDomanda('Vieni?');
  console.log(risultato.etichetta); // si_no
</script>
```

Il percorso di importazione va adattato alla posizione effettiva del file. Il sito deve servire `.mjs` con un tipo MIME JavaScript. La consegna non richiede un backend; per provare i moduli usare il sito o un server statico locale. L'apertura diretta di un HTML con `file://` può impedire gli import per le restrizioni del browser.

Node è necessario soltanto per eseguire lo script di verifica fornito, non per usare il filtro nel sito.

## API

```js
classificaDomanda(testo)
```

La funzione è sincrona e restituisce:

```js
{
  etichetta: 'si_no', // oppure 'aperta' oppure 'incerta'
  regola: 'interrogativa_residua',
  motivo: '...'
}
```

Quando interviene il controllo straniero è presente anche `parole`, un array delle corrispondenze trovate. Non sono restituiti probabilità o punteggi di confidenza.

## Bersaglio e convenzioni

Il bersaglio è la forma rispondibile sì/no, usando soltanto la domanda. L'intento retorico non cambia una forma polare in aperta.

- `si_no`: domande polari e frammenti interrogativi riconosciuti secondo le convenzioni, per esempio `Vieni?`, `Non sei d'accordo?`, `Partitina?`.
- `aperta`: richieste di valori, spiegazioni o alternative riconosciute. Per convenzione include anche enunciati senza una richiesta riconosciuta e input vuoti/non testuali.
- `incerta`: nel codice consegnato interviene per una corrispondenza con il dizionario straniero, quando i controlli italiani non hanno trovato indizi. Non è un'astensione generale sulle ambiguità sintattiche.

Senza segnali interrogativi il risultato normalmente è `aperta`: `Ho visto un gatto` e `Tu domani lavori`. Alcune richieste indirette vengono riconosciute anche senza `?`: `Vorrei sapere se verrai` è `si_no`, `Vorrei sapere quando verrai` è `aperta`.

Le principali polari non diventano aperte per la sola presenza di un interrogativo interno: `Puoi dirmi quando vieni?` resta `si_no`. Nelle combinazioni una richiesta aperta riconosciuta fa prevalere `aperta`. Le disgiunzioni ambigue sono convenzionali e non vengono tutte aperte: `Hai un cane o un gatto?` resta `si_no`.

## Logica del modulo

Il codice divide il testo ai segni `.`, `!`, `?`, `;` e alle varianti previste. All'interno di ciascun segmento:

1. Riconosce l'alternativa temporale ellittica di B5 prima della normalizzazione.
2. Preserva alcune locuzioni iniziali con `che` (`dopo che`, `prima che`, `dato che`, `visto che`) e cerca la principale dopo la virgola. La gestione senza virgola rimane limitata.
3. Normalizza e rimuove alcune introduzioni discorsive/temporali.
4. Cerca un interrogativo aperto iniziale e richieste indirette in cornici riconosciute.
5. Nei segmenti interrogativi applica gli schemi aggiuntivi: ruolo proposto di `che`, sintagmi preposizionali, domanda dopo premessa, alternative, richieste fuori ambito e coordinazioni.
6. In mancanza di una regola specifica, un segmento con punto interrogativo riceve `si_no` residuale.

Dopo la combinazione dei segmenti, il controllo straniero conserva le regole italiane specifiche e gli indizi italiani riconosciuti. Soltanto in loro assenza cerca parole del dizionario e può cambiare un risultato residuale in `incerta`. Il punto interrogativo da solo non è un indizio italiano.

È un sistema di euristiche testuali e schemi sintattici parziali, con piccoli elenchi lessicali. Non analizza la coniugazione di tutti i verbi né costruisce un albero sintattico completo.

### Alternative temporali di B5

Un segmento completo con due espressioni distinte unite da `o` oppure `oppure` e seguito da `?` viene classificato `aperta`. Sono riconosciute queste 26 espressioni:

```text
oggi, domani, dopodomani, ieri,
adesso, ora, prima, dopo, presto, tardi, subito,
stamattina, stasera, stanotte, domattina,
più tardi, più presto, domani mattina, domani sera,
lunedì, martedì, mercoledì, giovedì, venerdì, sabato, domenica
```

Esempi: `Prima o dopo?`, `Adesso o più tardi?`, `Stasera oppure domattina?`. `Adesso oppure no?` resta `si_no`. La nuova regola non si applica a una proposizione completa come `Hai un impegno lunedì o martedì?`. Le altre regole preesistenti sulle alternative restano attive.

### Dizionario straniero

Sono incorporate 364 forme distinte da 385 voci per lingua. Il JSON incluso documenta la provenienza e le voci eliminate; non è caricato dal modulo a runtime.

Input previsto: alfabeto latino, comprese lettere accentate. Le lingue con altre scritture sono rappresentate da traslitterazioni pratiche. Il modulo non impone il vincolo di input mediante una UI e non copre tutte le traslitterazioni possibili. Confronta parole intere, ignora il caso, normalizza Unicode NFC e apostrofi tipografici, conserva gli accenti. Gli indizi italiani hanno la precedenza anche nelle frasi miste.

## Verifica ed evidenza

| Insieme | Risultato B5 |
|---|---:|
| Corpus approvato, 413 si_no e 169 aperta | 582/582 |
| Diagnostici esterni precedenti | 166/178 |
| Controlli mirati delle alternative temporali | 36/36 |

Rispetto a B4 nessuna regressione nel corpus o nei due insiemi esterni verificati. Nei 178 esterni precedenti cambia solo `Oggi o domani? Where?`, correggendolo in `aperta`. Nei 36 controlli mirati ci sono 17 recuperi.

Il corpus è in gran parte sintetico e gli esempi esterni sono diagnostici con etichette proposte, salvo indicazioni esplicite dell'utente. Sono stati usati nello sviluppo delle regole. Questi numeri non sono una stima di accuratezza su domande reali indipendenti. Le due raccolte diagnostiche possono contenere ripetizioni: sono conteggi per insieme, non una valutazione aggregata deduplicata.

### Ripetere la verifica dopo l'estrazione

```sh
node verifica.mjs
```

Lo script importa il solo `oracolo.mjs` consegnato, legge corpus e diagnostici locali e verifica sia le etichette sia la riproduzione di tutte le classificazioni della consegna. Non richiede la cartella del progetto originale. Gli errori esterni noti vengono riportati; l'esito zero indica che la consegna riproduce i risultati congelati, non che tutti i diagnostici siano corretti.

La verifica è stata eseguita con Node; non è stata effettuata una verifica in un browser reale. L'identità fra il modulo approvato e quello rinominato è verificata con SHA-256, registrato nel manifest.

## Contenuto

- `oracolo.mjs`: filtro runtime approvato.
- `CONTESTO.md`: messaggio di passaggio all'altra chat e limiti noti.
- `corpus.csv`: 582 esempi di riferimento.
- `diagnostici.json`: 178 esempi esterni e 36 controlli mirati, con etichette attese e output congelati.
- `verifica.mjs`: verifica autonoma degli esempi e dell'integrità del modulo.
- `risultati.json`: rapporto originale del confronto B5/B4.
- `dizionario-straniero.json`: dizionario di riferimento, non necessario a runtime.
- `MANIFEST.json`: versione, approvazione, conteggi e hash dei file.
