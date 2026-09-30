import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('📊 MED Project — Benchmark de Linha de Base (Fase 0)');
  console.log('====================================================\n');

  try {
    // 1. Contagem de registros por tabela
    console.log('1. Volume de dados nas tabelas principais:');
    const tableCounts = await prisma.$queryRaw<Array<{ relname: string; n_live_tup: bigint }>>`
      SELECT relname, n_live_tup 
      FROM pg_stat_user_tables 
      WHERE relname IN ('entries', 'neologisms', 'toponyms', 'anthroponyms', 'foreignisms', 'volna_terms', 'blog_posts', 'events')
      ORDER BY 2 DESC;
    `;
    console.table(
      tableCounts.map((r) => ({
        tabela: r.relname,
        linhas_vivas: Number(r.n_live_tup),
      })),
    );

    // 2. EXPLAIN (ANALYZE, BUFFERS) para Autocomplete (ILIKE prefix/substring)
    const testTerm = 'ang';
    console.log(`\n2. Plano de Execução — Autocomplete ("${testTerm}"):`);
    const autocompletePlan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(
      `EXPLAIN (ANALYZE, BUFFERS)
       SELECT id, "entry", "firstDefinition", "grammaticalCategory"
       FROM "entries"
       WHERE "approvalStatus" = 'APPROVED'
         AND ("entry" ILIKE '%${testTerm}%' OR "firstDefinition" ILIKE '%${testTerm}%')
       ORDER BY "entry" ASC
       LIMIT 6;`,
    );
    autocompletePlan.forEach((line) => console.log(line['QUERY PLAN']));

    // 3. EXPLAIN (ANALYZE, BUFFERS) para Dicionário com Filtro de Categoria
    console.log(`\n3. Plano de Execução — Listagem com Filtro de Categoria:`);
    const filterPlan = await prisma.$queryRawUnsafe<Array<{ 'QUERY PLAN': string }>>(
      `EXPLAIN (ANALYZE, BUFFERS)
       SELECT id, "entry", "firstDefinition"
       FROM "entries"
       WHERE "approvalStatus" = 'APPROVED'
         AND "grammaticalCategory" = 'substantivo'
       ORDER BY "entry" ASC
       LIMIT 10;`,
    );
    filterPlan.forEach((line) => console.log(line['QUERY PLAN']));

    // 4. Verificação dos índices existentes
    console.log(`\n4. Índices ativos e contagem de scans:`);
    const indexStats = await prisma.$queryRaw<Array<{ tablename: string; indexname: string; idx_scan: bigint }>>`
      SELECT 
        tablename, 
        indexname, 
        idx_scan
      FROM pg_stat_user_indexes
      WHERE tablename IN ('entries', 'neologisms', 'toponyms', 'anthroponyms', 'foreignisms')
      ORDER BY tablename, indexname;
    `;
    console.table(
      indexStats.map((r) => ({
        tabela: r.tablename,
        indice: r.indexname,
        scans: Number(r.idx_scan),
      })),
    );
  } catch (error) {
    console.error('Erro ao executar benchmark de linha de base:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
