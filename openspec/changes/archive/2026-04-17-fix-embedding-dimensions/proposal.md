## Why

The Gemini embedding API (`gemini-embedding-001`) returns 3072-dimensional vectors by default, but the `issues.embedding` column is defined as `vector(768)`. This dimension mismatch causes a PostgreSQL data exception on every issue creation, which — due to the sync queue running inside a DB transaction — aborts the entire transaction and rolls back the issue save. Users cannot create issues at all.

## What Changes

- Add `outputDimensionality: 768` parameter to the native Gemini `embedContent` API calls in `GenerateIssueEmbeddingJob` and `AIIssueSearchService`, so the returned vectors match the `vector(768)` column definition.

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `ai-infrastructure`: Embedding service calls must specify `outputDimensionality` to guarantee consistent vector dimensions between the API response and the database column.

## Impact

- **Code**: `GenerateIssueEmbeddingJob`, `AIIssueSearchService` — add one parameter to each API payload
- **Database**: No migration changes; `vector(768)` column is already correct
- **API**: No public API changes
- **Existing data**: Any existing rows with embeddings may have 3072-dim vectors stored (or none, since saves were failing). A re-embedding pass may be needed after the fix.
