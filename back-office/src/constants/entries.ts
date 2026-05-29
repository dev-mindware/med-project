export const grammatical_category = [
  {
    label: "Substantivo",
    value: "noun",
    subcategories: [
      { label: "Comum", value: "common_noun" },
      { label: "Próprio", value: "proper_noun" },
      { label: "Concreto", value: "concrete_noun" },
      { label: "Abstrato", value: "abstract_noun" },
      { label: "Coletivo", value: "collective_noun" },
    ],
  },
  {
    label: "Adjetivo",
    value: "adjective",
    subcategories: [
      { label: "Qualificativo", value: "qualifying_adjective" },
      { label: "Explicativo", value: "explanatory_adjective" },
      { label: "Restritivo", value: "restrictive_adjective" },
    ],
  },
  {
    label: "Artigo",
    value: "article",
    subcategories: [], // artigos geralmente não têm subcategorias
  },
  {
    label: "Numeral",
    value: "numeral",
    subcategories: [
      { label: "Cardinal", value: "cardinal_numeral" },
      { label: "Ordinal", value: "ordinal_numeral" },
      { label: "Multiplicativo", value: "multiplicative_numeral" },
      { label: "Fracionário", value: "fractional_numeral" },
    ],
  },
  {
    label: "Pronome",
    value: "pronoun",
    subcategories: [
      { label: "Pessoal", value: "personal_pronoun" },
      { label: "Possessivo", value: "possessive_pronoun" },
      { label: "Demonstrativo", value: "demonstrative_pronoun" },
      { label: "Indefinido", value: "indefinite_pronoun" },
      { label: "Relativo", value: "relative_pronoun" },
      { label: "Interrogativo", value: "interrogative_pronoun" },
    ],
  },
  {
    label: "Verbo",
    value: "verb",
    subcategories: [
      { label: "Regular", value: "regular_verb" },
      { label: "Irregular", value: "irregular_verb" },
      { label: "Transitivo", value: "transitive_verb" },
      { label: "Intransitivo", value: "intransitive_verb" },
      { label: "Defectivo", value: "defective_verb" },
      { label: "Abundante", value: "abundant_verb" },
    ],
  },
  {
    label: "Advérbio",
    value: "adverb",
    subcategories: [],
  },
  {
    label: "Preposição",
    value: "preposition",
    subcategories: [],
  },
  {
    label: "Conjunção",
    value: "conjunction",
    subcategories: [],
  },
  {
    label: "Interjeição",
    value: "interjection",
    subcategories: [],
  },
];

export const grammatical_status = [
  { label: "Validada", value: "valid" },
  { label: "Não Validada", value: "invalid" },
  { label: "Pendente", value: "pending" },
];