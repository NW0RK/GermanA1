/**
 * decks.js — Deck Configuration
 *
 * HOW TO ADD A DECK:
 *   1. Add words to vocabulary.js with the new deck number
 *   2. Copy a deck object below and update the fields
 *   3. Add the word IDs to wordIds[]
 *
 * Boss fight question types: "translation" | "conjugation" | "gender" | "fill-article"
 */
const DECKS = [
  {
    id: 1,
    name: "Erste Schritte",
    subtitle: "First Steps",
    description: "Greetings, subject pronouns, and the essential verbs sein & haben.",
    color: "#ff2d78",
    colorDim: "rgba(255, 45, 120, 0.15)",
    icon: "🌱",
    grammarTopics: [
      "Subject Pronouns (ich, du, er…)",
      "sein — to be (irregular)",
      "haben — to have (irregular)",
      "Basic adjectives",
      "Greetings & phrases"
    ],
    bossTheme: "The Grammar Goblin",
    bossEmoji: "👺",
    // IDs of words that belong to this deck (from vocabulary.js)
    wordIds: [
      "p001","p002","p003","p004","p005","p006","p007","p008",
      "v001","v002","v003","v004",
      "n001","n002","n003","n004","n005",
      "a001","a002","a003","a004","a005","a006",
      "ph001","ph002","ph003","ph004","ph005","ph006","ph007"
    ],
    // Which question types appear in the boss fight (weighted)
    bossQuestionWeights: { translation: 3, conjugation: 4, gender: 1 },
    unlockedByDefault: true
  },
  {
    id: 2,
    name: "Die Welt",
    subtitle: "The World",
    description: "Definite articles, nominative case, and regular present-tense verbs.",
    color: "#00f5ff",
    colorDim: "rgba(0, 245, 255, 0.12)",
    icon: "🌍",
    grammarTopics: [
      "Definite articles (der / die / das)",
      "Nominative case",
      "Regular verbs: gehen, kommen, wohnen, lernen, arbeiten",
      "Everyday nouns"
    ],
    bossTheme: "The Article Dragon",
    bossEmoji: "🐉",
    wordIds: [
      "n006","n007","n008","n009","n010","n011","n012","n013","n014","n015",
      "v005","v006","v007","v008","v009",
      "a007","a008","a009","a010"
    ],
    bossQuestionWeights: { translation: 2, conjugation: 3, gender: 3 },
    unlockedByDefault: false
  },
  {
    id: 3,
    name: "Im Alltag",
    subtitle: "Everyday Life",
    description: "Accusative case, irregular verbs, and food & drink vocabulary.",
    color: "#ffe600",
    colorDim: "rgba(255, 230, 0, 0.12)",
    icon: "⚡",
    grammarTopics: [
      "Accusative case (den / das / die / einen)",
      "Irregular verbs: essen, lesen, fahren, sprechen",
      "Food & drink vocabulary",
      "Temperature adjectives"
    ],
    bossTheme: "The Case Colossus",
    bossEmoji: "🦖",
    wordIds: [
      "n016","n017","n018","n019","n020","n021","n022","n023",
      "v010","v011","v012","v013","v014",
      "a011","a012","a013","a014","a015"
    ],
    bossQuestionWeights: { translation: 2, conjugation: 5, gender: 1 },
    unlockedByDefault: false
  },
  {
    id: 4,
    name: "Seminar 04.03",
    subtitle: "Aktivitäten und Verben",
    description: "Verbs from the 04.03.2025 seminar.",
    color: "#a200ff",
    colorDim: "rgba(162, 0, 255, 0.12)",
    icon: "🏃",
    grammarTopics: [
      "Regular verbs: spielen, kochen, schwimmen...",
      "Verb conjugations"
    ],
    bossTheme: "The Verb Viper",
    bossEmoji: "🐍",
    wordIds: [
      "v015", "v016", "v017", "v018", "v019", "v020", "v021", "v022", "v023", "v024", "n024"
    ],
    bossQuestionWeights: { translation: 3, conjugation: 5, gender: 0 },
    unlockedByDefault: true
  }
];
