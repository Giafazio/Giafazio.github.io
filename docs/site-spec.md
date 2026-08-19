# Site specification

**Versione:** 1.2  
**Data:** 2026-08-07  
**Stato:** checkpoint autorevole prima dell'implementazione  
**Ambito:** architettura informativa ed editoriale; gli aspetti grafici ancora aperti sono separati dai vincoli strutturali.

Questa versione sostituisce le parti incompatibili della specifica 1.1. In particolare, non esistono più una sezione About autonoma, un Log di aggiornamenti o due destinazioni separate per Paths e Atlas.

## 1. Tesi del sito

Il sito è uno spazio personale di pubblicazione ed esplorazione. Accoglie progetti, idee, prove e prodotti compiuti senza assumere l'attività accademica come identità dominante e senza imporre una divisione rigida per discipline.

La metafora domestica resta un registro informale. I nomi tecnici sono primari negli indici, negli URL e nella navigazione; i nomi delle stanze possono comparire soltanto come titoli secondari o motivi grafici.

Il nome pubblico è **Fabrizio Caragiulo**. Il dominio canonico previsto è `fabriziocaragiulo.com`.

## 2. Architettura primaria

La navigazione globale ha sei destinazioni:

| N. | Destinazione | Funzione |
|---:|---|---|
| 01 | **HomeLog** | ingresso: About, overview dei progetti e Log |
| 02 | **Field Notes & Thoughts** | Site Notes sul sito e Thoughts sulle idee dell'autore |
| 03 | **Projects** | overview e pagine dei progetti |
| 04 | **Experiments & Fragments** | prove, abbozzi e materiali intenzionalmente aperti |
| 05 | **Finished Things** | galleria/showcase dei prodotti compiuti |
| 06 | **Paths & Atlas** | mappa complessiva e, in futuro, percorsi curati; nome visibile provvisorio |

**About non è una settima destinazione.** È il primo blocco editoriale di HomeLog.

## 3. HomeLog

HomeLog è la home, all'URL `/`. I suoi blocchi compaiono in quest'ordine.

### 3.1 About

Contiene:

- una presentazione breve;
- contatti e profili approvati;
- eventuale CV esteso;
- eventuali presentazioni alternative o approfondimenti biografici;
- accesso secondario al precedente lavoro accademico.

Il testo seguente è una **bozza editoriale**, non ancora testo autoriale definitivo:

> I am a mathematician by training. This site gathers projects, thoughts, experiments and finished things across the subjects I keep returning to.

I link possono essere aggiunti o sostituiti senza modificare l'architettura. Il precedente archivio accademico può restare raggiungibile da `/about/academic-work/`, ma non compare nella navigazione primaria.

### 3.2 Projects overview

Mostra i progetti principali. Per ciascuno:

- nome;
- descrizione breve;
- link alla pagina del progetto;
- link diretti ai contenuti in evidenza che appartengono al progetto.

Nella prima versione i quattro progetti indicati dal proprietario possono essere mostrati tutti, perché sono ancora pochi. Quando il numero crescerà:

- i progetti in evidenza resteranno espansi;
- gli altri mostreranno inizialmente soltanto il titolo;
- la selezione del titolo espanderà descrizione e link, preferibilmente mediante un elemento HTML nativo `details`.

### 3.3 Log

Il Log **non è un registro tecnico di aggiornamenti** e non possiede Log entry autonome.

È una vista generata che mostra, in ordine temporale di scrittura:

- i titoli degli ultimi `site-note`;
- i titoli degli ultimi `thought`.

Ogni riga rimanda direttamente al contenuto canonico. Non vi compaiono:

- avanzamenti di progetto;
- nuovi artifact;
- modifiche tecniche al sito;
- contenuti di Experiments & Fragments;
- semplici date di pubblicazione.

La data visibile, quando nota, è la data o il periodo di scrittura. Una revisione sostanziale può essere indicata nella pagina singola, ma non cambia automaticamente l'ordine del Log.

## 4. Field Notes & Thoughts

La sezione usa un indice cronologico unico, senza raggruppamenti tematici.

Ogni record dichiara obbligatoriamente uno dei due valori:

- `site-note`: parla del sito, della sua organizzazione, dei suoi contenuti o delle scelte fatte per costruirlo;
- `thought`: espone un'idea, una domanda, un'argomentazione o una riflessione dell'autore.

Entrambi devono essere comprensibili come unità autonome. Lunghezza e grado di rifinitura non determinano la categoria.

I metadati visibili restano compressi: tipo, data o periodo di scrittura e lingua. Non viene mostrata una data `Published`.

## 5. Projects

Un Project è un'attività con direzione, sviluppo o obiettivo riconoscibile. La pagina del progetto raccoglie:

- motivazione e descrizione;
- stato corrente;
- contenuti appartenenti al progetto;
- contenuti messi in evidenza;
- risorse esterne approvate;
- sviluppi pianificati.

L'appartenenza a un progetto non crea una copia del contenuto e non ne cambia l'URL canonico.

### 5.1 Progetti registrati

#### Games & Riddles

Giochi di parole e rompicapi pubblicabili su carta o, quando opportuno, in forma interattiva.

Contenuti reali già disponibili:

- **Cruciverba 1**;
- **Cruciverba 2**.

Sviluppo pianificato:

- **Lega i 4**: vengono date quattro parole e bisogna individuare il tema comune; la pagina e la versione interattiva saranno implementate in seguito.

#### Agroxel

Progetto di modellazione numerica spaziale per processi agroecologici. Il materiale già elaborato documenta il modulo climatico-idrologico 0.1a; la sua eventuale pubblicazione sul sito richiede una scelta editoriale separata.

#### QuelloTondo

Progetto di carattere tipografico digitale ricavato dalla scrittura manoscritta, con particolare attenzione alle legature e a una pipeline basata su software libero.

#### Raccolta poetica senza nome

Raccolta in formazione. Nome, indice e contenuti pubblici non sono ancora stati stabiliti. L'identificatore tecnico resta stabile anche quando verrà scelto il titolo.

#### Esperimenti di portafoglio

Progetto Python esplorativo e didattico già pubblicato su GitHub. È registrato come progetto reale secondario; nella prima Projects page può comparire contratto, con il solo titolo.

## 6. Experiments & Fragments

La sezione raccoglie prove, prototipi, varianti e parti intenzionalmente aperte. La sua composizione visiva è volutamente meno ordinata delle altre sezioni, ma ogni contenuto mantiene:

- un'identità o identificatore stabile;
- un minimo contesto;
- l'indicazione di ciò che è incompleto;
- un URL solo quando è pronto per essere pubblicato.

La filastrocca ricevuta è registrata qui come frammento/draft. Il rapporto con la raccolta poetica non viene inferito.

## 7. Finished Things

Finished Things è una galleria ibrida:

1. **artifact nativi**, con pagina canonica sotto `/finished-things/[slug]/`;
2. **contenuti cross-listed**, nati in un'altra sezione e mostrati in galleria senza duplicarne il corpo o cambiare l'URL.

Applicazione ai contenuti reali:

| Contenuto | URL canonico | Presenza in Finished Things |
|---|---|---|
| Cruciverba 1 | `/finished-things/cruciverba-1/` | artifact nativo |
| Cruciverba 2 | `/finished-things/cruciverba-2/` | artifact nativo |
| La signorina Probabilita | `/field-notes/la-signorina-probabilita/` | card cross-listed |
| futura poesia autonoma | `/finished-things/[slug]/` | artifact nativo |

Un artifact può appartenere a un Project. Per esempio, i due cruciverba appartengono a Games & Riddles ma mantengono i loro URL in Finished Things.

## 8. Paths & Atlas

È un'unica destinazione globale. La route tecnica iniziale è `/atlas/`, stabile anche se il nome visibile verrà cambiato.

Nell'MVP iniziale contiene soltanto l'Atlas:

- mappa/elenco completo dei contenuti pubblici;
- filtro per tag come requisito minimo;
- estensione successiva a section, type, stage, subject, lingua e data quando il corpus lo giustificherà;
- URL che conserva i filtri;
- elenco statico leggibile anche senza JavaScript.

I Paths curati saranno aggiunti solo quando esisterà il primo percorso reale. Non bloccano l'implementazione iniziale.

## 9. Sitemap iniziale

- `/` — HomeLog;
- `/field-notes/` — Field Notes & Thoughts;
- `/field-notes/[slug]/` — Site Note o Thought;
- `/projects/` — Projects;
- `/projects/[slug]/` — singolo Project;
- `/experiments/` — Experiments & Fragments;
- `/experiments/[slug]/` — singolo Experiment o Fragment pubblicato;
- `/finished-things/` — galleria;
- `/finished-things/[slug]/` — artifact nativo;
- `/atlas/` — Paths & Atlas, inizialmente Atlas;
- `/about/academic-work/` — archivio secondario, non presente nel menu primario.

## 10. Navigazione e registro domestico

La fascia di navigazione approvata è continua, senza spazi bianchi fra le sei maioliche. Ogni tasto ha un piccolo abitante distinto:

- moto idle minimo e continuo;
- movimento netto quando la voce viene selezionata;
- nessuna informazione essenziale affidata all'animazione;
- rispetto di `prefers-reduced-motion`.

La corrispondenza domestica resta:

| Destinazione | Registro secondario |
|---|---|
| HomeLog | Entrance |
| Field Notes & Thoughts | Living room |
| Projects | Garden |
| Experiments & Fragments | Kitchen |
| Finished Things | Dining room |
| Paths & Atlas | Corridor |

Dentro HomeLog, tuttavia, il titolo editoriale del primo blocco è **About**, non Entrance.

## 11. Decisioni grafiche rinviate

Non bloccano l'inizio dell'implementazione:

- font definitivi;
- palette finale e modalità notturna;
- disegno preciso delle maioliche;
- specie e sprite definitivi degli abitanti;
- pattern dello sfondo;
- animazioni rifinite;
- nome visibile definitivo di Paths & Atlas.

Durante il primo milestone si usano token provvisori e componenti sostituibili, senza alterare struttura e contenuti.

## 12. Dati ancora mancanti

Questi dati non vanno inventati:

- testo definitivo di About;
- destinazione del CV esteso e delle eventuali presentazioni;
- date autoriali dei due cruciverba;
- titolo, data e a-capo della filastrocca;
- titolo della raccolta poetica;
- poesia da inserire nella raccolta;
- regole complete, esempi e criteri di soluzione di Lega i 4;
- decisione su quali documenti di Agroxel rendere pubblici.

Le assenze non bloccano lo scaffold: i record incompleti restano draft o roadmap e non vengono pubblicati come pagine finite.
