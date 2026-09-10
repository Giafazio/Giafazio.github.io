# Content model

**Versione:** 1.2  
**Data:** 2026-08-07  
**Ambito:** struttura editoriale e schema logico per l'implementazione Astro.

## 1. Principio

Ogni contenuto ha una sola identità e un solo URL canonico. HomeLog, Log, Projects overview, Finished Things e Atlas possono presentarlo in contesti diversi, ma non ne duplicano il corpo.

Il modello iniziale richiede quattro collezioni:

| Collezione | Record |
|---|---|
| `projects` | pagine e metadati dei progetti |
| `fieldNotes` | Site Notes e Thoughts |
| `experiments` | Experiments e Fragments |
| `artifacts` | prodotti nativi di Finished Things |

Non servono collezioni per:

- HomeLog;
- Log;
- About;
- Finished Things come indice;
- Atlas;
- Paths, finché non esiste un primo percorso reale.

Questi elementi sono viste generate oppure componenti strutturali.

## 2. Identificatori e titoli

Ogni record usa un `id` stabile, minuscolo e indipendente dal titolo visibile. Il titolo può cambiare senza cambiare relazioni o URL già pubblici.

Identificatori iniziali:

- `games-and-riddles`;
- `agroxel`;
- `quellotondo`;
- `poetry-collection`;
- `esperimenti-di-portafoglio`;
- `cruciverba-1`;
- `cruciverba-2`;
- `la-signorina-probabilita`;
- `filastrocca-001`;
- `lega-i-4` come elemento pianificato, non ancora pagina pubblica.

Un draft può avere `title: null` e un `working_label` chiaramente redazionale. Un contenuto pubblico deve invece possedere un titolo visibile.

## 3. Campi comuni

| Campo | Tipo | Regola |
|---|---|---|
| `id` | stringa | obbligatorio, stabile e univoco |
| `title` | stringa o null | obbligatorio per contenuti pubblici |
| `working_label` | stringa opzionale | solo per draft senza titolo |
| `summary` | stringa opzionale | non inventare se manca una descrizione autoriale o approvata |
| `language` | codice BCP 47 | obbligatorio per testi; opzionale per artifact non linguistici |
| `stage` | enum | `seed`, `growing`, `stable`, `complete`, `dormant` |
| `draft` | booleano | i draft non generano route pubbliche né entrano nell'Atlas |
| `subjects` | lista | vocabolario controllato e breve |
| `tags` | lista | valori riutilizzabili; nessun tag creato per un solo effetto decorativo |
| `related` | lista di id | relazioni editoriali, non appartenenza a Project |
| `source_files` | lista | provenienza locale o editoriale; non necessariamente esposta al pubblico |
| `updated` | data opzionale | soltanto revisione sostanziale, non data di pubblicazione |

## 4. Date di scrittura

Il sito non usa `published` come metadato visibile o criterio del Log.

Per rispettare date puntuali, intervalli, formulazioni autoriali e date ignote si usano:

| Campo | Funzione |
|---|---|
| `written_on` | data ISO quando esiste un giorno preciso |
| `written_from` | inizio ISO opzionale di un intervallo |
| `written_to` | fine ISO opzionale di un intervallo |
| `written_label` | formulazione visibile esatta, anche non normalizzata |
| `sort_date` | chiave interna opzionale per l'ordine, mai mostrata al posto del label |
| `date_evidence` | provenienza della data: autoriale, file, PDF metadata o sconosciuta |

Regole:

1. una data tecnica di creazione del PDF non diventa automaticamente data autoriale;
2. per un intervallo autoriale si può usare la data finale come `sort_date`, conservando il periodo completo in `written_label`;
3. i draft possono non avere data;
4. i contenuti pubblici senza data appaiono dopo quelli datati nell'indice, con etichetta `Undated` soltanto se l'autore decide di pubblicarli così;
5. `updated` non modifica automaticamente l'ordine cronologico.

## 5. Field Notes & Thoughts

Campi specifici:

| Campo | Tipo | Regola |
|---|---|---|
| `entry_kind` | enum | obbligatorio: `site-note` oppure `thought` |
| `include_in_finished_things` | booleano | default `false`; cross-list senza duplicazione |
| `pdf_asset` | percorso opzionale | versione tipografica accessoria |
| `tex_source` | percorso opzionale | sorgente autorevole, non necessariamente pubblico |

URL canonico: `/field-notes/[slug]/`.

Il Log di HomeLog è generato interrogando questa collezione:

1. `draft = false`;
2. `entry_kind` in `site-note | thought`;
3. ordine per `sort_date`, quindi record senza data;
4. visualizzazione di tipo, titolo e `written_label` compatto.

### 5.1 Collections

Una Collection è un contenuto di Field Notes & Thoughts con `entryKind: collection`: raccoglie elementi esterni. L’Atlas indicizza soltanto la pagina Collection; un futuro Path può riferirsi alla pagina, mai ai suoi singoli elementi. Le raccolte si trovano nell’indice Field Notes & Thoughts e nell’Atlas e usano gli URL `/field-notes/<slug>/`, come le altre note. Non esistono pagine sotto `/collections/`.

Per crearne una, aggiungi un Markdown in `src/content/field-notes/collections/`, usando `passi-sparsi-tra-spicchi-di-mondi.md` come esempio per le playlist. Il corpo contiene l’introduzione facoltativa; il frontmatter contiene `items`. Questa sottosezione usa i nomi degli schemi Astro correnti: `id`, `slug`, `title`, `entryKind`, `collectionKind` e `stage` sono obbligatori. Per le sole Collections, `summary` e `creationDate` sono facoltativi e, se assenti, non vengono mostrati. Quando presente, `creationDate` contiene `precision` e `value`; le Collections senza data seguono i contenuti datati negli ordinamenti per creazione. `addedToSite` serve per i contenuti pubblici. Si riusano `language`, `updated`, `draft`, `subjects`, `tags`, `related`, `projects`, `sourceFiles` e le opzioni del Log. Il tag esistente `home-table` rende il contenuto candidabile ai Featured; non si introduce un campo `featured` separato.

| `collectionKind` | `display` supportati | Default |
|---|---|---|
| `playlist` | `mixtape`, `wall`, `list` | `mixtape` |
| `places`, `shops` | `cards`, `list` | `cards` |
| `links` | `bookmarks`, `list` | `bookmarks` |
| `endorsements`, `other` | `cards`, `list` | `cards` |

Aggiungi gli elementi nell’array `items`, nell’ordine desiderato: `title` e `url` HTTP(S) esterno sono obbligatori; `note` e `visual` sono facoltativi. Le playlist ammettono `shortTitle`, `creator`, `year` intero e `mediaKind: music | video`; places/shops `area` e `category`; links `source`; endorsements `category`. In Mixtape, il quadrato è un link al video: mostra `shortTitle` (o il titolo completo se assente) e `creator`, mentre `title` resta nei dettagli accanto. Cambiare `display` non richiede modifiche agli elementi. `list` mostra soltanto i titoli collegati e l’eventuale creator nelle playlist, senza apertura multipla.

Per mettere in maiuscoletto solo alcuni nomi, aggiungi `creatorSmallCaps`, un array di porzioni esatte di `creator` (esempio: `creatorSmallCaps: ["Zaz"]`); il testo originale rimane leggibile e ricercabile in tutte le viste.

Per i titoli multilingua, `titleLines` è un array ordinato: prima il testo nell’alfabeto originale, poi quello latino; i dettagli mostrano ciascuno su una riga e l’artista sotto in Mixtape. `title` rimane il testo completo per le viste compatte. Per forzare gli a capo sul quadrato, scrivi `shortTitle` come blocco YAML `|-`, con una riga per ogni riga desiderata.

Nelle playlist, `album` è facoltativo e contiene `title`, `year` intero e un eventuale `source` (URL della fonte, conservato nei dati ma non mostrato). Titolo e anno dell’album compaiono sulla stessa riga nei dettagli, con l’anno tra parentesi; `album.year` indica l’uscita dell’album e resta distinto dall’eventuale `year` del brano. Per «passi sparsi tra spicchi di mondi» si cerca il primo album che contiene il brano eseguito dall’interprete del video, incluse raccolte e colonne sonore; per le esecuzioni live può essere l’album in studio. Non si sostituiscono dati mancanti con quelli dell’autore originale o di un EP.

`lyricsExcerpt` può contenere versi scelti dall’autore del sito; `note` resta il commento personale. Sono campi indipendenti e facoltativi: omettili finché non hai un testo, oppure usa blocchi YAML `|-` per conservare gli a capo. In Mixtape i versi compaiono in corsivo sotto il quadrato: una riga vuota separa le strofe e l’area mostra la prima, con scorrimento verticale per le successive, anche da tastiera. Le altre viste mostrano i versi nei dettagli dopo l’album; `list` rimane essenziale e non li mostra.

`visual` accetta `{ type: image, asset, alt, credit?, fit?, position?, textColor?, textPosition?, textShadow? }`, `{ type: text, text? }` oppure `{ type: none }`, che è il default. `asset` è un’immagine locale relativa al Markdown: artwork e foto evocative hanno lo stesso trattamento. `alt` è obbligatorio per le immagini, vuoto soltanto se decorative; `fit` vale `contain` oppure `cover`. In Mixtape, `visual.textColor` sceglie il colore del testo sovrapposto all’immagine: usa un valore esadecimale fra virgolette, ad esempio `textColor: "#1c1c1c"`; se omesso, è bianco (`#fff`). `textPosition: center` sposta le scritte al centro verticale, mantenendo l’allineamento a sinistra; il default è `bottom`. `textShadow: true` aggiunge una lieve ombra scura alle scritte; il default è `false`. Queste opzioni riguardano il testo nel quadrato Mixtape, non i dettagli accanto. `preview` usa lo stesso schema per l’anteprima negli indici; non compare nell’intestazione della Collection.

Per le immagini Mixtape, `visual.textScrim` regola una fascia nera orizzontale dietro l’intero blocco di testo: numero da `0` (default, disattivata) a `1` (nero pieno sotto le scritte), per esempio `textScrim: 0.7`. La fascia segue l’altezza del testo, con brevi sfumature sopra e sotto, e non modifica il file immagine. Si può abbinare al testo bianco e alla posizione predefinita in basso.

`COLLECTION_PREVIEW=1` include le Collections in bozza nelle rispettive pagine Field Notes, nell’indice e nell’Atlas per l’anteprima. Le build di pubblicazione devono escludere questa opzione. Le pagine di prova dei versi e delle visualizzazioni sono state eliminate: si usa la pagina reale. Nelle playlist il selettore sotto il titolo permette di alternare Mixtape, Record Wall e List senza ricaricare la pagina; `display` determina la vista iniziale. Le regole della Mixtape sono raccolte in `src/styles/collection-mixtape.css`: le variabili iniziali controllano misura dei quadrati, spaziatura, versi e sovrapposizione desktop (55 px). Le misure condivise tra viste risiedono in `src/styles/collections.css`. Gli elementi restano nel frontmatter; MDX, file dati separati e `display: map` non sono implementati.

## 6. Projects

Campi specifici:

| Campo | Tipo | Regola |
|---|---|---|
| `status` | enum | `planned`, `active`, `paused`, `complete` |
| `home_overview` | booleano | presenza nell'overview di HomeLog |
| `projects_index_mode` | enum | `expanded` o `collapsed`; scelta editoriale |
| `order` | numero opzionale | ordinamento manuale |
| `external_links` | lista | soltanto destinazioni reali e approvate |
| `roadmap` | lista | sviluppi reali pianificati privi di pagina canonica |

URL canonico: `/projects/[slug]/`.

### 6.1 Relazione Project–content

La relazione autorevole vive nel contenuto, in un campo:

```yaml
projects:
  - id: games-and-riddles
    highlight: true
    order: 1
```

La pagina Project deriva da queste relazioni:

- tutti i contenuti con il medesimo `project id`;
- prima quelli con `highlight: true`, ordinati da `order`;
- poi gli altri contenuti;
- infine la roadmap definita nel record Project.

Il Project non duplica manualmente la lista dei contenuti pubblicati. Gli elementi pianificati senza record, come Lega i 4, restano invece nella roadmap.

## 7. Experiments & Fragments

Campi specifici:

| Campo | Tipo | Regola |
|---|---|---|
| `entry_kind` | enum | `experiment` oppure `fragment` |
| `interactive` | booleano | default `false` |
| `fallback` | stringa o asset opzionale | richiesto per interazioni che altrimenti perdono contenuto essenziale |

URL canonico, solo se pubblicato: `/experiments/[slug]/`.

Un draft può conservare il file sorgente senza generare una pagina. L'irregolarità visiva dell'indice non riduce i requisiti semantici o di accessibilità.

## 8. Artifacts e Finished Things

La collezione `artifacts` contiene i prodotti che non possiedono una collocazione canonica più onesta in Field Notes o Experiments.

Campi specifici:

| Campo | Tipo | Regola |
|---|---|---|
| `artifact_kind` | stringa controllata | es. `crossword`, `poem`, `game`, `font` |
| `primary_asset` | percorso opzionale | PDF, file, pagina o componente principale |
| `preview_asset` | percorso opzionale | anteprima reale; nessun riferimento a file inesistente |
| `projects` | relazioni | stessa struttura definita sopra |

URL canonico: `/finished-things/[slug]/`.

L'indice Finished Things unisce:

1. gli artifact pubblici della collezione `artifacts`;
2. i record di altre collezioni con `include_in_finished_things: true`.

Nel secondo caso la card rimanda all'URL canonico originario. Non viene generata una seconda pagina.

## 9. HomeLog e About

HomeLog è una pagina generata, non una collezione.

La configurazione strutturale contiene:

- testo About;
- link About;
- ordine dei Projects con `home_overview: true`;
- limite iniziale del Log.

About non possiede una route primaria. Documenti più estesi, come CV o archivio accademico, possono avere URL secondari collegati dal blocco.

## 10. Atlas

L'Atlas indicizza tutti i record che soddisfano:

- `draft = false`;
- URL canonico esistente;
- accessibilità pubblica;
- metadati minimi validi.

Le pagine strutturali HomeLog, indici, 404 e archivio About non diventano risultati.

Il primo filtro obbligatorio è `tag`. Le altre dimensioni possono essere abilitate quando i vocabolari reali sono sufficienti.

## 11. Validazioni bloccanti

La build deve fallire se:

- due record hanno lo stesso `id` o URL;
- un contenuto pubblico non ha titolo;
- una relazione Project punta a un id inesistente;
- un `related` punta a un id inesistente;
- un asset pubblico dichiarato non esiste;
- un record Field Notes non dichiara `entry_kind`;
- un artifact usa un URL fuori da `/finished-things/`;
- un contenuto cross-listed viene copiato anche nella collezione artifacts;
- un valore di `language` non è valido;
- un record pubblico dichiara un Project draft non pubblicabile senza una regola esplicita.

La build deve produrre un avvertimento, non un errore, se:

- la data è ignota;
- summary, subjects o tags sono ancora vuoti;
- un Project non ha ancora contenuti pubblici;
- un draft non ha titolo.

## 12. Pubblicazione da LuaLaTeX

Per testi come *La signorina Probabilita*:

1. il `.tex` resta la sorgente autorevole;
2. una conversione controllata produce Markdown/HTML per la lettura web;
3. il PDF compilato resta disponibile come versione tipografica;
4. macro, TikZ e collegamenti esterni vengono verificati manualmente;
5. la build GitHub Pages non compila LaTeX e non dipende da Pandoc: versiona l'output web già verificato.

## 13. Stato dei dati reali

### Sezioni nelle pagine dei progetti

`contentGroups` nel progetto definisce sezioni ordinate (`id`, `title`).
La relazione `projects` di ciascun contenuto può indicare `group`, valido solo
all'interno di quel progetto. Gli elementi senza gruppo restano visibili in
Contents; l'indice generale Projects conserva la propria presentazione.
`sidebarContentIds` sposta nella colonna laterale della pagina del progetto
le schede indicate, mostrando titolo e summary con link alla pagina originale.
I riferimenti ai gruppi e ai contenuti laterali sono validati durante la build.

Le traduzioni poetiche usano `artifactKind: poem`, gruppo `traduzioni`, corpo
italiano e collegamento all'originale su Wikisource. I documenti sorgente restano
in `sources/artifacts/poem-translations`; non sono convertiti durante la build.
`primaryAsset` collega la copia PDF in `public/files/poem-translations`,
mostrando l'azione «Apri o stampa il PDF» nella pagina della traduzione.

I fumetti possono indicare `medium: MS Paint` oppure `medium: Handrawn`.
Il componente `ComicSquare` condivide i ritagli tra Record Wall e
la galleria orizzontale di Fumettonzi nell'indice Projects. Nello stesso indice,
Di versi simili usa una lista verticale scorrevole di titoli e metadati,
senza schede interne.
La pagina Fumettonzi usa `ComicGallery`:
Mixtape iniziale e Record Wall selezionabile senza cambiare pagina.

Le prove concluse sono archiviate localmente in
`sources/development-archive/2026-09-cleanup`, fuori dalle route e dalla build.
La selezione della homepage usa il tag `home-table`; il vecchio campo
`homeOverview`, non utilizzato, è stato rimosso.

Il file `content-registry.yaml` è il registro corrente. Distingue:

- file realmente disponibili;
- informazioni dichiarate dall'autore;
- metadati tecnici non equivalenti a date autoriali;
- elementi pianificati;
- dati mancanti che non devono essere inventati.
