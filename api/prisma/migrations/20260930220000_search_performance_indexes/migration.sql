-- ==============================================================================
-- FASE 1: OTIMIZAÇÃO DE BASE DE DADOS (EXTENSÕES, TRIGRAM E ÍNDICES GIN/PREFIXO)
-- ==============================================================================

-- 1. Extensões para busca textual tolerante e insensível a acentos
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Função wrapper IMMUTABLE para o unaccent (necessário para indexação no Postgres)
CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

-- 3. Índices para a tabela "entries"
CREATE INDEX IF NOT EXISTS "entries_entry_trgm_idx" ON "entries" USING gin (f_unaccent(lower("entry")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "entries_first_def_trgm_idx" ON "entries" USING gin (f_unaccent(lower("firstDefinition")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "entries_entry_prefix_idx" ON "entries" (f_unaccent(lower("entry")) text_pattern_ops);

-- 4. Índices para a tabela "neologisms"
CREATE INDEX IF NOT EXISTS "neologisms_entry_trgm_idx" ON "neologisms" USING gin (f_unaccent(lower("entry")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "neologisms_first_def_trgm_idx" ON "neologisms" USING gin (f_unaccent(lower("firstDefinition")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "neologisms_entry_prefix_idx" ON "neologisms" (f_unaccent(lower("entry")) text_pattern_ops);

-- 5. Índices para a tabela "toponyms"
CREATE INDEX IF NOT EXISTS "toponyms_toponym_trgm_idx" ON "toponyms" USING gin (f_unaccent(lower("toponym")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "toponyms_meaning_trgm_idx" ON "toponyms" USING gin (f_unaccent(lower("meaning")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "toponyms_toponym_prefix_idx" ON "toponyms" (f_unaccent(lower("toponym")) text_pattern_ops);

-- 6. Índices para a tabela "anthroponyms"
CREATE INDEX IF NOT EXISTS "anthroponyms_name_trgm_idx" ON "anthroponyms" USING gin (f_unaccent(lower("name")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "anthroponyms_meaning_trgm_idx" ON "anthroponyms" USING gin (f_unaccent(lower("meaning")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "anthroponyms_name_prefix_idx" ON "anthroponyms" (f_unaccent(lower("name")) text_pattern_ops);

-- 7. Índices para a tabela "foreignisms"
CREATE INDEX IF NOT EXISTS "foreignisms_term_trgm_idx" ON "foreignisms" USING gin (f_unaccent(lower("term")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "foreignisms_definition_trgm_idx" ON "foreignisms" USING gin (f_unaccent(lower("definition")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "foreignisms_term_prefix_idx" ON "foreignisms" (f_unaccent(lower("term")) text_pattern_ops);

-- 8. Índices para a tabela "volna_terms"
CREATE INDEX IF NOT EXISTS "volna_terms_term_trgm_idx" ON "volna_terms" USING gin (f_unaccent(lower("term")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "volna_terms_def_trgm_idx" ON "volna_terms" USING gin (f_unaccent(lower("definition")) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "volna_terms_term_prefix_idx" ON "volna_terms" (f_unaccent(lower("term")) text_pattern_ops);
