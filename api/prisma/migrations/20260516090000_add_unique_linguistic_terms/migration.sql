-- Enforce unique terms per linguistic resource, case-insensitive and ignoring edge spaces.
CREATE UNIQUE INDEX "entries_entry_unique_ci_idx" ON "entries" (lower(btrim("entry")));
CREATE UNIQUE INDEX "toponyms_toponym_unique_ci_idx" ON "toponyms" (lower(btrim("toponym")));
CREATE UNIQUE INDEX "anthroponyms_name_unique_ci_idx" ON "anthroponyms" (lower(btrim("name")));
CREATE UNIQUE INDEX "foreignisms_term_unique_ci_idx" ON "foreignisms" (lower(btrim("term")));
