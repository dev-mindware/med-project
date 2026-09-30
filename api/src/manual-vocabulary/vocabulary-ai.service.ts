import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ManualVocabularyRawItem,
  ManualVocabularySourceModel,
} from './manual-vocabulary.types';
import { AppLogger } from '../common/logger/app-logger.service';

/**
 * System prompt especializado no Acordo Ortográfico de 1945 (AO45).
 * Reconhece 8 tipos de entrada lexical do português europeu e angolano.
 * NÃO usa grafias do AO90 nem brasileirismos.
 */
const SYSTEM_PROMPT = `
És um lexicógrafo especializado em português europeu (Acordo Ortográfico de 1945),
português angolano e línguas nacionais de Angola (Kimbundu, Umbundu, Kikongo, Tchokwe).

NORMA ORTOGRÁFICA OBRIGATÓRIA: Acordo Ortográfico de 1945.
- Usa sempre: acção, óptimo, facto, eléctrico, baptismo, pré-natal, anti-inflamatório
- Nunca uses grafias do AO90 ou brasileiras: ação, ótimo, fato, elétrico, batismo

TAREFA: Extrai e classifica cada unidade lexical num de 5 modelos:
ENTRY | NEOLOGISM | TOPONYM | ANTHROPONYM | FOREIGNISM

Responde APENAS com um array JSON válido. Sem texto adicional, sem markdown.

════════════════════════════════════════
TIPOS DE ENTRADAS (ENTRY) A RECONHECER:
════════════════════════════════════════

1. PALAVRA SIMPLES
   Ex: terra, água, musseque, quitanda, cota, futebol
   wordType: "simples"

2. COMPOSTO HIFENIZADO (justaposição — elementos mantêm autonomia fonética e acentual)
   Ex: couve-flor, guarda-chuva, segunda-feira, decreto-lei, amor-perfeito, sangue-frio
   wordType: "composto-hifenizado"
   → O campo "entry" inclui o hífen exactamente como na fonte

3. COMPOSTO AGLUTINADO (noção de composição perdeu-se)
   Ex: girassol, aguardente, pontapé, paraquedas, vaivém, mandachuva
   wordType: "aglutinado"

4. ESPÉCIE BOTÂNICA (hífen obrigatório mesmo com preposição intercalada)
   Ex: erva-doce, feijão-verde, pé-de-cabra, amor-perfeito, erva-moura
   wordType: "especie-botanica"

5. ESPÉCIE ZOOLÓGICA (hífen obrigatório)
   Ex: bem-te-vi, joão-de-barro, beija-flor, asa-branca, gato-bravo
   wordType: "especie-zoologica"

6. LOCUÇÃO NOMINAL (2–3 palavras, sem hífen, funciona como substantivo)
   Ex: fim de semana, lua de mel, pão de centeio, cavalo de batalha
   wordType: "locucao-nominal"

7. LOCUÇÃO ADVERBIAL (funciona como advérbio, sem hífen)
   Ex: de repente, em breve, sem dúvida, de cor, com efeito
   wordType: "locucao-adverbial"

8. PREFIXADO (hífen antes de vogal idêntica, h ou elemento autónomo)
   Ex: pré-natal, anti-inflamatório, ex-marido, supra-renal, sub-humano
   wordType: "prefixado"

9. BANTUÍSMO / ANGOLANISMO (origem em língua nacional angolana)
   Ex: musseque, bazar, ginguba, cota, quitanda, catana, kilombo, kizomba
   wordType: "bantuismo" ou "angolanismo"
   → Indicar languageCode: "kimbundu", "umbundu", "kikongo", "tchokwe" ou "pt-AO"

═══════════════════════════════════════
REGRAS DE CLASSIFICAÇÃO DOS MODELOS:
═══════════════════════════════════════

ENTRY     → vocábulos do léxico geral (inclui todos os 9 tipos acima)
TOPONYM   → nomes geográficos: cidades, rios, províncias, bairros, países
            Ex: Luanda, Rio Kwanza, Bairro Rangel, Benguela
            Topónimos compostos MANTÊM hífen: Montemor-o-Novo, Luanda-Norte
ANTHROPONYM → nomes próprios de pessoas
FOREIGNISM  → palavras de origem estrangeira:
              Adaptados (grafia portuguesa): futebol, computador, blogue
              Não adaptados (grafia original): software, know-how, marketing
              → campo "integrationLevel": "adaptado" | "nao-adaptado" | "em-transicao"

REGRAS GERAIS:
- NUNCA inventes dados; usa string vazia "" quando não houver informação
- O campo principal (entry/toponym/name/term) deve ser copiado EXACTAMENTE do texto
- Para ENTRY: máximo 3 tokens lexicais separados por espaço (um composto hifenizado = 1 token)
- Não extraias cabeçalhos, números de página, notas de rodapé, abreviaturas isoladas
- Não extraias frases completas como vocábulo
- Polissemia: extrai o vocábulo UMA vez com múltiplas definições (firstDefinition, secondDefinition...)
- toponymClasses e toponymSubclasses são arrays de strings

TEXTOS NARRATIVOS / OBRAS LITERÁRIAS / LIVROS EM GERAL:
- Em romances, contos, ensaios ou manuais gerais (que não sejam dicionários formais), extrai os vocábulos lexicais de relevo, compostos com hífen (ex: couve-flor, segunda-feira), locuções, estrangeirismos (ex: Mr., gentleman, software), antropónimos (nomes de personagens/autores) e topónimos.
- Para vocábulos em prosa, formula a primeira acepção (firstDefinition) contextualmente a partir do sentido no texto.
- Atribui confidence entre 0.70 e 0.95.

CAMPO confidence (obrigatório):
- 0.9–1.0: definição explícita no texto ou vocábulo inequívoco
- 0.7–0.89: contexto claro, classificação segura
- 0.5–0.69: contexto implícito, alguma incerteza
- < 0.5: NÃO INCLUIR no resultado

════════════════════════════════════════
CAMPOS POR MODELO:
════════════════════════════════════════

ENTRY:
  entry*              – vocábulo exacto (com hífen se aplicável)
  wordType*           – um dos 9 tipos acima
  firstDefinition*    – primeira acepção
  secondDefinition    – segunda acepção (se existir)
  thirdDefinition     – terceira acepção (se existir)
  pronunciation       – transcrição fonética entre /barras/
  syllabicDivision    – di-vi-são-si-lá-bi-ca
  etymology           – origem etimológica
  usageExample        – exemplo de uso em frase completa
  grammaticalCategory – substantivo | adjectivo | verbo | advérbio | preposição | locução | interjeição
  grammaticalSubcategory – masculino | feminino | invariável | plural
  grammaticalStatus   – "arcaísmo" | "neologismo" | "coloquial" | "técnico" | "regional" | ""
  languageCode        – "pt-PT" | "pt-AO" | "kimbundu" | "umbundu" | "kikongo" | "tchokwe"
  isVocabulary        – true se pertence ao vocabulário angolano (VONALP), false caso contrário
  isVocabularyEP      – true se pertence exclusivamente ao vocabulário europeu padrão

TOPONYM:
  toponym*            – nome geográfico exacto (com hífen se composto)
  province*           – província angolana ou país estrangeiro
  municipality        – município
  meaning             – significado etimológico do topónimo
  pronunciation       – transcrição fonética
  location            – coordenadas ou descrição de localização
  gentilic            – gentílico (ex: luandense, benguelense)
  toponymHistory      – contexto histórico relevante
  toponymProvenance   – língua de origem do nome topónimo
  commonUsage         – variações de uso oral comum
  graphicVariation    – variantes gráficas históricas ou alternativas
  toponymClasses      – ["cidade" | "rio" | "bairro" | "município" | "província" | "montanha" | "lago"]
  toponymSubclasses   – ["capital" | "histórico" | "colonial" | "pré-colonial"]
  languageCode        – língua de origem do topónimo

ANTHROPONYM:
  name*               – nome próprio
  gender              – "masculino" | "feminino" | "ambos"
  meaning             – significado do nome
  etymology           – origem (língua, raiz)
  surname             – apelido associado (se mencionado)
  surnameMeaning      – significado do apelido
  historicalFigure    – nome da figura histórica associada (se aplicável)
  historicalFigurePseudonym – pseudónimo ou alcunha
  historicalFigureDomain    – área de actuação (política, literatura, desporto...)

FOREIGNISM:
  term*               – vocábulo estrangeiro exacto
  pronunciation       – transcrição fonética
  originalLanguage    – língua original (inglês, francês, árabe, bantu...)
  originCountry       – país de origem
  adaptedForm         – forma adaptada ao português (se existir)
  originalForm        – forma na língua original
  meaning             – significado em português
  definition          – definição alargada
  usageExample        – exemplo de uso em frase completa
  context             – contexto de uso (tecnologia, desporto, culinária, música...)
  field               – área de conhecimento
  grammaticalCategory – categoria gramatical
  integrationLevel    – "adaptado" | "nao-adaptado" | "em-transicao"

NEOLOGISM:
  entry*              – termo neológico exacto (criação lexical recente, neologismo semântico, gíria ou inovação terminológica)
  wordType            – "simples" | "composto-hifenizado" | "aglutinado" | "prefixado" | "angolanismo"
  firstDefinition*    – definição do termo neológico
  secondDefinition    – acepção secundária (se existir)
  usageExample        – exemplo de uso contextualizado
  grammaticalCategory – categoria gramatical
  grammaticalSubcategory – subcategoria gramatical
  languageCode        – língua ou variante ("pt-AO", etc.)

════════════════════════════════════════
EXEMPLOS (few-shot):
════════════════════════════════════════

Texto: "couve-flor s.f. Planta da família das crucíferas (Brassica oleracea var. botrytis), cultivada pela sua inflorescência compacta e esbranquiçada."
→ { "sourceModel": "ENTRY", "confidence": 0.98, "data": {
    "entry": "couve-flor", "wordType": "especie-botanica",
    "firstDefinition": "Planta da família das crucíferas (Brassica oleracea var. botrytis), cultivada pela sua inflorescência compacta e esbranquiçada.",
    "grammaticalCategory": "substantivo", "grammaticalSubcategory": "feminino",
    "isVocabulary": false, "isVocabularyEP": true, "languageCode": "pt-PT" } }

Texto: "musseque s.m. Bairro periférico de construção precária, característico das cidades angolanas; designação de origem kimbundu que significa 'areia'."
→ { "sourceModel": "ENTRY", "confidence": 0.97, "data": {
    "entry": "musseque", "wordType": "bantuismo",
    "firstDefinition": "Bairro periférico de construção precária, característico das cidades angolanas.",
    "etymology": "Do Kimbundu, significa areia.",
    "grammaticalCategory": "substantivo", "grammaticalSubcategory": "masculino",
    "languageCode": "kimbundu", "isVocabulary": true, "isVocabularyEP": false } }

Texto: "bem-te-vi s.m. Ave passeriforme da família Tyrannidae, conhecida pelo seu canto característico que imita as sílabas do seu nome."
→ { "sourceModel": "ENTRY", "confidence": 0.96, "data": {
    "entry": "bem-te-vi", "wordType": "especie-zoologica",
    "firstDefinition": "Ave passeriforme da família Tyrannidae, conhecida pelo seu canto característico.",
    "grammaticalCategory": "substantivo", "grammaticalSubcategory": "masculino",
    "isVocabulary": false, "isVocabularyEP": true, "languageCode": "pt-PT" } }

Texto: "de repente loc.adv. De modo súbito e inesperado; subitamente; de improviso."
→ { "sourceModel": "ENTRY", "confidence": 0.99, "data": {
    "entry": "de repente", "wordType": "locucao-adverbial",
    "firstDefinition": "De modo súbito e inesperado; subitamente; de improviso.",
    "grammaticalCategory": "locução adverbial",
    "isVocabulary": false, "isVocabularyEP": true, "languageCode": "pt-PT" } }

Texto: "pré-natal adj. Relativo ao período anterior ao nascimento; que ocorre antes do parto."
→ { "sourceModel": "ENTRY", "confidence": 0.98, "data": {
    "entry": "pré-natal", "wordType": "prefixado",
    "firstDefinition": "Relativo ao período anterior ao nascimento; que ocorre antes do parto.",
    "grammaticalCategory": "adjectivo",
    "isVocabulary": false, "isVocabularyEP": true, "languageCode": "pt-PT" } }

NÃO EXTRAIR (exemplos negativos):
- "Ver também pág. 23" → metadado de paginação
- "Os substantivos compostos são..." → metalinguagem
- "segunda-feira de manhã muito cedo" → frase completa, não vocábulo
- "CAPÍTULO III" → cabeçalho de secção
- "s.f." → abreviatura isolada sem contexto
- "1." ou "a)" → numeração ou marcador de lista
`.trim();

/** Limiar mínimo de confiança; items abaixo são descartados silenciosamente */
const CONFIDENCE_THRESHOLD = 0.5;

/** Máximo de tentativas por chunk antes de o ignorar */
const MAX_CHUNK_ATTEMPTS = 3;

@Injectable()
export class VocabularyAiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async extractVocabulary(
    text: string,
    selectedModules?: ManualVocabularySourceModel[],
  ): Promise<ManualVocabularyRawItem[]> {
    const { client, model } = this.buildClient();
    const chunks = this.splitIntoChunks(text);
    const allItems: ManualVocabularyRawItem[] = [];

    this.logger.info('Iniciando extracção de vocabulário', {
      context: 'VocabularyAiService',
      action: 'EXTRACT_START',
      meta: {
        model,
        totalChunks: chunks.length,
        totalChars: text.length,
        selectedModules: selectedModules || 'ALL',
      },
    });

    let totalChunkErrors = 0;
    let lastChunkError: Error | null = null;

    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        // Pausa breve de 500ms entre blocos para respeitar os limites de taxa (RPM) da Google API
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      try {
        const items = await this.extractChunk(
          client,
          model,
          chunks[i],
          i + 1,
          chunks.length,
          1,
          selectedModules,
        );
        allItems.push(...items);
      } catch (err: any) {
        totalChunkErrors++;
        lastChunkError = err;
      }
    }

    if (chunks.length > 0 && allItems.length === 0 && totalChunkErrors === chunks.length) {
      throw new BadGatewayException(
        `Falha na extracção da IA: ${lastChunkError?.message || 'todos os blocos falharam ou o limite da API foi atingido'}.`,
      );
    }

    this.logger.info('Extracção de vocabulário concluída', {
      context: 'VocabularyAiService',
      action: 'EXTRACT_DONE',
      meta: { totalExtracted: allItems.length },
    });

    return allItems;
  }

  /**
   * Retorna o nome do modelo de IA configurado para a extracção.
   */
  getModelName(): string {
    return (
      this.configService.get<string>('GEMINI_MODEL') ||
      this.configService.get<string>('AI_MODEL') ||
      this.configService.get<string>('ai.geminiModel') ||
      this.configService.get<string>('OPENAI_MODEL') ||
      'gemini-2.5-flash'
    );
  }

  // ─── Construção do cliente IA ─────────────────────────────────────────────

  private buildClient(): { client: OpenAI; model: string } {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('ai.geminiApiKey') ||
      this.configService.get<string>('OPENAI_API_KEY') ||
      this.configService.get<string>('ai.openaiApiKey');

    if (!apiKey) {
      throw new BadGatewayException(
        'Chave de API de IA (GEMINI_API_KEY / OPENAI_API_KEY) nao configurada',
      );
    }

    const model =
      this.configService.get<string>('GEMINI_MODEL') ||
      this.configService.get<string>('AI_MODEL') ||
      this.configService.get<string>('ai.geminiModel') ||
      this.configService.get<string>('OPENAI_MODEL') ||
      'gemini-2.5-flash';

    const isGemini =
      model.toLowerCase().includes('gemini') ||
      Boolean(this.configService.get<string>('GEMINI_API_KEY'));

    const baseURL =
      this.configService.get<string>('AI_BASE_URL') ||
      this.configService.get<string>('OPENAI_BASE_URL') ||
      (isGemini
        ? 'https://generativelanguage.googleapis.com/v1beta/openai/'
        : undefined);

    return { client: new OpenAI({ apiKey, baseURL }), model };
  }

  // ─── Chunking por parágrafos com sobreposição ─────────────────────────────

  /**
   * Divide o texto em chunks respeitando limites de parágrafo.
   * Aplica sobreposição de 15% (~2 parágrafos) para preservar contexto
   * em fronteiras de chunk e evitar quebrar entradas lexicográficas a meio.
   */
  private splitIntoChunks(text: string): string[] {
    const chunkWords = Number(
      this.configService.get<string>('VOCABULARY_CHUNK_WORDS') || 2200,
    );

    // Dividir por parágrafos (separador natural em manuais de dicionário)
    const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

    if (paragraphs.length === 0) return [text.trim() || ''];

    const chunks: string[] = [];
    const current: string[] = [];
    let currentWords = 0;
    const overlapBuffer: string[] = []; // Últimos 2 parágrafos para sobreposição

    for (const paragraph of paragraphs) {
      const wordCount = paragraph.split(/\s+/).filter(Boolean).length;

      // Quando o chunk está cheio, fecha-o e inicia o próximo com sobreposição
      if (currentWords + wordCount > chunkWords && current.length > 0) {
        chunks.push(current.join('\n\n'));
        // Iniciar próximo chunk com os últimos parágrafos (15% de sobreposição)
        current.length = 0;
        current.push(...overlapBuffer);
        currentWords = overlapBuffer.reduce(
          (sum, p) => sum + p.split(/\s+/).filter(Boolean).length,
          0,
        );
      }

      current.push(paragraph);
      currentWords += wordCount;

      // Manter buffer de sobreposição com os 2 parágrafos mais recentes
      overlapBuffer.push(paragraph);
      if (overlapBuffer.length > 2) overlapBuffer.shift();
    }

    if (current.length > 0) chunks.push(current.join('\n\n'));

    return chunks.length > 0 ? chunks : [''];
  }

  // ─── Extracção por chunk com retry e backoff ──────────────────────────────

  /**
   * Extrai vocabulário de um único chunk com até MAX_CHUNK_ATTEMPTS tentativas.
   * Em caso de falha final, regista aviso e retorna array vazio (graceful degradation).
   */
  private async extractChunk(
    client: OpenAI,
    model: string,
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    attempt = 1,
    selectedModules?: ManualVocabularySourceModel[],
  ): Promise<ManualVocabularyRawItem[]> {
    try {
      const moduleInstruction =
        selectedModules && selectedModules.length > 0
          ? `\n\nATENÇÃO — FILTRO DE MÓDULOS ACTIVADO: Extrai EXCLUSIVAMENTE vocábulos que pertençam aos seguintes modelos: ${selectedModules.join(', ')}. Não incluas outros modelos no array de resposta JSON.`
          : '';

      const response = await client.chat.completions.create({
        model,
        temperature: 0.1, // baixo para consistência na classificação
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + moduleInstruction },
          { role: 'user', content: chunk },
        ],
      });

      const content = response.choices[0]?.message?.content || '[]';
      let items = this.parseItems(content);

      if (selectedModules && selectedModules.length > 0) {
        items = items.filter((item) => selectedModules.includes(item.sourceModel));
      }

      this.logger.info(`Chunk ${chunkIndex}/${totalChunks} processado`, {
        context: 'VocabularyAiService',
        action: 'CHUNK_DONE',
        meta: { chunkIndex, totalChunks, extractedItems: items.length, attempt },
      });

      return items;
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        String(error?.message || '').includes('429') ||
        String(error?.message || '').includes('RESOURCE_EXHAUSTED');

      if (attempt < MAX_CHUNK_ATTEMPTS) {
        const delayMs = isRateLimit ? attempt * 3000 : Math.pow(2, attempt) * 1000;
        this.logger.warn(
          `Chunk ${chunkIndex}/${totalChunks} falhou (tentativa ${attempt}): ${error?.message}, a aguardar ${delayMs}ms`,
          {
            context: 'VocabularyAiService',
            action: 'CHUNK_RETRY',
            meta: { chunkIndex, attempt, delayMs, isRateLimit },
          },
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        // Se o rate limit persistir, tenta fallback transparente para flash-lite
        const retryModel =
          isRateLimit && attempt >= 2 ? 'gemini-3.5-flash-lite' : model;

        return this.extractChunk(
          client,
          retryModel,
          chunk,
          chunkIndex,
          totalChunks,
          attempt + 1,
          selectedModules,
        );
      }

      // Esgotadas as tentativas: regista e lança o erro para o controlador saber
      this.logger.error(
        `Chunk ${chunkIndex}/${totalChunks} descartado após ${MAX_CHUNK_ATTEMPTS} tentativas: ${error?.message}`,
        {
          context: 'VocabularyAiService',
          action: 'CHUNK_EXHAUSTED',
          error,
          meta: { chunkIndex, chunkLength: chunk.length, model },
        },
      );
      throw error;
    }
  }

  // ─── Parsing defensivo do JSON da IA ─────────────────────────────────────

  /**
   * Converte a resposta da IA em items tipados.
   * Tratamento defensivo: JSON inválido retorna [] sem lançar excepção.
   * Filtra items com confiança abaixo do limiar e modelos inválidos.
   */
  private parseItems(content: string): ManualVocabularyRawItem[] {
    const raw = content.trim();
    if (!raw) return [];

    // Extrai o array JSON do conteúdo:
    // 1. Se começa com '[' → usa directamente
    // 2. Senão, procura o primeiro bloco [...] no texto (ex: resposta com markdown)
    let json: string;
    if (raw.startsWith('[')) {
      json = raw;
    } else {
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) {
        // Conteúdo com texto mas sem estrutura de array — resposta inesperada da IA
        this.logger.warn('IA devolveu resposta sem estrutura JSON válida; chunk ignorado', {
          context: 'VocabularyAiService',
          action: 'PARSE_JSON_FAILED',
          meta: { preview: raw.slice(0, 300) },
        });
        return [];
      }
      json = match[0];
    }

    let parsed: unknown[];
    try {
      parsed = JSON.parse(json) as unknown[];
    } catch {
      this.logger.warn('IA devolveu JSON inválido; chunk ignorado', {
        context: 'VocabularyAiService',
        action: 'PARSE_JSON_FAILED',
        meta: { preview: raw.slice(0, 300) },
      });
      return [];
    }

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ManualVocabularyRawItem =>
        item !== null &&
        typeof item === 'object' &&
        ['ENTRY', 'NEOLOGISM', 'TOPONYM', 'ANTHROPONYM', 'FOREIGNISM'].includes(
          (item as ManualVocabularyRawItem).sourceModel,
        ) &&
        typeof (item as ManualVocabularyRawItem).data === 'object' &&
        (item as ManualVocabularyRawItem).data !== null &&
        // Descartar items abaixo do limiar de confiança
        (Number((item as ManualVocabularyRawItem).confidence) >= CONFIDENCE_THRESHOLD),
    );
  }
}
