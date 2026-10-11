# Passaggio a un'altra chat

Il filtro JavaScript B5 generalizzato è stato approvato dall'utente il 10 ottobre 2026. Il file runtime consegnato è `oracolo.mjs`, identico al B5 approvato salvo il nome del file. L'API esportata è `classificaDomanda(testo)` e l'output è un oggetto con `etichetta`, `regola`, `motivo` e, per il controllo straniero, `parole`.

L'obiettivo è integrare questo modulo in un sito statico come parte di un esperimento. Un secondo classificatore lineare era previsto, ma non è realizzato in questa consegna. L'ampliamento del corpus a 80.000 domande è stato rinviato. La decisione corrente è usare B5 come filtro JavaScript.

Per l'integrazione usare il modulo approvato senza cambiare implicitamente le etichette o la logica. Le decisioni di modellizzazione spettano all'utente. Eventuali ulteriori modifiche devono essere presentate distinguendo proposte e approvazioni, mostrando recuperi e regressioni esempio per esempio. Una migliore accuratezza netta non dimostra assenza di regressioni.

Le convenzioni aggiornate e l'ordine delle regole sono in `README.md`. Fa fede il codice consegnato; alcuni commenti ereditati dalle versioni sperimentali descrivono il contesto precedente e non vanno interpretati come specifiche aggiuntive.

## Errori esterni noti

Sono 12 rispetto alle etichette attese dei diagnostici. Il corpus ha 582/582 risultati conformi, ma gli esterni mantengono questi limiti:

| Domanda | Attesa | Output |
|---|---|---|
| Ho riflettuto, quale itinerario, secondo te, conviene scegliere? | aperta | si_no |
| Ho una casa, dove passo l'estate, che affitterò presto? | si_no | aperta |
| Vuoi il tè o il succo? | aperta | si_no |
| Che sia già finita la gara? | si_no | aperta |
| Che sia già partito? | si_no | aperta |
| Dopo che hai finito dove andrai domani? | aperta | si_no |
| Ho chiuso il negozio, che vuoi comprare domani? | aperta | si_no |
| Ho scelto il lavoro, che vuoi fare adesso? | si_no | aperta |
| Ho visto il film, che vuoi vedere stasera? | si_no | aperta |
| Tomorrow? | incerta | si_no |
| Come here? | incerta | aperta |
| How come? | incerta | si_no |

Le due domande su lavoro e film sono etichettate secondo una lettura relativa intenzionale e possono essere ambigue. Gli altri diagnostici esterni sono anch'essi casi di sviluppo con etichette proposte, non un gold standard indipendente.

La regola residuale può assegnare `si_no` a parole inventate seguite da `?`. Il controllo straniero si attiva solo in assenza di evidenza italiana riconosciuta, quindi non è un rilevatore universale della lingua. L'input in alfabeto latino è una scelta del progetto, non un vincolo già imposto da un componente UI.
