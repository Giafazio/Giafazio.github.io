---
id: la-signorina-probabilita
title: "La signorina Probabilita"
slug: la-signorina-probabilita
stage: full-grown
draft: false
language: it
subjects: []
tags: []
related: []
sourceFiles:
  - sources/thoughts/la-signorina-probabilita/Probabilità.tex
  - sources/thoughts/la-signorina-probabilita/Probabilità.pdf
entryKind: thought
presentation: longform
showTableOfContents: false
hyphenate: true

authorialCredit: "Fagiolizio Carruba"
authorialDateLabel:  "8bre 2021 – 22 gennaio 2023 – 17 agosto 2026"

summary: "Tra definizioni di probabilità e bisogno di certezza."

texSource: sources/thoughts/la-signorina-probabilita/Probabilità.tex
pdfAsset: /files/thoughts/la-signorina-probabilita.pdf

projects: []
creationDate:
  precision: month
  value: "2021-10"

addedToSite: "2026-08-15"
---
## Das Rätsel des Müntzer

L'esempio che introduce quasi ogni trattazione della probabilità è il lancio di una moneta: la probabilità ch'esca testa è

<math display="block" aria-label="un mezzo">
  <mfrac>
    <mn>1</mn>
    <mn>2</mn>
  </mfrac>
</math>

ma [(clicchi pure, clicchi pure) in che senso?](https://media.tenor.com/gAT5JphRhJMAAAAM/in-che-senso-verdone.gif)

## La uno, la due o la ttre?

Nel mio libretto delle superiori di probabilità e statistica, un opuscolo aggiuntivo al libro di matematica, erano presentate [dico](https://media.tenor.com/WIFwxtRlxdcAAAAC/dico-dire.gif) 3 definizioni di probabilità.

1. *Combinatoria* o *classica*: rapporto tra il numero di casi favorevoli e quelli sfavorevoli.

2. *Frequentista*: come prima, ma considerando il limite a cui si tende ripetendo l'esperimento all'infinito.

3. *Soggettivista* (De Finetti docet) e totalmente macchinosa: presupponendo un ente perfettamente razionale e già di difficile immaginazione, si definisce la probabilità come la quota che un tale ente sarebbe disposto a scommettere se, in caso di realizzazione dell'evento, vincesse 1.

## [A rapporto](http://www.reactiongifs.com/r/qKPQS7J.gif)

Analizzo la prima e, credo, la meno controversa. Meno controversa solo perché ingloba ogni difficoltà proprio nelle ipotesi: suppone che il rapporto sia effettivamente un rapporto tra due numeri interi, cioè che i casi favorevoli e sfavorevoli siano ben determinabili ed esattamente in numero finito.

Ma cos'è mai esattamente finito? il numero delle specie animali? un bel problema contarle esattamente. Il numero di elettroni? ma le eccitazioni di un campo quantistico non sono forse definite solo in senso probabilistico? senso che proprio ora non possiamo dare per scontato, a meno di non morderci la coda.

E non entro nemmeno nei dettagli tecnici, come il fatto che il numero di eccitazioni sia ben definito solo nel particolare limite in cui il campo è non interagente: [annamo bene](https://media.tenor.com/7GCqWr7qdccAAAAC/sora-lella-annamo-bene.gif)!

Che famo allora? Assumiamo assiomaticamente il concetto di probabilità come ente primitivo? ma allora usiamo come assioma certo l'incertezza, annamo [benissimo](https://i.pinimg.com/originals/0b/c4/fd/0bc4fde475c7e730ef10ea83aaaac91a.gif)!

## Frequenti?

Come si giustifica, invece, quel [concentrato assurdo di problemi](https://64.media.tumblr.com/1cd332bc4fd3549b007983ee08e5d65b/tumblr_oxig4lvM4g1tlsda4o1_500.gifv) che è la seconda definizione? La spiegazione più comune tira in ballo ancora la stramaledetta moneta e prende a lanciarla e rilanciarla e rilanciarla ancora e ancora. Dopo un incerto po' di tempo, si stila il totale dei risultati e si dice: saranno circa metà testa e metà croce, e dunque ½ è il limite a cui stiamo tendendo. [Non esiste un singolo passaggio di questa spiegazione che non mi faccia infuriare.](https://media.tenor.com/y12FnAb7ABwAAAAC/get-lost-stop.gif)

Mettiamo che escano trenta “testa” di fila: che si fa? dichiariamo la moneta bacata o no? Anzi, passo indietro. Come facciamo, sin da principio, a dire che la moneta non è truccata se ammettiamo che una moneta non bacata possa cadere sempre di testa per l'intera durata delle nostre vite? si dice spesso che ciò è possibile, sì, ma con probabilità vicina a 0. Probabilità che però non siamo ancora sicuri di come definire! Se una qualsivoglia procedura può dare due soli risultati, dopo quante ripetizioni diciamo che entrambi i risultati hanno probabilità ½?

Quando, quand'è che ci decideremo a dire sì o no, mi fido o non mi fido? quando diremo che la moneta è bacata o è perfetta? questa bellissima maledetta moneta. Come facciamo, anzi, a dire che ci sono solo due possibili risultati? magari sono 3, magari c'è un misteriosissimo terzo risultato segreto, ma abbiamo effettuato ancora poche ripetizioni per vederlo.

## Senza limiti

E non abbiamo nemmeno lontanamente toccato i problemi matematici dell'esistenza del limite. Perché i valori del rapporto ottenuti dopo tot ripetizioni dovrebbero avvicinarsi sempre più a un qualche valore con l'aumentare delle ripetizioni?

Questo valore limite potrebbe benissimo non esistere *anche se*, in un certo qual senso, metà dei lanci danno testa e metà croce: ripetendo i lanci si potrebbe oscillare tra una *non trascurabile* eccedenza di teste e una di croci.

Esempio concreto e un po' esagerato per far capire l'idea: 10 teste, poi 100 croci, poi 1000 teste, poi 10000 croci, poi...

Esempio ancora più concreto: magari la nostra moneta è omogenea quanto alla densità dei suoi materiali, ma leggermente disomogenea quanto alle loro proprietà magnetiche. Allora forse subirebbe una leggera influenza del campo magnetico terrestre e testa o croce non avrebbero forse la stessa probabilità. Ma dato che il campo magnetico è variabile nel tempo, cosa diciamo? che la probabilità varia nel tempo anch'essa? ma questo invece significa che la procedura di lancio non viene ripetuta indefinitamente ma solo in un certo intervallo di tempo, contravvenendo alla definizione iniziale. Dovremmo includere i risultati dei lanci dal tardo paleolitico fino a questo pazzo mondo di oggi, o no?

## Il soggettone:

Bruno De Finetti, vero maσchio italico, scrive un libro sulla probabilità ed esordisce con

<blockquote class="probability-axiom">
  <p>La probabilità non esiste.</p>
</blockquote>

<span class="small-caps">goat</span>, bel drip e grande farmata d'aura. Nei suoi lavori, dovendo comunque riempire le pagine, alza le mani e, incarnazione probabilistica di “rigore è quando arbitro fischia”, definisce “probabilità è quanto scommetti”.

Non si espone su come stabilire a priori quali siano eventi semplici o indipendenti, quello sarà affar tuo. Ma una volta che avrai assegnato valori a questi eventi, l'ente razionale sarà in grado di assegnare valori anche agli eventi composti. Ad esempio, *se* ammetti che testa e croce abbiano probabilità ½, e *se* ammetti che due lanci siano indipendenti, allora puoi calcolare la probabilità dell'evento “esce due volte testa”. Insomma, grande paraculata: studiamo la logica dietro il calcolo delle probabilità, astraendo dall'assegnazione iniziale. Notiamo anche la seconda grandissima paraculata: tu, scommettitore, saresti paragonabile a un ente perfettamente razionale.

## Cerchiamo

<div
  class="solution-circle"
  role="img"
  aria-label="Un cerchio intorno alle parole: la soluzione"
>
  <span aria-hidden="true">la soluzione</span>
</div>

Ne *La ginestra, o il fiore del deserto* il felino marchigiano ci presenta quella che per lui è l'unica possibilità di affrontare a viso aperto il destino. Si badi bene: non di controllarlo, manipolarlo, vincerlo, bensì solo di affrontarlo, di farci i conti. Dobbiamo stringerci in un'umana catena e collaborare.

Chi stabilirà che gli esiti del lancio di una moneta sono essenzialmente due? Tutti noi, insieme, partendo dalle esperienze passate che ci vengono raccontate, verificandole al meglio delle nostre possibilità e consegnando ai posteri i nostri risultati.

La probabilità iniziale sarà definita in base alle esperienze dirette e condivise. Possiamo dire che una data procedura può avere *1, 2, 3, …N* risultati possibili quando l'esperienza individuale e il consenso collettivo sono d'accordo sia nell'individuazione della procedura, sia degli *N* possibili risultati, sia sull'assenza di alcuna preferenza nei confronti di un risultato. Allora possiamo dire che ciascun risultato possibile ha probabilità *1/N*.

Recuperiamo così la definizione classica, ma basandola su un mischione di esperienze passate, di consenso e stati cognitivi che in qualche modo emulano le infinite ripetizioni della definizione frequentista, e sostituiscono lo scommettitore con un soggetto collettivo.

## Noi

Credo che la probabilità non debba essere intesa come qualcosa di distinto dalla verità. Credo occorra piuttosto dire questo: che le affermazioni probabilistiche si riferiscono a fenomeni collettivi, molteplici e complessi.

Quando diciamo che la *probabilità* di ottenere testa è ½, siamo al contempo *certi* che, se in mille lanci esce croce, c'è dell'informazione che ci sfugge. Forse la moneta è bacata, forse c'è un meccanismo fisico ancora ignoto, forse il destino ci sta interpellando. Non potremmo, ragionevolmente, essere indifferenti a un simile avvenimento.

L'affermazione che la *probabilità* di ottenere testa è ½ riflette anche le esperienze passate, che non portano a privilegiare un esito rispetto a un altro. A loro volta, questi mille lanci sarebbero un'esperienza diretta, fortissima e di altrettanta dignità.

## Io

Di fronte a questa discussione, a questa mia stessa elucubrazione, mi sento un po' spaesato. Tutto sembra incerto, i miei stessi pensieri, le mie stesse parole, figuriamoci le conclusioni.

Come posso scegliere di compiere una qualsiasi azione se i risultati sono incerti, se potrebbe conseguirne un disastro orrendo, se le mie stesse intenzioni non sono così chiare o così buone, se i miei ragionamenti sono intrecciati ai miei pregiudizi?

Ha senso scommettere su eventi ripetibili, ma non ha senso mettere a rischio qualcosa di unico. Se c'è in ballo il proprio futuro, la direzione della propria vita, il concetto di probabilità perde di senso.

Per vivere, c'è bisogno di una certezza di fondo, di una fede nella possibilità di rimediare agli errori, di fare e di volere del bene. E come si fa a sapere che cos'è il voler bene se prima non se ne è fatta esperienza?