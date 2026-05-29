import { anthroponymSchema, entrySchema, foreignismSchema, toponymSchema } from "@/schemas";
import {
  ao_provinces,
  gender,
  grammatical_category,
  grammatical_status,
  toponym_classes,
} from "@/constants";
import type { ImportColumn, ImportOption, VonalpImportConfig } from "./types";

const categoryOptions: ImportOption[] = grammatical_category.map((item) => ({
  label: item.label,
  value: item.value,
}));

const subcategoryOptions: ImportOption[] = grammatical_category.flatMap((item) =>
  item.subcategories.map((sub) => ({ label: `${item.label} - ${sub.label}`, value: sub.value }))
);

const provinceOptions: ImportOption[] = ao_provinces.map((item) => ({
  label: item.label,
  value: item.value,
}));

const municipalityOptions: ImportOption[] = ao_provinces.flatMap((province) =>
  province.municipalities.map((municipality) => ({
    label: `${province.label} - ${municipality.label}`,
    value: municipality.value,
  }))
);

const toponymClassOptions: ImportOption[] = toponym_classes.map((item) => ({
  label: item.label,
  value: item.value,
}));

const toponymSubclassOptions: ImportOption[] = toponym_classes.flatMap((item) =>
  item.subclasses.map((sub) => ({ label: `${item.label} - ${sub.label}`, value: sub.value }))
);

function text(key: string, label: string, options?: Partial<ImportColumn>): ImportColumn {
  return {
    key,
    label,
    type: "text",
    aliases: [key, label],
    ...options,
  };
}

function bool(key: string, label: string, options?: Partial<ImportColumn>): ImportColumn {
  return {
    key,
    label,
    type: "boolean",
    aliases: [key, label],
    description: "Aceita Sim, Nao, true, false, 1 ou 0.",
    example: "Sim",
    ...options,
  };
}

function array(key: string, label: string, options?: Partial<ImportColumn>): ImportColumn {
  return {
    key,
    label,
    type: "array",
    aliases: [key, label],
    description: "Separe multiplos valores por ponto e virgula (;).",
    ...options,
  };
}

export const vonalpImportConfigs: Record<string, VonalpImportConfig> = {
  entries: {
    kind: "entries",
    title: "Entradas",
    entityLabel: "entrada",
    endpoint: "/entries",
    queryKey: "entries",
    filenamePrefix: "template-entradas-vonalp",
    primaryField: "entry",
    schema: entrySchema,
    columns: [
      text("entry", "Entrada", { required: true, aliases: ["entry", "Entrada (Palavra/Termo)"], example: "Casa" }),
      text("firstDefinition", "Primeira definição", { required: true, aliases: ["firstDefinition", "Primeira Definição (Principal)", "Primeira definicao"], example: "Lugar de habitação." }),
      text("grammaticalCategory", "Categoria gramatical", { recommended: true, aliases: ["grammaticalCategory", "Categoria Gramatical"], options: categoryOptions }),
      text("languageCode", "Código da língua", { recommended: true, aliases: ["languageCode", "Codigo da Lingua", "Código da Língua", "Codigo da Língua"], example: "pt" }),
      text("pronunciation", "Pronúncia", { recommended: true, aliases: ["pronunciation", "Pronuncia"] }),
      text("syllabicDivision", "Divisão silábica", { recommended: true, aliases: ["syllabicDivision", "Divisao silabica", "Divisão Silábica"] }),
      text("usageExample", "Exemplo de uso", { recommended: true, aliases: ["usageExample", "Exemplo de Uso"] }),
      text("etymology", "Etimologia", { aliases: ["etymology"] }),
      text("secondDefinition", "Segunda definição", { aliases: ["secondDefinition", "Segunda Definição (Opcional)", "Segunda definicao"] }),
      text("thirdDefinition", "Terceira definição", { aliases: ["thirdDefinition", "Terceira Definição (Opcional)", "Terceira definicao"] }),
      text("grammaticalSubcategory", "Subcategoria gramatical", { aliases: ["grammaticalSubcategory", "Subcategoria"], options: subcategoryOptions }),
      text("grammaticalStatus", "Estado gramatical", { aliases: ["grammaticalStatus", "Estado Gramatical"], options: grammatical_status }),
      text("abbreviation", "Abreviatura", { aliases: ["abbreviation"] }),
      text("acronym", "Sigla", { aliases: ["acronym", "Acrónimo"] }),
      text("acronymMeaning", "Significado da sigla", { aliases: ["acronymMeaning", "Significado da Sigla"] }),
      text("reduction", "Redução", { aliases: ["reduction", "Reducao"] }),
      text("reductionMeaning", "Significado da redução", { aliases: ["reductionMeaning", "Sig. da Redução", "Significado da reducao"] }),
      text("shortForm", "Forma curta", { aliases: ["shortForm", "Forma Curta"] }),
      text("fullForm", "Forma longa", { aliases: ["fullForm", "Forma Longa"] }),
      text("audioUrl", "Áudio", { aliases: ["audioUrl", "Audio", "URL do audio", "URL do áudio"] }),
      text("imageUrl", "Imagem", { aliases: ["imageUrl", "URL da imagem"] }),
      text("videoUrl", "URL do vídeo", { aliases: ["videoUrl", "URL do video", "URL do Vídeo"] }),
      bool("isVocabulary", "É VONALP?", { aliases: ["isVocabulary", "E VONALP?", "VONALP"] }),
      bool("isVocabularyEP", "É VONALP-EP?", { aliases: ["isVocabularyEP", "E VONALP-EP?", "VONALP-EP"] }),
      bool("isForeignism", "É estrangeirismo?", { aliases: ["isForeignism", "E estrangeirismo?", "Estrangeirismo"] }),
    ],
    optionGroups: [
      { title: "Categorias gramaticais", options: categoryOptions },
      { title: "Subcategorias gramaticais", options: subcategoryOptions },
      { title: "Estado gramatical", options: grammatical_status },
    ],
  },
  toponyms: {
    kind: "toponyms",
    title: "Toponimos",
    entityLabel: "toponimo",
    endpoint: "/toponyms",
    queryKey: "toponyms",
    filenamePrefix: "template-toponimos-vonalp",
    primaryField: "toponym",
    schema: toponymSchema,
    columns: [
      text("toponym", "Topónimo", { required: true, aliases: ["toponym", "Toponimo", "Topónimo (Nome do Lugar)"], example: "Luanda" }),
      text("province", "Província", { required: true, aliases: ["province", "Provincia"], options: provinceOptions, example: "luanda" }),
      text("municipality", "Município", { recommended: true, aliases: ["municipality", "Municipio"], options: municipalityOptions }),
      array("toponymClasses", "Classe do topónimo", { recommended: true, aliases: ["toponymClasses", "Classe do Topónimo", "Classe do toponimo"], options: toponymClassOptions }),
      array("toponymSubclasses", "Subclasse", { recommended: true, aliases: ["toponymSubclasses"], options: toponymSubclassOptions }),
      text("meaning", "Significado", { recommended: true, aliases: ["meaning"] }),
      text("gentilic", "Gentílico", { recommended: true, aliases: ["gentilic", "Gentilico"] }),
      text("pronunciation", "Pronúncia", { aliases: ["pronunciation", "Pronuncia"] }),
      text("location", "Localização específica", { aliases: ["location", "Localizacao especifica", "Localização Específica"] }),
      text("graphicVariation", "Variação gráfica", { aliases: ["graphicVariation", "Variacao grafica", "Variação Gráfica"] }),
      text("locationImage", "Imagem da localidade", { aliases: ["locationImage", "Imagem da Localidade"] }),
      text("toponymHistory", "História do topónimo", { aliases: ["toponymHistory", "Historia do toponimo", "História do Topónimo"] }),
      text("toponymProvenance", "Proveniência", { aliases: ["toponymProvenance", "Proveniencia"] }),
      text("commonUsage", "Uso comum", { aliases: ["commonUsage", "Uso Comum"] }),
      text("languageCode", "Código da língua", { aliases: ["languageCode", "Codigo da lingua", "Código da Língua"], example: "pt" }),
      bool("isVocabulary", "É VONALP?", { aliases: ["isVocabulary", "E VONALP?", "VONALP"] }),
      bool("isVocabularyEP", "É VONALP-EP?", { aliases: ["isVocabularyEP", "E VONALP-EP?", "VONALP-EP"] }),
      bool("isForeignism", "É estrangeirismo?", { aliases: ["isForeignism", "E estrangeirismo?", "Estrangeirismo"] }),
    ],
    optionGroups: [
      { title: "Províncias", options: provinceOptions },
      { title: "Municípios", options: municipalityOptions },
      { title: "Classes", options: toponymClassOptions },
      { title: "Subclasses", options: toponymSubclassOptions },
    ],
  },
  anthroponyms: {
    kind: "anthroponyms",
    title: "Antroponimos",
    entityLabel: "antroponimo",
    endpoint: "/anthroponyms",
    queryKey: "anthroponyms",
    filenamePrefix: "template-antroponimos-vonalp",
    primaryField: "name",
    schema: anthroponymSchema,
    columns: [
      text("name", "Nome próprio", { required: true, aliases: ["name", "Nome proprio", "Nome Próprio"], example: "Kiluanje" }),
      text("gender", "Género", { recommended: true, aliases: ["gender", "Genero"], options: gender }),
      text("meaning", "Significado do nome", { recommended: true, aliases: ["meaning", "Significado do Nome"] }),
      text("etymology", "Etimologia", { recommended: true, aliases: ["etymology"] }),
      text("surname", "Apelido/Sobrenome", { aliases: ["surname"] }),
      text("surnameMeaning", "Significado do apelido", { aliases: ["surnameMeaning", "Significado do Apelido"] }),
      text("historicalFigure", "Figura histórica associada", { aliases: ["historicalFigure", "Figura historica associada", "Figura Histórica Associada"] }),
      text("historicalFigurePseudonym", "Pseudónimo da figura", { aliases: ["historicalFigurePseudonym", "Pseudonimo da figura", "Pseudónimo da Figura"] }),
      text("historicalFigureDomain", "Domínio de atuação", { aliases: ["historicalFigureDomain", "Dominio de atuacao", "Domínio de Atuação"] }),
      bool("isVocabulary", "É VONALP?", { aliases: ["isVocabulary", "E VONALP?", "VONALP"] }),
      bool("isVocabularyEP", "É VONALP-EP?", { aliases: ["isVocabularyEP", "E VONALP-EP?", "VONALP-EP"] }),
      bool("isForeignism", "É estrangeirismo?", { aliases: ["isForeignism", "E estrangeirismo?", "Estrangeirismo"] }),
    ],
    optionGroups: [{ title: "Géneros", options: gender }],
  },
  foreignisms: {
    kind: "foreignisms",
    title: "Estrangeirismos",
    entityLabel: "estrangeirismo",
    endpoint: "/foreignisms",
    queryKey: "foreignisms",
    filenamePrefix: "template-estrangeirismos-vonalp",
    primaryField: "term",
    schema: foreignismSchema,
    columns: [
      text("term", "Termo estrangeiro", { required: true, aliases: ["term", "Termo Estrangeiro"], example: "software" }),
      text("originalLanguage", "Idioma original", { recommended: true, aliases: ["originalLanguage", "Idioma Original"] }),
      text("originCountry", "País de origem", { recommended: true, aliases: ["originCountry", "Pais de origem", "País de Origem"] }),
      text("field", "Área de conhecimento", { recommended: true, aliases: ["field", "Area de conhecimento", "Área de Conhecimento"] }),
      text("definition", "Definição", { recommended: true, aliases: ["definition", "Definicao"] }),
      text("grammaticalCategory", "Categoria gramatical", { recommended: true, aliases: ["grammaticalCategory", "Categoria Gramatical"], options: categoryOptions }),
      text("pronunciation", "Pronúncia", { aliases: ["pronunciation", "Pronuncia"] }),
      text("adaptedForm", "Forma adaptada", { aliases: ["adaptedForm", "Forma Adaptada"] }),
      text("originalForm", "Forma original", { aliases: ["originalForm", "Forma Original"] }),
      text("meaning", "Significado", { aliases: ["meaning"] }),
      text("usageExample", "Exemplo de uso", { aliases: ["usageExample", "Exemplo de Uso"] }),
      text("context", "Contexto", { aliases: ["context"] }),
      text("abbreviation", "Abreviatura", { aliases: ["abbreviation"] }),
      text("acronym", "Acrónimo", { aliases: ["acronym", "Acronimo"] }),
      text("reduction", "Redução", { aliases: ["reduction", "Reducao"] }),
      text("shortForm", "Forma curta", { aliases: ["shortForm", "Forma Curta"] }),
      text("fullForm", "Forma completa", { aliases: ["fullForm", "Forma Completa"] }),
      bool("isVocabulary", "É VONALP?", { aliases: ["isVocabulary", "E VONALP?", "VONALP"] }),
      bool("isVocabularyEP", "É VONALP-EP?", { aliases: ["isVocabularyEP", "E VONALP-EP?", "VONALP-EP"] }),
    ],
    optionGroups: [{ title: "Categorias gramaticais", options: categoryOptions }],
  },
};
