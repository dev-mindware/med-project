# Planeamento — Módulo Inteligente de Vocabulário (NestJS)

> **Stack:** NestJS · Mistral OCR (leitura PDF) · OpenAI GPT-4o / GPT-4.1 (análise IA) · ExcelJS (exportação)  
> **Objetivo:** Processar manuais em PDF, extrair vocábulos de 1, 2 e 3 palavras e exportar para Excel pronto para importação na base de dados.

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        ManualsModule                            │
│  POST /manuals/upload  →  FileInterceptor (Multer)             │
└───────────────────────────────┬─────────────────────────────────┘
                                │ buffer PDF
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PdfService                              │
│  Mistral OCR API  →  extração por página  →  texto limpo MD    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ texto estruturado
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VocabularyAiService                         │
│  OpenAI API (GPT-4.1)  →  chunks 3k tokens  →  JSON array      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ VocabularyEntry[]
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 VocabularyProcessorService                      │
│  normalização → deduplicação → classificação → validação        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ VocabularyEntry[] limpo
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ExcelExportService                          │
│  ExcelJS  →  headers mapeados  →  stream download .xlsx         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Ficheiros

```
src/
├── manuals/
│   ├── manuals.module.ts
│   ├── manuals.controller.ts
│   └── pdf.service.ts
│
├── vocabulary/
│   ├── vocabulary.module.ts
│   ├── vocabulary.controller.ts
│   ├── vocabulary-ai.service.ts
│   ├── vocabulary-processor.service.ts
│   ├── vocabulary.types.ts
│   └── constants/
│       └── grammatical-category.const.ts
│
├── export/
│   ├── export.module.ts
│   ├── export.controller.ts
│   └── excel-export.service.ts
│
└── common/
    ├── interfaces/vocabulary-entry.interface.ts
    └── utils/text-chunker.util.ts
```

---

## 3. Types e Interfaces

### `vocabulary.types.ts`

```typescript
export interface VocabularyEntry {
  term: string;
  pronunciation: string;
  grammaticalCategory: GrammaticalCategoryValue;
  grammaticalSubcategory: string;
  syllabicDivision: string;
  etymology: string;
  firstDefinition: string;
  secondDefinition: string;
}

export type GrammaticalCategoryValue =
  | 'noun' | 'adjective' | 'article' | 'numeral'
  | 'pronoun' | 'verb' | 'adverb' | 'preposition'
  | 'conjunction' | 'interjection';

export interface ProcessingResult {
  totalTermsFound: number;
  uniqueTerms: number;
  duplicatesRemoved: number;
  incompleteEntries: number;
  entries: VocabularyEntry[];
}
```

### `grammatical-category.const.ts`

```typescript
export const GRAMMATICAL_CATEGORIES = [
  {
    label: 'Substantivo', value: 'noun',
    subcategories: [
      { label: 'Comum', value: 'common_noun' },
      { label: 'Próprio', value: 'proper_noun' },
      { label: 'Concreto', value: 'concrete_noun' },
      { label: 'Abstrato', value: 'abstract_noun' },
      { label: 'Coletivo', value: 'collective_noun' },
    ],
  },
  {
    label: 'Adjetivo', value: 'adjective',
    subcategories: [
      { label: 'Qualificativo', value: 'qualifying_adjective' },
      { label: 'Explicativo', value: 'explanatory_adjective' },
      { label: 'Restritivo', value: 'restrictive_adjective' },
    ],
  },
  { label: 'Artigo', value: 'article', subcategories: [] },
  {
    label: 'Numeral', value: 'numeral',
    subcategories: [
      { label: 'Cardinal', value: 'cardinal_numeral' },
      { label: 'Ordinal', value: 'ordinal_numeral' },
      { label: 'Multiplicativo', value: 'multiplicative_numeral' },
      { label: 'Fracionário', value: 'fractional_numeral' },
    ],
  },
  {
    label: 'Pronome', value: 'pronoun',
    subcategories: [
      { label: 'Pessoal', value: 'personal_pronoun' },
      { label: 'Possessivo', value: 'possessive_pronoun' },
      { label: 'Demonstrativo', value: 'demonstrative_pronoun' },
      { label: 'Indefinido', value: 'indefinite_pronoun' },
      { label: 'Relativo', value: 'relative_pronoun' },
      { label: 'Interrogativo', value: 'interrogative_pronoun' },
    ],
  },
  {
    label: 'Verbo', value: 'verb',
    subcategories: [
      { label: 'Regular', value: 'regular_verb' },
      { label: 'Irregular', value: 'irregular_verb' },
      { label: 'Transitivo', value: 'transitive_verb' },
      { label: 'Intransitivo', value: 'intransitive_verb' },
      { label: 'Defectivo', value: 'defective_verb' },
      { label: 'Abundante', value: 'abundant_verb' },
    ],
  },
  { label: 'Advérbio', value: 'adverb', subcategories: [] },
  { label: 'Preposição', value: 'preposition', subcategories: [] },
  { label: 'Conjunção', value: 'conjunction', subcategories: [] },
  { label: 'Interjeição', value: 'interjection', subcategories: [] },
] as const;

// Helpers para validação
export const VALID_CATEGORIES = GRAMMATICAL_CATEGORIES.map(c => c.value);
export const VALID_SUBCATEGORIES = GRAMMATICAL_CATEGORIES
  .flatMap(c => c.subcategories.map(s => s.value));
```

---

## 4. Módulo 1 — Upload de PDF (`ManualsModule`)

### `manuals.controller.ts`

```typescript
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VocabularyAiService } from '../vocabulary/vocabulary-ai.service';
import { VocabularyProcessorService } from '../vocabulary/vocabulary-processor.service';
import { ExcelExportService } from '../export/excel-export.service';

@Controller('manuals')
export class ManualsController {
  constructor(
    private readonly vocabularyAiService: VocabularyAiService,
    private readonly processorService: VocabularyProcessorService,
    private readonly excelService: ExcelExportService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (_, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Apenas ficheiros PDF são aceites'), false);
      }
      cb(null, true);
    },
  }))
  async uploadManual(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Ficheiro não encontrado');

    // 1. Extrair texto via Mistral OCR
    const rawText = await this.vocabularyAiService.extractTextFromPdf(file.buffer);

    // 2. Analisar vocabulário com OpenAI
    const rawEntries = await this.vocabularyAiService.extractVocabulary(rawText);

    // 3. Limpar e classificar
    const result = await this.processorService.process(rawEntries);

    // 4. Gerar Excel
    const excelBuffer = await this.excelService.generate(result.entries);

    return {
      stats: {
        totalFound: result.totalTermsFound,
        unique: result.uniqueTerms,
        duplicatesRemoved: result.duplicatesRemoved,
        incomplete: result.incompleteEntries,
      },
      downloadReady: true,
      excelBase64: excelBuffer.toString('base64'),
    };
  }
}
```

---

## 5. Módulo 2 — Leitura de PDF com Mistral OCR (`PdfService`)

### `pdf.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import Mistral from '@mistralai/mistralai';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  async extractText(buffer: Buffer): Promise<string> {
    this.logger.log('Iniciando extração de texto via Mistral OCR...');

    const base64Pdf = buffer.toString('base64');

    const response = await this.client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: `data:application/pdf;base64,${base64Pdf}`,
      },
      includeImageBase64: false,
    });

    // Concatenar markdown de todas as páginas
    const fullText = response.pages
      .map(page => page.markdown)
      .join('\n\n---PAGE_BREAK---\n\n');

    this.logger.log(`Extração concluída: ${response.pages.length} páginas processadas`);
    return this.cleanText(fullText);
  }

  private cleanText(text: string): string {
    return text
      .replace(/---PAGE_BREAK---/g, ' ')  // remover marcadores de página
      .replace(/#{1,6}\s/g, '')            // remover headers markdown
      .replace(/\*\*|__|\*|_/g, '')        // remover bold/italic
      .replace(/\[.*?\]\(.*?\)/g, '')      // remover links
      .replace(/\s{3,}/g, '  ')            // normalizar espaços excessivos
      .trim();
  }
}
```

---

## 6. Módulo 3 — Análise IA com OpenAI (`VocabularyAiService`)

### `vocabulary-ai.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { VocabularyEntry } from './vocabulary.types';
import { VALID_CATEGORIES } from './constants/grammatical-category.const';
import { PdfService } from '../manuals/pdf.service';

const CHUNK_SIZE = 3000; // tokens aproximados por chunk
const SYSTEM_PROMPT = `
És um linguista especializado em português europeu e angolano.
Analisa o texto fornecido e extrai todos os vocábulos relevantes de 1, 2 e 3 palavras.
Inclui nomes próprios compostos como "Angola Avante" ou "Dia a dia".
Exclui artigos soltos, preposições isoladas e números simples.

Para cada vocábulo, devolve um array JSON com os seguintes campos:
- term: o vocábulo exato
- pronunciation: transcrição fonética simplificada
- grammaticalCategory: um dos valores: ${VALID_CATEGORIES.join(', ')}
- grammaticalSubcategory: subcategoria correspondente
- syllabicDivision: divisão silábica com hífens (ex: an-go-la)
- etymology: origem da palavra (latim, árabe, kimbundu, etc.)
- firstDefinition: definição principal clara e concisa
- secondDefinition: definição alternativa ou uso secundário (pode ser vazio)

RESPONDE APENAS com o array JSON. Sem texto adicional, sem \`\`\`json.
`;

@Injectable()
export class VocabularyAiService {
  private readonly logger = new Logger(VocabularyAiService.name);
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private readonly pdfService: PdfService) {}

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    return this.pdfService.extractText(buffer);
  }

  async extractVocabulary(text: string): Promise<VocabularyEntry[]> {
    const chunks = this.splitIntoChunks(text, CHUNK_SIZE);
    this.logger.log(`Processando ${chunks.length} chunks com OpenAI...`);

    const results: VocabularyEntry[] = [];

    for (let i = 0; i < chunks.length; i++) {
      this.logger.log(`Chunk ${i + 1}/${chunks.length}`);
      try {
        const entries = await this.processChunk(chunks[i]);
        results.push(...entries);
      } catch (err) {
        this.logger.error(`Erro no chunk ${i + 1}: ${err.message}`);
      }
    }

    return results;
  }

  private async processChunk(text: string): Promise<VocabularyEntry[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Texto para análise:\n\n${text}` },
      ],
    });

    const raw = response.choices[0].message.content?.trim() ?? '[]';

    try {
      return JSON.parse(raw) as VocabularyEntry[];
    } catch {
      this.logger.warn('Resposta IA inválida, tentando extrair JSON...');
      const match = raw.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    }
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    // ~1.33 words por token (português)
    const wordsPerChunk = Math.floor(chunkSize * 0.75);

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }
    return chunks;
  }
}
```

---

## 7. Módulo 4 — Limpeza e Classificação (`VocabularyProcessorService`)

### `vocabulary-processor.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { VocabularyEntry, ProcessingResult } from './vocabulary.types';
import {
  VALID_CATEGORIES,
  VALID_SUBCATEGORIES,
  GRAMMATICAL_CATEGORIES
} from './constants/grammatical-category.const';

@Injectable()
export class VocabularyProcessorService {
  private readonly logger = new Logger(VocabularyProcessorService.name);

  process(rawEntries: VocabularyEntry[]): ProcessingResult {
    const totalFound = rawEntries.length;
    this.logger.log(`Processando ${totalFound} entradas brutas...`);

    // 1. Normalizar
    const normalized = rawEntries.map(e => this.normalize(e));

    // 2. Filtrar por número de palavras (1, 2 ou 3)
    const filtered = normalized.filter(e => this.isValidWordCount(e.term));

    // 3. Remover duplicados (case-insensitive)
    const seen = new Set<string>();
    const deduplicated = filtered.filter(e => {
      const key = e.term.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. Validar categorias gramaticais
    const validated = deduplicated.map(e => this.validateCategory(e));

    // 5. Ordenar alfabeticamente
    const sorted = validated.sort((a, b) =>
      a.term.localeCompare(b.term, 'pt', { sensitivity: 'base' })
    );

    // 6. Identificar entradas incompletas
    const incompleteEntries = sorted.filter(e =>
      !e.firstDefinition || !e.grammaticalCategory
    ).length;

    this.logger.log(
      `Resultado: ${sorted.length} únicos | ` +
      `${totalFound - sorted.length} duplicados removidos | ` +
      `${incompleteEntries} incompletos`
    );

    return {
      totalTermsFound: totalFound,
      uniqueTerms: sorted.length,
      duplicatesRemoved: totalFound - sorted.length,
      incompleteEntries,
      entries: sorted,
    };
  }

  private normalize(entry: VocabularyEntry): VocabularyEntry {
    return {
      ...entry,
      term: entry.term?.trim() ?? '',
      pronunciation: entry.pronunciation?.trim() ?? '',
      grammaticalCategory: entry.grammaticalCategory?.toLowerCase().trim() as any ?? '',
      grammaticalSubcategory: entry.grammaticalSubcategory?.toLowerCase().trim() ?? '',
      syllabicDivision: entry.syllabicDivision?.trim() ?? '',
      etymology: entry.etymology?.trim() ?? '',
      firstDefinition: entry.firstDefinition?.trim() ?? '',
      secondDefinition: entry.secondDefinition?.trim() ?? '',
    };
  }

  private isValidWordCount(term: string): boolean {
    const wordCount = term.trim().split(/\s+/).length;
    return wordCount >= 1 && wordCount <= 3;
  }

  private validateCategory(entry: VocabularyEntry): VocabularyEntry {
    const validCat = VALID_CATEGORIES.includes(entry.grammaticalCategory as any);
    const validSub = !entry.grammaticalSubcategory ||
      VALID_SUBCATEGORIES.includes(entry.grammaticalSubcategory as any);

    return {
      ...entry,
      grammaticalCategory: validCat ? entry.grammaticalCategory : '' as any,
      grammaticalSubcategory: validSub ? entry.grammaticalSubcategory : '',
    };
  }
}
```

---

## 8. Módulo 5 — Exportação Excel (`ExcelExportService`)

### `excel-export.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { VocabularyEntry } from '../vocabulary/vocabulary.types';
import { GRAMMATICAL_CATEGORIES } from '../vocabulary/constants/grammatical-category.const';

const COLUMNS = [
  { header: 'term',                  key: 'term',                  width: 25 },
  { header: 'pronunciation',         key: 'pronunciation',         width: 20 },
  { header: 'grammaticalCategory',   key: 'grammaticalCategory',   width: 22 },
  { header: 'grammaticalSubcategory',key: 'grammaticalSubcategory',width: 28 },
  { header: 'syllabicDivision',      key: 'syllabicDivision',      width: 20 },
  { header: 'etymology',             key: 'etymology',             width: 25 },
  { header: 'firstDefinition',       key: 'firstDefinition',       width: 50 },
  { header: 'secondDefinition',      key: 'secondDefinition',      width: 50 },
];

@Injectable()
export class ExcelExportService {
  async generate(entries: VocabularyEntry[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Módulo Vocabulário';

    const sheet = workbook.addWorksheet('Vocabulário', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Definir colunas
    sheet.columns = COLUMNS;

    // Estilo do header
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B579A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF1F3F6E' } },
      };
    });

    // Validação de dropdown para grammaticalCategory
    const catValues = GRAMMATICAL_CATEGORIES.map(c => c.value).join(',');
    sheet.dataValidations.add('C2:C99999', {
      type: 'list',
      allowBlank: true,
      formulae: [`"${catValues}"`],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Selecione uma categoria gramatical válida',
    });

    // Adicionar linhas
    entries.forEach((entry, index) => {
      const row = sheet.addRow(entry);
      // Alternar cor das linhas
      if (index % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FA' } };
        });
      }
      row.height = 18;
    });

    // Auto-filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: COLUMNS.length },
    };

    // Segunda folha: referência de categorias
    const refSheet = workbook.addWorksheet('Categorias (ref)');
    refSheet.addRow(['Categoria', 'Valor', 'Subcategoria', 'Valor Sub']);
    GRAMMATICAL_CATEGORIES.forEach(cat => {
      if (cat.subcategories.length === 0) {
        refSheet.addRow([cat.label, cat.value, '-', '-']);
      } else {
        cat.subcategories.forEach(sub => {
          refSheet.addRow([cat.label, cat.value, sub.label, sub.value]);
        });
      }
    });

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
```

---

## 9. Endpoint de Download

### `export.controller.ts`

```typescript
import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ExcelExportService } from './excel-export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly excelService: ExcelExportService) {}

  @Get('vocabulary')
  async downloadVocabulary(
    @Res() res: Response,
    @Query('entries') entriesJson: string,
  ) {
    const entries = JSON.parse(entriesJson);
    const buffer = await this.excelService.generate(entries);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="vocabulario_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
```

---

## 10. Configuração de Ambiente

### `.env`

```env
# Mistral AI
MISTRAL_API_KEY=sk-...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1

# Upload
MAX_FILE_SIZE_MB=50
CHUNK_SIZE_TOKENS=3000
```

### `app.module.ts` (imports necessários)

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ManualsModule,
    VocabularyModule,
    ExportModule,
    // Opcional — processamento assíncrono
    BullModule.forRoot({ redis: { host: 'localhost', port: 6379 } }),
  ],
})
export class AppModule {}
```

---

## 11. Dependências

```bash
# Core
npm install @mistralai/mistralai openai exceljs

# NestJS
npm install @nestjs/config @nestjs/platform-express multer

# Opcional — filas assíncronas (recomendado para PDFs grandes)
npm install @nestjs/bull bull ioredis

# Types
npm install -D @types/multer @types/express
```

---

## 12. Análise de Custos

### Premissas base

| Parâmetro                              | Valor                          |
|----------------------------------------|-------------------------------|
| Manual PDF típico                      | 100 páginas / ~50 000 palavras |
| Tokens por palavra (português)         | ~1.33 tokens                  |
| Tokens por página                      | ~500 tokens                   |
| Tamanho do chunk (texto + prompt)      | ~3 500 tokens input            |
| Output médio por chunk (JSON)          | ~1 000 tokens                 |
| Número de chunks por manual            | ~22 chunks                    |

---

### Custo por manual (100 páginas)

#### Mistral OCR 3 — Extração de PDF

| Modalidade       | Preço             | Custo / 100 pág. |
|------------------|-------------------|-----------------|
| Standard API     | $2,00 / 1 000 pág | **$0,20**       |
| Batch API (50%)  | $1,00 / 1 000 pág | **$0,10**       |

---

#### OpenAI — Análise de Vocabulário

| Modelo          | Input / 1M tokens | Output / 1M tokens | Input (77k) | Output (22k) | **Total** |
|-----------------|-------------------|--------------------|-------------|--------------|-----------|
| GPT-4.1         | $2,00             | $8,00              | $0,154      | $0,176       | **$0,33** |
| GPT-4o          | $2,50             | $10,00             | $0,193      | $0,220       | **$0,41** |
| GPT-4.1-mini    | $0,40             | $1,60              | $0,031      | $0,035       | **$0,07** |
| GPT-4.1-nano    | $0,10             | $0,40              | $0,008      | $0,009       | **$0,02** |

> **Recomendação:** GPT-4.1 para qualidade máxima (dicionários, etimologias); GPT-4.1-mini para triagem inicial.

---

### Custo total por manual (Standard + GPT-4.1)

```
Mistral OCR:  $0,20
OpenAI:       $0,33
─────────────────────
Total:        ~$0,53 por manual de 100 páginas
```

---

### Estimativa por volume de manuais

| Nº de manuais | Páginas totais | Mistral OCR  | OpenAI (GPT-4.1) | **Total**    |
|---------------|---------------|-------------|-----------------|-------------|
| 5             | 500           | $1,00       | $1,65           | **~$2,65**  |
| 10            | 1 000         | $2,00       | $3,30           | **~$5,30**  |
| 25            | 2 500         | $5,00       | $8,25           | **~$13,25** |
| 50            | 5 000         | $10,00      | $16,50          | **~$26,50** |
| 100           | 10 000        | $20,00      | $33,00          | **~$53,00** |

> Com **Batch API** da Mistral e prompt caching da OpenAI, os custos podem baixar até **30–40%** adicionais.

---

## 13. Capacidade de Vocábulos na Base de Dados

### Quantos termos se extraem por manual?

| Tipo de manual             | Páginas | Vocábulos únicos estimados |
|----------------------------|---------|---------------------------|
| Manual escolar (1 volume)  | 80–120  | 800 – 1 500               |
| Livro de texto universitário| 200–300 | 2 000 – 4 000             |
| Enciclopédia (1 volume)    | 400–600 | 5 000 – 10 000            |

**Distribuição típica por tipo:**
- Termos de 1 palavra: ~65% do total
- Termos de 2 palavras: ~25% do total
- Termos de 3 palavras: ~10% do total

---

### Capacidade total estimada por volume de manuais

| Manuais processados | Vocábulos brutos  | Após deduplicação | BD pronta           |
|---------------------|------------------|-------------------|---------------------|
| 5 manuais           | ~6 250           | ~4 000 – 5 000    | **~4 500 termos**   |
| 10 manuais          | ~12 500          | ~7 000 – 9 000    | **~8 000 termos**   |
| 25 manuais          | ~31 250          | ~15 000 – 20 000  | **~17 000 termos**  |
| 50 manuais          | ~62 500          | ~25 000 – 35 000  | **~30 000 termos**  |
| 100 manuais         | ~125 000         | ~40 000 – 55 000  | **~47 000 termos**  |

> A deduplicação reduz significativamente os totais porque os manuais partilham vocabulário comum (artigos, verbos comuns, preposições).

---

### Limites de bases de dados relacionais

| Base de dados  | Limite prático de linhas por tabela | Conclusão              |
|----------------|-------------------------------------|------------------------|
| PostgreSQL     | Ilimitado (petabytes)               | Sem restrições         |
| MySQL / MariaDB| ~4 bilhões por tabela               | Sem restrições         |
| SQLite         | ~281 TB                             | Adequado até 500k itens|
| MongoDB        | Ilimitado (por coleção)             | Sem restrições         |

**Conclusão prática:** Para o volume esperado (até ~50 000 vocábulos), **qualquer base de dados relacional é adequada**. A performance não será um problema.

---

### Estrutura SQL recomendada para importação

```sql
CREATE TABLE vocabulary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term            VARCHAR(150)  NOT NULL,
  pronunciation   VARCHAR(100),
  grammatical_category     VARCHAR(50),
  grammatical_subcategory  VARCHAR(50),
  syllabic_division        VARCHAR(150),
  etymology                TEXT,
  first_definition         TEXT NOT NULL,
  second_definition        TEXT,
  source_manual   VARCHAR(255), -- nome do PDF de origem
  created_at      TIMESTAMP DEFAULT NOW(),

  CONSTRAINT uq_term UNIQUE (term)
);

CREATE INDEX idx_vocabulary_category ON vocabulary(grammatical_category);
CREATE INDEX idx_vocabulary_term_gin ON vocabulary USING gin(to_tsvector('portuguese', term));
```

---

## 14. Fluxo de Processamento Assíncrono (Recomendado)

Para PDFs grandes, usar BullMQ para não bloquear o servidor:

```typescript
// vocabulary.processor.ts (Bull Worker)
@Processor('vocabulary')
export class VocabularyProcessor {
  @Process('extract')
  async handleExtraction(job: Job<{ buffer: string; filename: string }>) {
    const buffer = Buffer.from(job.data.buffer, 'base64');

    await job.progress(10); // OCR iniciado
    const text = await this.pdfService.extractText(buffer);

    await job.progress(40); // Análise IA
    const rawEntries = await this.aiService.extractVocabulary(text);

    await job.progress(80); // Processamento
    const result = await this.processorService.process(rawEntries);

    await job.progress(95); // Excel
    const excel = await this.excelService.generate(result.entries);

    await job.progress(100);
    return { stats: result, excelBase64: excel.toString('base64') };
  }
}
```

---

## 15. Sumário de Custos e Capacidade

| Cenário                    | Custo estimado | Vocábulos na BD |
|----------------------------|---------------|-----------------|
| Projeto pequeno (5 manuais) | **~$3**       | ~4 500          |
| Projeto médio (25 manuais) | **~$13**      | ~17 000         |
| Projeto grande (100 manuais)| **~$53**      | ~47 000         |

> **Nota:** Preços baseados em Mistral OCR 3 ($2/1000 pág) e OpenAI GPT-4.1 ($2/$8 por 1M tokens), conforme tarifas de maio de 2026. Usar Batch API da Mistral e GPT-4.1-mini para processos de triagem pode reduzir o custo total em até 60%.

---

*Documento gerado em maio de 2026 — reveja os preços das APIs regularmente pois estão sujeitos a alterações.*
