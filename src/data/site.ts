export const siteConfig = {
  name: "Fabrizio Caragiulo",
  headerTitle: "Fabrizio's Webhome",
  description:
    "Projects, thoughts, experiments and artifacts by Fabrizio Caragiulo.",
  identityNote: "projects, notes, experiments & other inhabitants",
  welcome: {
    defaultEnthusiasm: 3,

    nameVariants: [
      { text: "Fabrizio", lang: "it", dir: "ltr" },
      { text: "发彬佐", lang: "zh-Hans", dir: "ltr" },
      { text: "ファブリツィオ", lang: "ja", dir: "ltr" },
      { text: "Φαμπρισο", lang: "el", dir: "ltr" },
      { text: "Фабрицио", lang: "ru", dir: "ltr" },
      { text: "파브리지오", lang: "ko", dir: "ltr" },
      { text: "Ֆաբրիցիո", lang: "hy", dir: "ltr" },
      { text: "ფაბრიციო", lang: "ka", dir: "ltr" },
      { text: "פבריציו", lang: "he", dir: "rtl" },
      { text: "فابريتسيو", lang: "ar", dir: "rtl" },
    ],

    enthusiasmTexts: [
      `..., I am {name}. I trained as a mathematician for reasons that once seemed clearer than they do now. I am now trying to understand in what place, if any, what I have learned might not be entirely wasted.

  This site contains some wonky stuff that would otherwise probably remain scattered. For the moment, I am trying to explore the fields of numerical simulation and agronomy without any particular confidence. Mathematics, music, language and food have not yet disappeared entirely from my interest. I sometimes play bass and tutor mathematics when someone asks.`,

      `Hi..., I am {name}. I trained as a mathematician, but I have interests in a range of other fields. I am now trying to understand what place, if any, what I have learned might have in the real world, an expression I continue to use despite having no clear idea of what it is.

  This site contains some stuff that would otherwise probably remain scattered. For the moment, I am trying to explore the fields of numerical simulation and agronomy. I still return, with varying degrees of purpose, to mathematics, music, language and food. I sometimes play bass and tutor mathematics.`,

      `Hello..., I am {name}. Tinkerer by inclination, I am a mathematician by training, but I have interests in a range of other fields. I am now trying to understand what place what I have learned might have in the real world.

  This site contains some projects, thoughts and experiments across different subjects. These days, I am trying to explore the fields of numerical simulation and agronomy. I still return to mathematics, music, language and food. I play bass and tutor mathematics from time to time.`,

      `Hello, I am {name}! Tinkerer by inclination, I am a mathematician by training, but my curiosity has never stayed within a single field. I am now looking for opportunities to apply what I have learned to the real world®.

  This site gathers projects, thoughts and experiments across the subjects that catch my attention. These days, I am exploring the fields of numerical simulation and agronomy. Mathematics, music, language and food are interests I keep returning to. I also play bass and tutor mathematics from time to time.`,

      `Hello there, I am {name}! Tinkerer by inclination, I am a mathematician by training, but my curiosity has never stayed within a single field. I am now eager to find opportunities to apply what I have learned to the real world®.

  This site gathers projects, thoughts, and experiments that grow out of my interests. These days, I am exploring the fields of numerical simulation and agronomy. Mathematics, music, language, and food are interests I keep returning to. I also play bass and tutor mathematics from time to time.`,

      `Hello there! I am {name}! Tinkerer by inclination, I am a mathematician by training, but my curiosity rarely stays in one place for long. I am now eager to take what I have learned beyond academia and put it to work in the real world®.

  This site gathers projects, thoughts, and experiments that grow out of my interests. These days, I am exploring the fields of numerical simulation and agronomy. Mathematics, music, language, and food are interests I keep returning to. I also like playing bass and occasionally tutor mathematics.`,

      `HELLO WORLD! I am {name}! Tinkerer by inclination, I am a mathematician by training, driven by a curiosity that constantly leads me into new fields! I am thrilled to take what I have learned and to put it to work in the real world®!

  This site is my growing collection of projects, thoughts, and experiments. These days, I am exploring the fields of numerical simulation and agronomy with much interest! My curiosity also leads me back to mathematics, music, language, and food. I love playing bass, tutor mathematics from time to time and am always looking for the next thing to learn, make, or understand!`,
    ],
  },
  welcomeStatus: "editorial-draft",

  footerLinks: [
    {
      label: "AboutMe ",
      links: [
        {
          label: "CV",
          href:"/files/fabrizio-caragiulo-cv.pdf",
        },
      ],
    },
    {
      label: "AboutThisSite ",
      links: [
        {
          label: "Acknowledgements",
          href: "/acknowledgements/",
        },
      ],
    },
    {
      label: "FindMe ",
      links: [
        {
          label: "Mail",
          href: "mailto:fabrizio.caragiulo@gmail.com",
        },
        {
          label: "GitHub",
          href: "https://github.com/Giafazio",
        },
        {
          label: "OldSite",
          href: "https://sites.google.com/view/fabriziocaragiulo",
        },
      ],
    },
  ],

  /*
   * Manteniamo questi link separati perché possono
   * essere usati anche dal footer.
   */
  links: [
    {
      label: "Contact",
      href: "mailto:fabrizio.caragiulo@gmail.com",
    },
    {
      label: "GitHub",
      href: "https://github.com/Giafazio",
    },
  ],

} as const;

export const navigation = [
  {
    index: "01",
    label: "HomeLog",
    shortLabel: "HomeLog",
    href: "/",
    section: "home",
    room: "Entrance",
  },
  {
    index: "02",
    label: "Field Notes & Thoughts",
    shortLabel: "FieldNotes",
    href: "/field-notes/",
    section: "field-notes",
    room: "Living room",
  },
  {
    index: "03",
    label: "Projects",
    shortLabel: "Projects",
    href: "/projects/",
    section: "projects",
    room: "Garden",
  },
  {
    index: "04",
    label: "Experiments & Fragments",
    shortLabel: "Experiments",
    href: "/experiments/",
    section: "experiments",
    room: "Kitchen",
  },
  {
    index: "05",
    label: "Paths & Atlas",
    shortLabel: "Pathlas",
    href: "/atlas/",
    section: "atlas",
    room: "Corridor",
  },
] as const;

export type SiteSection = (typeof navigation)[number]["section"];
