/**
 * vocabulary.js — German A1 Word Pool
 *
 * HOW TO ADD WORDS:
 *   Copy any entry below and change the fields.
 *   Required fields: id (unique), word, type, translation, deck
 *   Optional: gender (for nouns), irregular (for verbs), conjugations (for verbs), example
 *
 * Types: "noun" | "verb" | "adjective" | "pronoun" | "phrase"
 * Decks: 1 | 2 | 3 (add more decks in decks.js)
 */
const VOCABULARY = [

  // ─────────────────────────────────────────────
  // DECK 1 — Erste Schritte (First Steps)
  // Grammar: Pronouns, sein, haben, basic adjectives
  // ─────────────────────────────────────────────

  // Pronouns
  { id: "p001", word: "ich",   type: "pronoun", translation: "I",                  deck: 1 },
  { id: "p002", word: "du",    type: "pronoun", translation: "you (informal)",      deck: 1 },
  { id: "p003", word: "er",    type: "pronoun", translation: "he",                  deck: 1 },
  { id: "p004", word: "sie",   type: "pronoun", translation: "she / they",          deck: 1 },
  { id: "p005", word: "es",    type: "pronoun", translation: "it",                  deck: 1 },
  { id: "p006", word: "wir",   type: "pronoun", translation: "we",                  deck: 1 },
  { id: "p007", word: "ihr",   type: "pronoun", translation: "you all",             deck: 1 },
  { id: "p008", word: "Sie",   type: "pronoun", translation: "you (formal)",        deck: 1 },

  // Verbs (Deck 1)
  {
    id: "v001", word: "sein", type: "verb", irregular: true, translation: "to be", deck: 1,
    conjugations: { ich: "bin", du: "bist", er: "ist", sie: "ist", es: "ist", wir: "sind", ihr: "seid", Sie: "sind" },
    example: "Ich bin müde."
  },
  {
    id: "v002", word: "haben", type: "verb", irregular: true, translation: "to have", deck: 1,
    conjugations: { ich: "habe", du: "hast", er: "hat", sie: "hat", es: "hat", wir: "haben", ihr: "habt", Sie: "haben" },
    example: "Ich habe einen Hund."
  },
  {
    id: "v003", word: "heißen", type: "verb", irregular: false, translation: "to be called", deck: 1,
    conjugations: { ich: "heiße", du: "heißt", er: "heißt", sie: "heißt", es: "heißt", wir: "heißen", ihr: "heißt", Sie: "heißen" },
    example: "Ich heiße Anna."
  },
  {
    id: "v004", word: "machen", type: "verb", irregular: false, translation: "to make / to do", deck: 1,
    conjugations: { ich: "mache", du: "machst", er: "macht", sie: "macht", es: "macht", wir: "machen", ihr: "macht", Sie: "machen" },
    example: "Was machst du?"
  },

  // Nouns (Deck 1)
  { id: "n001", word: "Mann",     type: "noun", gender: "der", translation: "man",     deck: 1, example: "Der Mann arbeitet." },
  { id: "n002", word: "Frau",     type: "noun", gender: "die", translation: "woman",   deck: 1, example: "Die Frau liest." },
  { id: "n003", word: "Kind",     type: "noun", gender: "das", translation: "child",   deck: 1, example: "Das Kind spielt." },
  { id: "n004", word: "Name",     type: "noun", gender: "der", translation: "name",    deck: 1, example: "Wie ist Ihr Name?" },
  { id: "n005", word: "Land",     type: "noun", gender: "das", translation: "country", deck: 1, example: "Deutschland ist ein Land." },

  // Adjectives (Deck 1)
  { id: "a001", word: "gut",   type: "adjective", translation: "good",         deck: 1, example: "Das ist gut." },
  { id: "a002", word: "groß",  type: "adjective", translation: "big / tall",   deck: 1, example: "Der Hund ist groß." },
  { id: "a003", word: "klein", type: "adjective", translation: "small / short",deck: 1, example: "Das Kind ist klein." },
  { id: "a004", word: "alt",   type: "adjective", translation: "old",          deck: 1, example: "Das Buch ist alt." },
  { id: "a005", word: "neu",   type: "adjective", translation: "new",          deck: 1, example: "Das Auto ist neu." },
  { id: "a006", word: "jung",  type: "adjective", translation: "young",        deck: 1, example: "Die Frau ist jung." },

  // Phrases (Deck 1)
  { id: "ph001", word: "Hallo",           type: "phrase", translation: "Hello",               deck: 1 },
  { id: "ph002", word: "Auf Wiedersehen", type: "phrase", translation: "Goodbye",             deck: 1 },
  { id: "ph003", word: "Danke",           type: "phrase", translation: "Thank you",            deck: 1 },
  { id: "ph004", word: "Bitte",           type: "phrase", translation: "Please / You're welcome", deck: 1 },
  { id: "ph005", word: "Ja",              type: "phrase", translation: "Yes",                  deck: 1 },
  { id: "ph006", word: "Nein",            type: "phrase", translation: "No",                   deck: 1 },
  { id: "ph007", word: "Entschuldigung",  type: "phrase", translation: "Excuse me / Sorry",   deck: 1 },

  // ─────────────────────────────────────────────
  // DECK 2 — Die Welt (The World)
  // Grammar: Definite/indefinite articles, nominative case, regular verbs
  // ─────────────────────────────────────────────

  // Nouns (Deck 2)
  { id: "n006", word: "Hund",     type: "noun", gender: "der", translation: "dog",     deck: 2, example: "Der Hund schläft." },
  { id: "n007", word: "Katze",    type: "noun", gender: "die", translation: "cat",     deck: 2, example: "Die Katze trinkt Milch." },
  { id: "n008", word: "Buch",     type: "noun", gender: "das", translation: "book",    deck: 2, example: "Das Buch ist interessant." },
  { id: "n009", word: "Tisch",    type: "noun", gender: "der", translation: "table",   deck: 2, example: "Der Tisch ist groß." },
  { id: "n010", word: "Stuhl",    type: "noun", gender: "der", translation: "chair",   deck: 2, example: "Der Stuhl ist bequem." },
  { id: "n011", word: "Haus",     type: "noun", gender: "das", translation: "house",   deck: 2, example: "Das Haus ist schön." },
  { id: "n012", word: "Schule",   type: "noun", gender: "die", translation: "school",  deck: 2, example: "Die Schule ist groß." },
  { id: "n013", word: "Arbeit",   type: "noun", gender: "die", translation: "work",    deck: 2, example: "Die Arbeit ist schwer." },
  { id: "n014", word: "Auto",     type: "noun", gender: "das", translation: "car",     deck: 2, example: "Das Auto ist rot." },
  { id: "n015", word: "Stadt",    type: "noun", gender: "die", translation: "city",    deck: 2, example: "Die Stadt ist schön." },

  // Verbs (Deck 2)
  {
    id: "v005", word: "gehen", type: "verb", irregular: false, translation: "to go", deck: 2,
    conjugations: { ich: "gehe", du: "gehst", er: "geht", sie: "geht", es: "geht", wir: "gehen", ihr: "geht", Sie: "gehen" },
    example: "Ich gehe nach Hause."
  },
  {
    id: "v006", word: "kommen", type: "verb", irregular: false, translation: "to come", deck: 2,
    conjugations: { ich: "komme", du: "kommst", er: "kommt", sie: "kommt", es: "kommt", wir: "kommen", ihr: "kommt", Sie: "kommen" },
    example: "Er kommt aus Deutschland."
  },
  {
    id: "v007", word: "wohnen", type: "verb", irregular: false, translation: "to live / to reside", deck: 2,
    conjugations: { ich: "wohne", du: "wohnst", er: "wohnt", sie: "wohnt", es: "wohnt", wir: "wohnen", ihr: "wohnt", Sie: "wohnen" },
    example: "Wo wohnst du?"
  },
  {
    id: "v008", word: "lernen", type: "verb", irregular: false, translation: "to learn", deck: 2,
    conjugations: { ich: "lerne", du: "lernst", er: "lernt", sie: "lernt", es: "lernt", wir: "lernen", ihr: "lernt", Sie: "lernen" },
    example: "Ich lerne Deutsch."
  },
  {
    id: "v009", word: "arbeiten", type: "verb", irregular: false, translation: "to work", deck: 2,
    conjugations: { ich: "arbeite", du: "arbeitest", er: "arbeitet", sie: "arbeitet", es: "arbeitet", wir: "arbeiten", ihr: "arbeitet", Sie: "arbeiten" },
    example: "Wo arbeitest du?"
  },

  // Adjectives (Deck 2)
  { id: "a007", word: "schön",      type: "adjective", translation: "beautiful / nice", deck: 2, example: "Das Haus ist schön." },
  { id: "a008", word: "interessant",type: "adjective", translation: "interesting",      deck: 2, example: "Das Buch ist interessant." },
  { id: "a009", word: "schwer",     type: "adjective", translation: "heavy / difficult",deck: 2, example: "Die Arbeit ist schwer." },
  { id: "a010", word: "leicht",     type: "adjective", translation: "light / easy",     deck: 2, example: "Das ist leicht." },

  // ─────────────────────────────────────────────
  // DECK 3 — Im Alltag (Everyday Life)
  // Grammar: Accusative case, irregular verbs, food & drink
  // ─────────────────────────────────────────────

  // Nouns — Food & Drink (Deck 3)
  { id: "n016", word: "Brot",    type: "noun", gender: "das", translation: "bread",  deck: 3, example: "Das Brot ist frisch." },
  { id: "n017", word: "Wasser",  type: "noun", gender: "das", translation: "water",  deck: 3, example: "Das Wasser ist kalt." },
  { id: "n018", word: "Kaffee",  type: "noun", gender: "der", translation: "coffee", deck: 3, example: "Der Kaffee ist heiß." },
  { id: "n019", word: "Milch",   type: "noun", gender: "die", translation: "milk",   deck: 3, example: "Die Milch ist frisch." },
  { id: "n020", word: "Bier",    type: "noun", gender: "das", translation: "beer",   deck: 3, example: "Das Bier ist kalt." },
  { id: "n021", word: "Apfel",   type: "noun", gender: "der", translation: "apple",  deck: 3, example: "Der Apfel ist rot." },
  { id: "n022", word: "Suppe",   type: "noun", gender: "die", translation: "soup",   deck: 3, example: "Die Suppe ist heiß." },
  { id: "n023", word: "Kuchen",  type: "noun", gender: "der", translation: "cake",   deck: 3, example: "Der Kuchen ist süß." },

  // Verbs (Deck 3 — Irregular focus)
  {
    id: "v010", word: "essen", type: "verb", irregular: true, translation: "to eat", deck: 3,
    conjugations: { ich: "esse", du: "isst", er: "isst", sie: "isst", es: "isst", wir: "essen", ihr: "esst", Sie: "essen" },
    example: "Ich esse Brot."
  },
  {
    id: "v011", word: "trinken", type: "verb", irregular: false, translation: "to drink", deck: 3,
    conjugations: { ich: "trinke", du: "trinkst", er: "trinkt", sie: "trinkt", es: "trinkt", wir: "trinken", ihr: "trinkt", Sie: "trinken" },
    example: "Er trinkt Kaffee."
  },
  {
    id: "v012", word: "lesen", type: "verb", irregular: true, translation: "to read", deck: 3,
    conjugations: { ich: "lese", du: "liest", er: "liest", sie: "liest", es: "liest", wir: "lesen", ihr: "lest", Sie: "lesen" },
    example: "Du liest ein Buch."
  },
  {
    id: "v013", word: "fahren", type: "verb", irregular: true, translation: "to drive / to travel", deck: 3,
    conjugations: { ich: "fahre", du: "fährst", er: "fährt", sie: "fährt", es: "fährt", wir: "fahren", ihr: "fahrt", Sie: "fahren" },
    example: "Er fährt ein Auto."
  },
  {
    id: "v014", word: "sprechen", type: "verb", irregular: true, translation: "to speak", deck: 3,
    conjugations: { ich: "spreche", du: "sprichst", er: "spricht", sie: "spricht", es: "spricht", wir: "sprechen", ihr: "sprecht", Sie: "sprechen" },
    example: "Ich spreche Deutsch."
  },

  // Adjectives (Deck 3)
  { id: "a011", word: "heiß",   type: "adjective", translation: "hot",        deck: 3, example: "Der Kaffee ist heiß." },
  { id: "a012", word: "kalt",   type: "adjective", translation: "cold",       deck: 3, example: "Das Wasser ist kalt." },
  { id: "a013", word: "frisch", type: "adjective", translation: "fresh",      deck: 3, example: "Das Brot ist frisch." },
  { id: "a014", word: "süß",    type: "adjective", translation: "sweet",      deck: 3, example: "Der Kuchen ist süß." },
  { id: "a015", word: "lecker", type: "adjective", translation: "delicious",  deck: 3, example: "Das Essen ist lecker." },

  // ─────────────────────────────────────────────
  // DECK 4 — Seminar 04.03
  // ─────────────────────────────────────────────
  {
    id: "v015", word: "spielen", type: "verb", irregular: false, translation: "თამაში", deck: 4,
    conjugations: { ich: "spiele", du: "spielst", er: "spielt", sie: "spielt", es: "spielt", wir: "spielen", ihr: "spielt", Sie: "spielen" },
    example: "Ich spiele Fußball."
  },
  {
    id: "v016", word: "hören", type: "verb", irregular: false, translation: "მოსმენა", deck: 4,
    conjugations: { ich: "höre", du: "hörst", er: "hört", sie: "hört", es: "hört", wir: "hören", ihr: "hört", Sie: "hören" },
    example: "Ich höre gern Radio."
  },
  {
    id: "v017", word: "kochen", type: "verb", irregular: false, translation: "მზადება/ხარშვა", deck: 4,
    conjugations: { ich: "koche", du: "kochst", er: "kocht", sie: "kocht", es: "kocht", wir: "kochen", ihr: "kocht", Sie: "kochen" },
    example: "Er kocht das Essen."
  },
  {
    id: "v018", word: "schwimmen", type: "verb", irregular: false, translation: "ცურვა", deck: 4,
    conjugations: { ich: "schwimme", du: "schwimmst", er: "schwimmt", sie: "schwimmt", es: "schwimmen", wir: "schwimmen", ihr: "schwimmt", Sie: "schwimmen" },
    example: "Sie schwimmen im Fluss."
  },
  {
    id: "v019", word: "rennen", type: "verb", irregular: false, translation: "სირბილი", deck: 4,
    conjugations: { ich: "renne", du: "rennst", er: "rennt", sie: "rennt", es: "rennt", wir: "rennen", ihr: "rennt", Sie: "rennen" },
    example: "Ich renne im Park."
  },
  {
    id: "v020", word: "malen", type: "verb", irregular: false, translation: "აკვარელებით ხატვა", deck: 4,
    conjugations: { ich: "male", du: "malst", er: "malt", sie: "malt", es: "malt", wir: "malen", ihr: "malt", Sie: "malen" },
    example: "Ihr malt ein Haus."
  },
  {
    id: "v021", word: "zeichnen", type: "verb", irregular: false, translation: "ფანქრებით ხატვა", deck: 4,
    conjugations: { ich: "zeichne", du: "zeichnest", er: "zeichnet", sie: "zeichnet", es: "zeichnet", wir: "zeichnen", ihr: "zeichnet", Sie: "zeichnen" },
    example: "Ich zeichne eine Blume."
  },
  {
    id: "v022", word: "schreiben", type: "verb", irregular: false, translation: "წერა", deck: 4,
    conjugations: { ich: "schreibe", du: "schreibst", er: "schreibt", sie: "schreibt", es: "schreibt", wir: "schreiben", ihr: "schreibt", Sie: "schreiben" },
    example: "Du schreibst eine Nachricht."
  },
  {
    id: "v023", word: "sagen", type: "verb", irregular: false, translation: "თქმა", deck: 4,
    conjugations: { ich: "sage", du: "sagst", er: "sagt", sie: "sagt", es: "sagt", wir: "sagen", ihr: "sagt", Sie: "sagen" },
    example: "Ihr sagt die Wahrheit."
  },
  {
    id: "v024", word: "spazieren", type: "verb", irregular: false, translation: "გასეირნება", deck: 4,
    conjugations: { ich: "spaziere", du: "spazierst", er: "spaziert", sie: "spaziert", es: "spaziert", wir: "spazieren", ihr: "spaziert", Sie: "spazieren" },
    example: "Ich spaziere im Park."
  },
  { id: "n024", word: "Schwester", type: "noun", gender: "die", translation: "და", deck: 4, example: "Meine Schwester ist hier." }

];
