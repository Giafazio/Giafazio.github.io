# Implementation plan

**Versione:** 1.2  
**Data:** 2026-08-07  
**Stack fissato:** Astro, TypeScript, Markdown/MDX, GitHub Pages.

## 1. Quando cominciare

L'implementazione può iniziare **subito dopo l'approvazione strutturale** di:

1. HomeLog reale;
2. Projects page reale;
3. specifica e registro 1.2.

Non è necessario attendere:

- font definitivi;
- palette e pattern;
- sprite finali degli animali;
- nome definitivo di Paths & Atlas;
- titolo della raccolta poetica;
- poesia;
- date mancanti;
- versione interattiva di Lega i 4.

Questi elementi sono isolabili mediante token, asset sostituibili, draft e roadmap.

Prima del primo deployment pubblico, ma non prima di iniziare il codice, serviranno invece:

- approvazione del testo About;
- destinazioni reali dei link About;
- scelta del repository GitHub;
- controllo editoriale dei contenuti che non devono restare draft;
- autorizzazione esplicita alla pubblicazione.

## 2. Stato di partenza

Il workspace contiene specifiche, prototipi e sorgenti reali, ma non contiene ancora un'app Astro:

- nessun `package.json`;
- nessun `astro.config.*`;
- nessun repository Git operativo del sito;
- nessuna pipeline GitHub Pages.

Il passo successivo non è quindi “integrare” i prototipi in un'app esistente, ma inizializzare il progetto reale.

## 3. Architettura tecnica minima

```text
personal-site/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   ├── projects/
│   │   ├── field-notes/
│   │   ├── experiments/
│   │   └── artifacts/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── field-notes/
│   │   ├── projects/
│   │   ├── experiments/
│   │   ├── finished-things/
│   │   └── atlas/
│   ├── layouts/
│   ├── components/
│   ├── lib/
│   └── styles/
├── public/
│   └── files/
│       ├── crosswords/
│       └── thoughts/
├── sources/
│   └── la-signorina-probabilita/
└── .github/
    └── workflows/
        └── deploy.yml
```

Le API correnti di Astro consentono di dichiarare le collezioni in `src/content.config.ts` e caricare file Markdown, MDX, JSON, YAML o TOML locali mediante `glob()`: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/).

## 4. Primo milestone: fetta verticale reale

### Passo 1 — Fondazioni

- inizializzare Astro statico con TypeScript strict;
- fissare lockfile e versioni;
- configurare centralmente `site` e l'eventuale `base`;
- introdurre schema e validazioni delle quattro collezioni;
- aggiungere una funzione unica per costruire URL interni.

### Passo 2 — Shell e navigazione

- implementare le sei destinazioni;
- costruire la fascia continua di maioliche come componente;
- usare sprite provvisori separati dagli stili;
- rendere il menu pienamente utilizzabile senza animazioni;
- aggiungere idle e movimento al clic come enhancement;
- rispettare `prefers-reduced-motion`.

### Passo 3 — HomeLog e Projects

- implementare About, overview Projects e Log generato;
- importare i cinque record Project;
- mostrare i quattro progetti principali espansi;
- mostrare Esperimenti di portafoglio contratto;
- generare automaticamente i contenuti di Games & Riddles dalle relazioni.

### Passo 4 — Contenuti reali

- importare i due cruciverba come artifact;
- creare le loro pagine canoniche e servire i PDF originali;
- importare *La signorina Probabilita* come Thought draft;
- predisporre HTML web e PDF senza compilare LaTeX durante la build;
- importare la filastrocca come Fragment draft;
- registrare Lega i 4 soltanto nella roadmap.

### Passo 5 — Viste derivate

- Finished Things ibrido;
- indice cronologico Field Notes & Thoughts;
- Experiments & Fragments;
- Atlas statico completo con primo filtro per tag;
- relazioni e backlink Project–content.

### Passo 6 — Verifica locale

- `astro check`;
- build di produzione;
- controllo link e asset;
- viewport 320, 768 e 1280 px;
- tastiera e focus;
- contrasto;
- riduzione del movimento;
- verifica che nessun draft generi una route pubblica.

**Uscita del milestone:** dalla HomeLog si raggiunge Games & Riddles, da lì i due cruciverba, e gli stessi artifact si ritrovano in Finished Things e Atlas senza duplicazioni. In parallelo, il modello dimostra che un Thought può comparire nel Log e in Finished Things mantenendo un solo URL.

## 5. Primo deployment

Astro raccomanda la propria Action ufficiale per pubblicare su GitHub Pages: [Deploy an Astro site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

Sequenza:

1. creare o scegliere il repository;
2. aggiungere il workflow ufficiale;
3. pubblicare prima sull'URL `github.io`;
4. verificare base path, asset e routing;
5. solo dopo collegare il dominio personalizzato.

GitHub raccomanda di verificare il dominio prima di associarlo al repository; la configurazione DNS e HTTPS viene affrontata dopo il deployment tecnico funzionante: [Managing a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## 6. Iterazioni successive

### Iterazione 2

- testi e metadati definitivi;
- anteprime reali dei prodotti;
- primo corpus di tag controllati;
- rifinitura di Finished Things;
- importazione selettiva di contenuti Agroxel;
- prima poesia.

### Iterazione 3

- implementazione di Lega i 4;
- set di domande verificato;
- gestione accessibile di input, esito e reset;
- fallback non interattivo.

### Iterazione 4

- primo Path reale;
- navigazione fra tappe;
- eventuali filtri Atlas aggiuntivi;
- ricerca full-text solo se il corpus la rende utile.

## 7. Rischi da evitare

| Rischio | Contromisura |
|---|---|
| Codificare la specifica 1.1 superata | usare soltanto la 1.2 come contratto |
| Duplicare contenuti in Finished Things | una sola collezione canonica per record |
| Inventare titoli o date mancanti | draft, working label e date opzionali |
| Pagine Project vuote presentate come complete | stato `seed` e descrizione fattuale |
| Dipendere da LaTeX o Pandoc nel deploy | versionare l'output web verificato e il PDF |
| Rompere asset sotto GitHub Pages | configurare `site`, `base` e URL centralizzati |
| Bloccare il codice in attesa della grafica | componenti e token sostituibili |
| Animazioni invasive o inaccessibili | enhancement non essenziale e reduced motion |
| Presentare Lega i 4 come già giocabile | roadmap fino all'implementazione reale |

## 8. Decisione operativa

Dopo l'approvazione delle due tavole reali, il prossimo turno può essere direttamente:

> Inizializza il progetto Astro e realizza il primo milestone della specifica 1.2, senza ancora pubblicarlo.

La prima implementazione resterà locale e verificabile. Creazione del repository, push e deployment sono passi successivi e separati.
