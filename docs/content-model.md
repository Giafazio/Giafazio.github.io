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

Il file `content-registry.yaml` è il registro corrente. Distingue:

- file realmente disponibili;
- informazioni dichiarate dall'autore;
- metadati tecnici non equivalenti a date autoriali;
- elementi pianificati;
- dati mancanti che non devono essere inventati.
