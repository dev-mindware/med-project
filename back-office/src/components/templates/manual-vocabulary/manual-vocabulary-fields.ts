import type { ManualVocabularyModule } from "@/types";

export type FieldKind = "text" | "textarea" | "boolean" | "list" | "number" | "select";

export type FieldDef = {
  key: string;
  label: string;
  kind?: FieldKind;
  /** Linha inteira no formulário */
  wide?: boolean;
  required?: boolean;
  options?: string[];
  /** Ajuda mostrada sob o campo quando não é óbvio o que deve entrar */
  hint?: string;
};

const WORD_TYPES = [
  "simples",
  "composto-hifenizado",
  "aglutinado",
  "especie-botanica",
  "especie-zoologica",
  "locucao-nominal",
  "locucao-adverbial",
  "prefixado",
  "bantuismo",
  "angolanismo",
];

const FLAGS: FieldDef[] = [
  { key: "isVocabulary", label: "VONALP", kind: "boolean", hint: "Pertence ao vocabulário nacional angolano." },
  { key: "isVocabularyEP", label: "VONALP-EP", kind: "boolean", hint: "Pertence ao vocabulário do português europeu padrão." },
];

const LANGUAGE_CODE: FieldDef = {
  key: "languageCode",
  label: "Código de língua",
  hint: "Contém sempre pt-AO. Se tiver origem numa língua nacional, acrescente-a: pt-AO; kimbundu.",
};

const FREQUENCY: FieldDef = {
  key: "frequency",
  label: "Frequência",
  kind: "number",
  hint: "Nº de vezes que o vocábulo apareceu nas varreduras. É somada à do registo existente ao gravar.",
};

const ENTRY_FIELDS: FieldDef[] = [
  { key: "entry", label: "Vocábulo", required: true, wide: true },
  { key: "wordType", label: "Tipo de palavra", kind: "select", options: WORD_TYPES, required: true },
  { key: "grammaticalCategory", label: "Categoria gramatical" },
  { key: "grammaticalSubcategory", label: "Subcategoria gramatical" },
  { key: "grammaticalStatus", label: "Estado gramatical", hint: "arcaísmo, neologismo, coloquial, técnico, regional…" },
  { key: "firstDefinition", label: "Primeira definição", kind: "textarea", wide: true, required: true },
  { key: "secondDefinition", label: "Segunda definição", kind: "textarea", wide: true },
  { key: "thirdDefinition", label: "Terceira definição", kind: "textarea", wide: true },
  { key: "usageExample", label: "Exemplo de uso", kind: "textarea", wide: true },
  { key: "pronunciation", label: "Pronúncia", hint: "Transcrição fonética entre /barras/. Confirme: a IA infere-a." },
  { key: "syllabicDivision", label: "Divisão silábica", hint: "Ex: ca-SA, com a sílaba tónica em maiúsculas." },
  { key: "etymology", label: "Etimologia", kind: "textarea", wide: true, hint: "A IA infere-a; confirme antes de gravar." },
  LANGUAGE_CODE,
  ...FLAGS,
  { key: "isForeignism", label: "Estrangeirismo", kind: "boolean" },
  FREQUENCY,
];

export const MODULE_FIELDS: Record<ManualVocabularyModule, FieldDef[]> = {
  ENTRY: ENTRY_FIELDS,
  NEOLOGISM: ENTRY_FIELDS,
  TOPONYM: [
    { key: "toponym", label: "Vocábulo", required: true, wide: true },
    { key: "province", label: "Província", required: true, hint: "Província angolana ou país estrangeiro." },
    { key: "municipality", label: "Município" },
    { key: "meaning", label: "Significado", kind: "textarea", wide: true },
    { key: "pronunciation", label: "Pronúncia" },
    { key: "gentilic", label: "Gentílico", hint: "Ex: luandense, benguelense." },
    { key: "location", label: "Localização", wide: true },
    { key: "toponymHistory", label: "História", kind: "textarea", wide: true },
    { key: "toponymProvenance", label: "Proveniência", hint: "Língua de origem do nome." },
    { key: "commonUsage", label: "Uso comum" },
    { key: "graphicVariation", label: "Variação gráfica" },
    { key: "toponymClasses", label: "Classes", kind: "list", hint: "Separe por ponto e vírgula: cidade; rio." },
    { key: "toponymSubclasses", label: "Subclasses", kind: "list", hint: "Separe por ponto e vírgula: capital; histórico." },
    LANGUAGE_CODE,
    ...FLAGS,
    { key: "isForeignism", label: "Estrangeirismo", kind: "boolean" },
    FREQUENCY,
  ],
  ANTHROPONYM: [
    { key: "name", label: "Vocábulo", required: true, wide: true },
    { key: "gender", label: "Género", kind: "select", options: ["", "masculino", "feminino", "ambos"] },
    { key: "meaning", label: "Significado do nome", kind: "textarea", wide: true },
    { key: "etymology", label: "Etimologia", kind: "textarea", wide: true },
    { key: "surname", label: "Apelido" },
    { key: "surnameMeaning", label: "Significado do apelido", kind: "textarea", wide: true },
    { key: "historicalFigure", label: "Figura histórica", hint: "Só se o texto a identificar claramente." },
    { key: "historicalFigurePseudonym", label: "Pseudónimo" },
    { key: "historicalFigureDomain", label: "Domínio de actuação", hint: "Política, literatura, desporto…" },
    ...FLAGS,
    { key: "isForeignism", label: "Estrangeirismo", kind: "boolean" },
    FREQUENCY,
  ],
  FOREIGNISM: [
    { key: "term", label: "Vocábulo", required: true, wide: true },
    { key: "integrationLevel", label: "Nível de integração", kind: "select", options: ["adaptado", "em-transicao", "nao-adaptado"] },
    { key: "originalLanguage", label: "Idioma original" },
    { key: "originCountry", label: "País de origem" },
    { key: "originalForm", label: "Forma original" },
    { key: "adaptedForm", label: "Forma adaptada" },
    { key: "meaning", label: "Significado", kind: "textarea", wide: true },
    { key: "definition", label: "Definição", kind: "textarea", wide: true },
    { key: "usageExample", label: "Exemplo de uso", kind: "textarea", wide: true },
    { key: "pronunciation", label: "Pronúncia" },
    { key: "grammaticalCategory", label: "Categoria gramatical" },
    { key: "context", label: "Contexto", hint: "Tecnologia, desporto, culinária… ou abreviatura/sigla/marca." },
    { key: "field", label: "Área de conhecimento" },
    ...FLAGS,
    FREQUENCY,
  ],
  NATIONAL_LANGUAGE: [
    { key: "term", label: "Vocábulo", required: true, wide: true },
    {
      key: "language",
      label: "Língua nacional",
      kind: "select",
      required: true,
      options: ["Kimbundu", "Umbundu", "Kikongo", "Tchokwe", "Nganguela", "Kwanyama"],
    },
    { key: "grammaticalCategory", label: "Categoria gramatical" },
    { key: "grammaticalSubcategory", label: "Subcategoria gramatical" },
    {
      key: "definition",
      label: "Definição",
      kind: "textarea",
      wide: true,
      required: true,
      hint: "Se o significado não foi confirmado na web, confirme-o numa fonte fiável antes de gravar.",
    },
    { key: "usageExample", label: "Exemplo de uso", kind: "textarea", wide: true },
    { key: "notes", label: "Notas", kind: "textarea", wide: true },
    { key: "verified", label: "Verificado na web", kind: "boolean" },
    FREQUENCY,
  ],
};

/** Garante que o código de língua contém sempre pt-AO (espelha a regra do servidor). */
export function ensurePtAO(value: unknown): string {
  const rest = String(value ?? "")
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter((s) => s && !/^pt(-pt|-ao|-br)?$/i.test(s));
  return ["pt-AO", ...rest].join("; ");
}
