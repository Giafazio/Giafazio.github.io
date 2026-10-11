// Approved Index classifications, shared by the Atlas and its previews.
export const topicAssignments: Record<string, string[]> = {
  Music: ["symphojingles", "avventura-autunno", "passi-sparsi-tra-spicchi-di-mondi", "fortissimi-sumus", "quod-mihi-fatum-est", "hey-fool", "il-silenzio-della-luna"],
  Literature: ["poetry-collection", "chamber-music", "corrispondenze", "ricordami", "un-giorno-scrissi-il-suo-nome", "meriggiare-pallido-e-smorto", "hey-fool", "ho-visto-un-gatto"],
  Mathematics: ["quantum-transport-rg", "math-notes", "risoluzione-esercizi-con-asterisco", "risoluzione-problemi-di-analisi", "un-teorema-sui-continui", "la-signorina-probabilita"],
  Physics: ["quantum-transport-rg"],
  Agronomy: ["agroxel"],
  Simulation: ["agroxel", "esperimenti-di-portafoglio"],
  Finance: ["esperimenti-di-portafoglio"],
  Genealogy: ["caragiulorigin", "albero-fabrizio"],
  Typography: ["quellotondo"],
  Wordplay: ["games-and-riddles", "cruciverba", "cruciverba-1", "cruciverba-2", "cruciverba-3", "mini-cruci-1", "lega-i-4"],
  "Visual arts": ["fumettonzi", "fumettonzi-007", "fumettonzi-008", "fumettonzi-009", "fumettonzi-010", "fumettonzi-013", "fumettonzi-014", "fumettonzi-015", "fumettonzi-nessuno", "fumettonzi-uomo-lasagna", "vaccase", "astruzzeneca", "girapfizer", "lamaderna", "stemma-vaccase", "cervi-units", "virgola"],
};

// The same secondary vocabulary applies to artifacts and experiments.
export const secondaryAssignments: Record<string, string> = {
  "oracolo": "game",
  "avventura-autunno": "composition",
  "risoluzione-esercizi-con-asterisco": "exercises",
  "risoluzione-problemi-di-analisi": "exercises",
  "un-teorema-sui-continui": "article",
  "il-silenzio-della-luna": "lyrics",
  "ho-visto-un-gatto": "nursery-rhyme",
};

// Approved external works; these do not inherit their project's topics.
export const externalAssignments: Record<string, { kind: string; secondary: string; cross: string[]; destination: string }> = {
  "esperimenti-di-portafoglio": { kind: "repository", secondary: "repository", cross: ["finance", "simulation"], destination: "GitHub" },
  "quantum-transport-rg": { kind: "research article", secondary: "article", cross: ["mathematics", "physics"], destination: "Springer" },
};
