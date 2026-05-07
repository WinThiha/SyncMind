## Context

The `issues.embedding` column is defined as `vector(768)` (migration written for `text-embedding-004`), but the app now uses `gemini-embedding-001` via the native Gemini API (`embedContent` endpoint). This model returns 3072-dimensional vectors by default. The mismatch causes PostgreSQL to reject the write with a data exception, which — due to the sync queue driver running the embedding job inside the creation transaction — aborts the entire transaction and prevents issue creation entirely.

Two services call the `embedContent` endpoint:
- `GenerateIssueEmbeddingJob` — stores embedding on issue create/update
- `AIIssueSearchService` — generates query embedding for similarity search

Both need the same fix.

## Goals / Non-Goals

**Goals:**
- Ensure embedding API responses produce 768-dimensional vectors that match the `vector(768)` column
- Fix issue creation so it no longer fails due to the dimension mismatch

**Non-Goals:**
- Switching to a real queue driver or fixing the sync-queue-inside-transaction architectural issue (separate concern)
- Migrating the column to a different dimension
- Re-embedding existing records (can be done as a follow-up)

## Decisions

### 1. Use `outputDimensionality` parameter rather than changing the column

**Decision**: Add `outputDimensionality: 768` to the `embedContent` request payload.

**Rationale**: The native Gemini API supports `outputDimensionality` to reduce vector dimensions at the API level. This keeps the 768-dim column (smaller storage, faster similarity search) while using the higher-quality `gemini-embedding-001` model. The alternative — altering the column to `vector(3072)` — would increase storage 4x and slow down similarity queries for no meaningful gain.

**Alternatives considered**:
- Change column to `vector(3072)`: larger storage, slower queries, no quality benefit at the scale of this app
- Switch back to `text-embedding-004`: older model, lower quality, unnecessary constraint

### 2. Centralize the dimension value in config

**Decision**: Add an `output_dimensionality` key to `config/openai.php` under the `vector` section, referencing it in both services.

**Rationale**: The dimension value (768) is coupled to the migration's `vector(768)` definition. Centralizing it prevents drift between config and schema. If the model or dimension ever changes, there's one place to update.

## Risks / Trade-offs

- **[Risk] `outputDimensionality` not supported for a future model** → Mitigation: The parameter is part of the stable Gemini API contract. If a model doesn't support it, the API returns a clear error.
- **[Risk] Existing rows have malformed or 3072-dim embeddings** → Mitigation: Since issue creation was failing, most rows likely have no embedding. A re-embedding artisan command can be added as a follow-up.
