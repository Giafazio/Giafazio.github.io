/** B5: B4 con alternative temporali ellittiche da elenco finito. */
const ESPRESSIONI_TEMPORALI_B5 = new Set(["oggi","domani","dopodomani","ieri","adesso","ora","prima","dopo","presto","tardi","subito","stamattina","stasera","stanotte","domattina","più tardi","più presto","domani mattina","domani sera","lunedì","martedì","mercoledì","giovedì","venerdì","sabato","domenica"]);

function alternativaTemporaleB5(parte) {
  const t = parte.normalize('NFC').toLocaleLowerCase('it').replace(/\s+/gu, ' ').trim();
  if (!/[?？]+$/u.test(t)) return false;
  const valori = t.replace(/[?？]+$/u, '').trim().split(/\s+(?:o|oppure)\s+/u);
  return valori.length === 2 && valori[0] !== valori[1] && valori.every(v => ESPRESSIONI_TEMPORALI_B5.has(v));
}

/** B4: B+++ e controllo lessicale straniero subordinato agli indizi italiani.
 * Modulo autonomo per browser: nessuna dipendenza o richiesta di rete.
 * Input previsto: alfabeto latino. Il dizionario non identifica la lingua.
 */
function schemaCheOggetto(parte) {
  const raw = parte.toLocaleLowerCase('it').replace(/[?？.!！;]+$/u, '').trim();
  const k = raw.lastIndexOf(',');
  if (k < 0) return null;
  const prefix = raw.slice(0, k).trim(), tail = raw.slice(k + 1).trim();
  // Indizi della principale precedente: prima persona con ausiliare +
  // participio regolare/alcuni irregolari, o cornice cognitiva in prima persona.
  // Non costituiscono una prova che la principale sia dichiarativa.
  const passato = /^(?:(?:io|noi)\s+)?(?:non\s+)?(?:ho|abbiamo)\s+(?:(?:già|appena|anche)\s+)?(?:\p{L}+(?:ato|uto|ito)|letto|visto|detto|fatto|scritto|scelto|preso|perso)(?=\s|$)/u.test(prefix);
  const cognitiva = /^(?:(?:io|noi)\s+)?(?:non\s+)?(?:penso|pensiamo|credo|crediamo|suppongo|supponiamo|rifletto|riflettiamo)(?=\s|$)/u.test(prefix);
  if ((!passato && !cognitiva) || prefix.includes(',') || direttaPolare234(prefix)) return null;
  // Soggetto già espresso nella flessione del modale; infinito transitivo.
  // L'assenza di oggetto è inferita solo nelle code brevi elencate: con un
  // complemento nominale o un clitico oggetto la regola non scatta.
  const m = /^che\s+(?:non\s+)?(vuoi|vuole|vogliamo|volete|vogliono|vorrei|vorresti|vorrebbe|vorremmo|vorreste|vorrebbero|puoi|può|possiamo|potete|possono|potresti|potrebbe|devi|deve|dobbiamo|dovete|devono)\s+(fare|comprare|leggere|scegliere|preparare|scrivere|cambiare|portare|mettere|prendere|vedere|dire)((?:\s+(?:adesso|ora|oggi|domani|stasera|qui|lì|ancora|invece|poi|subito))*)$/u.exec(tail);
  if (!m) return null;
  return { prefix, tail, modale: m[1], infinito: m[2], ruoloCheProposto: 'oggetto_interrogativo', antecedentePossibile: dipendenzaChe(prefix, parte) };
}

function codaDoveLocuzione(raw) {
  // Correzione stretta: una coda finale di due parole, senza verificare tutti i verbi.
  const m = /\bdove\s+\p{L}+\s*[?？]+$/u.exec(raw);
  if (!m) return null;
  const prefix = raw.slice(0, m.index);
  // Non promuovere il complemento di una richiesta polare superiore.
  if (/(?:^|\s)(?:se|puoi|posso|possiamo|potete|può|potresti|potreste|potrebbe|potrei|sai|so|sapete|sappiamo|sapere|capire|chiedere|chiederti|dirmi|dirci|dici|spieghi|racconti|descrivi)(?=\s|$)/u.test(prefix)) return null;
  return singola(raw.slice(m.index));
}

/**
 * Variante sperimentale: regole testuali, senza dizionario di verbi
 * né dipendenze dall'analizzatore precedente.
 */
const APERTA = /^(?:(?:di|a|da|con|per|su)\s+)?(?:chi|che|che cosa|cosa|quando|dove|perché|come|quanto|quanta|quanti|quante|quale|quali|qual)(?=\s|$)|^(?:a che ora|fino a quando|in che modo|con quale|che senso)(?=\s|$)/u;
// Lessico della richiesta: introduce il contenuto, non verifica tutti i verbi.
const CORNICE = /(?:^|\s)(?:vorrei|vorremmo|voglio|vogliamo|desidero|desideriamo|mi interessa|mi interesserebbe|mi piacerebbe)(?=\s|$)/u;
const TESTA_RICHIESTA = /(?:^|\s)(?:sapere|capire|conoscere|scoprire|verificare|accertare|controllare|chiedere|chiederti|chiedervi|chiederle|chiedergli|domandare|domandarti)(?=\s|$)/gu;
const MARCATORE = /(?:^|\s)(se|chi|che cosa|cosa|quando|dove|perché|come|quanto|quanta|quanti|quante|quale|quali|qual|a che ora)(?=\s|$)/u;
function esito(etichetta, regola, motivo) {
  return { etichetta, regola, motivo };
}
function locuzioneChe(t) {
  return /^(?:dopo che|prima che|dato che|visto che)(?=\s|$)/u.test(t);
}

function principaleDopoLocuzione(parte) {
  const raw = parte.toLocaleLowerCase('it').trim();
  if (!locuzioneChe(nucleo(raw))) return null;
  // La virgola è un confine esplicito: senza di essa non stimiamo la fine della subordinata.
  const k = raw.indexOf(',');
  if (!/[?？]/u.test(raw)) return null;
  if (k < 0) return codaDoveLocuzione(raw);
  return singola(parte.slice(k + 1));
}

function dipendenzaChe(prefix, parte) {
  const p = prefix.trim().replace(/,+$/u, '').trim();
  // Piccolo lessico di reggenze; non una prova di dipendenza sintattica.
  const completiva = /(?:^|\s)(?:penso|pensi|pensa|pensiamo|pensate|pensano|credo|credi|crede|crediamo|credete|credono|suppongo|supponi|spero|speri|temo|temi|dici|dice|so|sai|sappiamo|sembra|pare|è vero|è possibile|è probabile|sono sicuro|sei sicuro|sei sicura|siamo sicuri)(?=\s|$)/u.test(p);
  if (completiva) return true;
  // Antecedente possibile: determinante + sintagma nominale breve, pronome,
  // oppure nome proprio riconoscibile dalla maiuscola nel testo originale.
  if (/(?:^|\s)(?:il|lo|la|i|gli|le|un|uno|una|quel|quella|questo|questa)\s+\p{L}+(?:\s+\p{L}+){0,2}$/u.test(p)) return true;
  if (/(?:^|\s)(?:lui|lei|loro|quello|quella|qualcuno|qualcosa)$/u.test(p)) return true;
  const original = parte.slice(0, prefix.length).trim().replace(/,+$/u, '').trim();
  return /(?:^|\s)\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+)?$/u.test(original);
}

function nucleo(testo) {
  let t = testo.toLocaleLowerCase("it").replace(/[?？.!！;]+$/u, "").trim();
  t = t.replace(/^perché\s*,\s*/u, "");
  let precedente;
  do {
    precedente = t;
    if (locuzioneChe(t)) break;
    t = t.replace(/^(?:allora|dunque|bene|insomma|quindi)(?:\s*,\s*|\s+)|^senti\s*,\s*/u, "");
    t = t.replace(/^(?:oggi|ieri|domani|domattina|stasera|stanotte|ora|adesso|poi|dopo|più tardi|alla fine)(?:\s*,\s*|\s+)|^prima di\s+[^,]+,\s*/u, "");
  } while (t !== precedente);
  return t;
}
function indiretta(t) {
  const cornice = CORNICE.exec(t);
  if (!cornice) return null;
  const restante = t.slice(cornice.index + cornice[0].length);
  const teste = [...restante.matchAll(TESTA_RICHIESTA)];
  for (const testa of teste) {
    const dopo = restante.slice(testa.index + testa[0].length);
    const m = MARCATORE.exec(dopo);
    if (m) return esito(m[1] === "se" ? "si_no" : "aperta",
      "richiesta_indiretta", "Tipo del complemento interrogativo in una cornice di richiesta riconosciuta.");
  }
  return null;
}
function preposizionale234(t, mode) {
  if (mode === "nessuna") return false;
  if (mode === "ampia")
    return /^(?:di|a|da|con|per|su|in|tra|fra|entro|oltre|fino a)\s+(?:che|chi|cosa|qual|quale|quali|quanto|quanta|quanti|quante|quando|dove|come)(?=\s|$)/u.test(t);
  // Selettori nominali, più due locuzioni temporali; non ogni marcatore.
  return /^(?:di|a|da|con|per|su|in|tra|fra|oltre|fino a)\s+(?:che|qual|quale|quali)(?=\s|$)/u.test(t) ||
    /^(?:entro|fino a)\s+quando(?=\s|$)/u.test(t);
}

function direttaPolare234(prefix) {
  // Le virgole di un inciso non interrompono la cornice polare iniziale.
  const t = prefix.replace(/,/gu, " ").replace(/\s+/gu, " ").trim().replace(/^non\s+/u, "");
  return /^(?:(?:mi|ti|ci|vi|lo|la|gli|le|me|te)\s+)*(?:puoi|posso|possiamo|potete|può|potresti|potreste|potrebbe|potrei)(?=\s|$)/u.test(t) ||
    /^(?:mi|ci|ti|vi)\s+(?:dici|racconti|spieghi|descrivi|ricordi|mostri|confermi|fai sapere)(?=\s|$)/u.test(t);
}

function premessa234(prefix) {
  if (/^(?:dopo|prima|alla fine|anche|più tardi|oggi|ieri|domani|domattina|stasera)(?=\s|$)/u.test(prefix)) return true;
  if (/(?:^|\s)(?:ho|hai|ha|abbiamo|avete|hanno|sono|sei|è|siamo|siete|era|erano)(?=\s|$)/u.test(prefix)) return true;
  return /^(?:non\s+)?(?:mi|ti|ci|vi|lo|la|gli|le)\s+\p{L}+(?=\s|$)/u.test(prefix);
}

function apertaDopoVirgola234(parte, mode, prepMode) {
  if (mode === "nessuna") return false;
  const raw = parte.toLocaleLowerCase("it").replace(/[?？.!！;]+$/u, "").trim();
  const commas = [...raw.matchAll(/,/gu)].map(m => m.index);
  const positions = mode === "tutte_prudente" ? commas : commas.slice(-1);
  for (const k of positions) {
    const prefix = raw.slice(0, k).trim();
    if (mode !== "ultima_senza_guardie" && (!premessa234(prefix) || direttaPolare234(prefix))) continue;
    const tail = nucleo(raw.slice(k + 1));
    // "che" isolato dopo una virgola può introdurre una relativa.
    const bareChe = /^che(?=\s|$)/u.test(tail) && !/^che\s+(?:cosa|senso)(?=\s|$)/u.test(tail) && dipendenzaChe(prefix, parte);
    if ((mode === "ultima_senza_guardie" || !bareChe) &&
        (APERTA.test(tail) || preposizionale234(tail, prepMode))) return true;
  }
  return false;
}

function alternativa234(t, mode) {
  if (mode === "nessuna") return false;
  if (/\bo(?:ppure)?\s+no$/u.test(t) || /^sì o no$/u.test(t)) return false;
  if (mode === "qualsiasi_o") return /\bo(?:ppure)?\b/u.test(t);
  const nominale = /\bil\s+[^,]+?\s+o\s+il(?=\s|$)/u.test(t);
  const daParallelo = /\bda(?:l|llo|lla|i|gli|lle)\s+[^,]+?\s+o\s+da(?:l|llo|lla|i|gli|lle)(?=\s|$)/u.test(t);
  const giorni = /\b(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+o\s+(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)(?=\s|$)/u.test(t);
  if (mode === "strutturale") return nominale || daParallelo || giorni;
  // Una richiesta polare superiore conserva la precedenza.
  if (/\bse(?=\s|$)/u.test(t)) return false;
  const explicit = /(?:^|\s)(?:scegli|scegliamo|scegliete|preferisco|preferisci|preferiamo|preferite)(?=\s|$)/u.exec(t);
  const plan = /^(?:prendiamo|iniziamo|organizziamo|fissiamo|passiamo|prenotiamo)(?=\s|$)/u.exec(t);
  if (explicit) return nominale || daParallelo || giorni;
  if (mode === "scelta_esplicita")
    return giorni && /^(?:organizziamo|fissiamo)(?=\s|$)/u.test(t);
  return Boolean(plan) && (nominale || daParallelo || giorni);
}

function regole234(t, parte, config) {
  if (config.whOvunque && /(?:^|\s)(?:chi|che cosa|cosa|quando|dove|perché|come|quanto|quanti|quale|quali)(?=\s|$)/u.test(t))
    return esito("aperta", "wh_ovunque_234", "Marcatore aperto ovunque (variante ingenua).");
  if (preposizionale234(t, config.prep))
    return esito("aperta", "sintagma_preposizionale_234", "Sintagma interrogativo iniziale riconosciuto.");
  if (apertaDopoVirgola234(parte, config.comma, config.prep))
    return esito("aperta", "richiesta_dopo_premessa_234", "Segmento aperto dopo una premessa riconosciuta.");
  if (alternativa234(t, config.alternative))
    return esito("aperta", "alternative_234", "Alternativa riconosciuta secondo la variante.");
  return null;
}

const CONFIG234 = {"prep":"selettiva","comma":"ultima_prudente","alternative":"scelta_e_pianificazione"};

function singola(parte) {
  if (alternativaTemporaleB5(parte))
    return esito('aperta', 'alternativa_temporale_ellittica', 'Scelta esplicita fra due espressioni temporali riconosciute.');
  const principale = principaleDopoLocuzione(parte);
  if (principale) return principale;
  const t = nucleo(parte);
  const domanda = /[?？]/u.test(parte);
  const esclamazione = /[!！]$/u.test(parte.trim()) && !domanda;
  if (!/[\p{L}\p{N}]/u.test(parte)) return null;
  if (APERTA.test(t) && !esclamazione)
    return esito("aperta", "principale_aperta", "Interrogativo aperto iniziale.");
  const richiesta = indiretta(t);
  // Una cornice dichiarativa di richiesta viene valutata anche senza ?.
  if (richiesta) return richiesta;
  if (!domanda) return null;
  const strutturaChe = schemaCheOggetto(parte);
  if (strutturaChe)
    return esito("aperta", "che_oggetto_schema_sintattico", "Premessa in prima persona e coda con modale, infinito transitivo e oggetto non espresso.");
  const extra234 = regole234(t, parte, CONFIG234);
  if (extra234) return extra234;
  if (/^(?:ciao|buongiorno|buonasera|salve|dimmi|ditemi|spiegami|indicami)(?=\s|$)/u.test(t))
    return esito("aperta", "fuori_ambito", "Saluto o richiesta non interrogativa.");
  if (/\be\s+(?:a che ora|quando|dove|perché|come|quanto|quanti|quale|chi)(?=\s|$)/u.test(t))
    return esito("aperta", "domande_miste", "Coordinazione contenente una richiesta aperta.");
  if (/\bo(?:ppure)?\s+no$/u.test(t) || /^sì o no$/u.test(t))
    return esito("si_no", "alternativa_polare", "Alternativa fra conferma e negazione.");
  if (/\bo(?:ppure)?\b/u.test(t) &&
    (/^preferisci(?=\s|$)/u.test(t) ||
     /\b(?:oggi|domani)\s+o\s+(?:oggi|domani)(?=\s|$)/u.test(t) ||
     /\balle\s+\S+\s+o\s+alle(?=\s|$)/u.test(t)))
    return esito("aperta", "alternativa_valori", "Alternativa di valori riconosciuta.");
  return esito("si_no", "interrogativa_residua", "Interrogativa con contenuto linguistico, senza una regola che la renda aperta.");
}
function classificaBaseB4(testo) {
  if (typeof testo !== "string")
    return esito("aperta", "input_non_valido", "Input non testuale.");
  const t = testo.normalize("NFC").replace(/\s+/gu, " ").trim();
  if (!/[\p{L}\p{N}]/u.test(t))
    return esito("aperta", "input_non_valido", "Input vuoto o senza contenuto linguistico.");
  const parti = t.match(/[^.!?？！;]+[.!?？！;]+|[^.!?？！;]+$/gu) || [];
  const richieste = parti.map(singola).filter(Boolean);
  if (!richieste.length)
    return esito("aperta", "assenza_di_richiesta", "Nessuna richiesta riconosciuta.");
  if (richieste.length === 1) return richieste[0];
  if (richieste.some(r => r.etichetta === "aperta"))
    return esito("aperta", "domande_combinate", "Una richiesta della combinazione è aperta.");
  return esito("si_no", "polari_combinate", "Tutte le richieste riconosciute sono polari.");
}


const DIZIONARIO_STRANIERO_B4 = new Set(["you","your","yours","yourself","he","she","its","we","they","him","her","them","was","were","been","being","does","did","done","have","has","had","having","will","would","shall","should","could","may","might","must","not","who","whom","whose","what","which","when","where","why","how","that","those","these","there","this","the","and","but","then","than","because","although","while","whether","with","without","from","into","about","between","among","through","before","after","during","under","over","please","hello","thanks","yes","yeah","nope","okay","tell","ask","question","answer","don't","doesn't","didn't","isn't","aren't","wasn't","weren't","won't","can't","couldn't","nous","vous","ils","elles","suis","êtes","avons","avez","sont","étaient","pourquoi","combien","quelles","quels","lequel","laquelle","lesquels","lesquelles","wer","warum","wieso","wie","wann","wo","wohin","woher","welcher","welche","welches","du","ihr","euch","dein","deine","nicht","ist","sind","haben","qué","quién","quiénes","cuál","cuáles","cuándo","dónde","adónde","cómo","cuántos","cuántas","ustedes","vosotros","vosotras","usted","estoy","estás","estamos","tenéis","también","quem","quê","quais","aonde","porquê","porque","quantos","quantas","você","vocês","também","estou","estão","alguém","ninguém","daqui","querem","wat","waar","wanneer","waarom","hoe","welke","hoeveel","jij","jullie","vem","vad","vart","varifrån","när","varför","hur","vilken","vilka","kto","gdzie","kiedy","dlaczego","jak","który","która","ile","czy","čo","prečo","kedy","kde","kam","ako","ktorý","ktorá","koľko","kdo","proč","kdy","který","která","kolik","kaj","zakaj","kdaj","kje","kako","kateri","katera","koliko","poios","poia","poio","pou","giati","posos","poses","poion","kim","nerede","nereye","nereden","neden","niçin","nasıl","hangi","kaç","misiniz","man","mata","ayna","kayfa","limadha","hal","madha","ayyu","ayya","antum","antunna","nahnu","huwa","hiya","hum","hunna","hadha","hadhihi","dhalika","tilka","huna","hunaka","laysa","laysat","yakun","yumkin","uridu","shkun","shnu","imta","kifash","shhal","alash","wash","ashnu","daba","chkoun","wach","win","waqtach","kifach","chhal","alah","menhou","winta","rak","chnowa","chneya","kifech","alech","qaddech","mouch","eikh","matai","eifo","kama","haim","anakhnu","shenme","shei","nali","nar","weishenme","zenme","duoshao","shenmeshihou","nimen","women","chera","chegune","koja","key","aya","shoma","hast","nist","kodam","doko","itsu","naze","doushite","dou","dore","anata","watashi","desu","nugu","mueot","eodi","eonje","wae","eotteoke","eolma","mwoya","dangsin","aniyo","kya","kaun","kahan","kab","kyon","kaise","kitna","kitne","aap","nahin","kyun","evaru","ekkada","eppudu","enduku","ela","enta","meeru","kaadu","yaar","enge","eppodhu","eppadi","evvalavu","edhu","neengal","illai","nini","wapi","vipi","gani","ngapi","mbona","yupi","kipi","wewe"]);

function indiziItalianiB4(testo) {
  const t = testo.toLocaleLowerCase('it');
  const pulito = t.replace(/[?？.!！;]+$/u, '').trim();
  if (nucleo(t) !== pulito) return true; // introduzione italiana già riconosciuta
  // Riutilizza le categorie delle regole italiane. Il punto interrogativo,
  // le decisioni residuali e la semplice presenza di lettere non sono indizi.
  if (/(?:^|[^\p{L}\p{M}])(?:chi|che|cosa|quando|dove|perché|come|quanto|quanta|quanti|quante|quale|quali|qual|ho|hai|ha|abbiamo|avete|hanno|sono|sei|è|siamo|siete|era|erano|puoi|posso|possiamo|potete|può|potresti|potreste|potrebbe|potrei|scegli|scegliamo|scegliete|preferisco|preferisci|preferiamo|preferite|prendiamo|iniziamo|organizziamo|fissiamo|passiamo|prenotiamo|ciao|buongiorno|buonasera|salve|dimmi|ditemi|spiegami|indicami)(?=$|[^\p{L}\p{M}])/u.test(t)) return true;
  if (CORNICE.test(t)) return true;
  if (/^(?:non\s+)?(?:mi|ti|ci|vi|lo|la|gli|le)\s+\p{L}+(?=\s|[?？.!！,;]|$)/u.test(t.trim())) return true;
  return false;
}

function paroleStraniereB4(testo) {
  const normalized = testo.normalize('NFC').replace(/[’‘ʼ]/gu, "'").toLocaleLowerCase('it');
  const tokens = normalized.match(/[\p{L}\p{M}]+(?:'[\p{L}\p{M}]+)*/gu) || [];
  return [...new Set(tokens.filter(w => DIZIONARIO_STRANIERO_B4.has(w)))];
}
export function classificaDomanda(testo) {
  const risultato = classificaBaseB4(testo);
  if (typeof testo !== 'string' || risultato.regola === 'input_non_valido') return risultato;
  const residuali = new Set(['interrogativa_residua', 'assenza_di_richiesta', 'polari_combinate', 'domande_combinate']);
  if (!residuali.has(risultato.regola) || indiziItalianiB4(testo)) return risultato;
  // Nelle combinazioni conserva anche una regola italiana specifica già
  // riconosciuta in uno dei segmenti, non soltanto il nome della regola aggregata.
  if (risultato.regola === 'polari_combinate' || risultato.regola === 'domande_combinate') {
    const parti = testo.normalize('NFC').match(/[^.!?？！;]+[.!?？！;]+|[^.!?？！;]+$/gu) || [];
    if (parti.map(singola).some(r => r && !residuali.has(r.regola))) return risultato;
  }
  const parole = paroleStraniereB4(testo);
  if (parole.length) return {
    etichetta: 'incerta', regola: 'possibile_lingua_straniera',
    motivo: 'Nessun indizio italiano riconosciuto; corrispondenza con il dizionario straniero.', parole
  };
  return risultato;
}
