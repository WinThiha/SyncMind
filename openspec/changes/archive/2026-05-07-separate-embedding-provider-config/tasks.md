## 1. Configuration Contract Split

- [x] 1.1 Add embedding-specific environment variables and config keys for `base_uri`, `api_key`, `model`, and optional dimensions while retaining deterministic fallback from legacy AI keys.
- [x] 1.2 Update `.env.example` and developer docs to document new key names, precedence order, and migration guidance.

## 2. Embedding Runtime Refactor

- [x] 2.1 Refactor `GenerateIssueEmbeddingJob` to use embedding-specific config and OpenAI-compatible embeddings request/auth format.
- [x] 2.2 Refactor `AIIssueSearchService` to use embedding-specific config and OpenAI-compatible embeddings request/auth format.
- [x] 2.3 Ensure dimension handling remains compatible with `issues.embedding` pgvector constraints and fails clearly on mismatches.

## 3. Non-Embedding AI Path Stability

- [x] 3.1 Keep `ai.client` wiring for suggestion/summarization paths unchanged except for any config namespace alignment needed by the split.
- [x] 3.2 Add/adjust safeguards so embedding credentials are never implicitly sourced from non-embedding keys once embedding-specific keys are set.

## 4. Verification

- [x] 4.1 Add or update backend tests for config precedence and embedding request construction.
- [x] 4.2 Run Laravel tests with required safety sequence: clear config cache first, then run targeted/full test suites using testing env variables.
- [x] 4.3 Validate semantic similarity endpoints and embedding job behavior in Docker-backed dev flow with the new embedding configuration.
