## Context

The backend currently uses one shared AI key path (`openai.api_key`) for both general model features (issue suggestion and thread summarization) and embedding workflows. Embedding behavior is implemented through Gemini-specific REST calls and payloads in both `AIIssueSearchService` and `GenerateIssueEmbeddingJob`, while other AI features rely on a configured OpenAI client binding (`ai.client`). This coupling makes provider/key separation difficult, prevents clean isolation for operational incidents, and blocks a consistent OpenAI-compatible embedding path.

Key constraints:
- Existing production and local environments already rely on `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`.
- The `issues.embedding` column is a fixed `vector(768)`, so embedding dimensionality changes have migration and re-embedding implications.
- Change should be deployable with backward compatibility first, then allow key migration.

## Goals / Non-Goals

**Goals:**
- Define explicit configuration separation between non-embedding AI model services and embedding services.
- Enable embeddings to use OpenAI-compatible API endpoints and authentication (`/embeddings`, bearer key).
- Keep existing chat/suggestion/summarization behavior intact.
- Provide a backward-compatible transition for existing env keys.
- Ensure embedding dimensionality remains validated against current storage expectations.

**Non-Goals:**
- Migrating existing stored embeddings to a new vector dimension.
- Introducing a multi-provider runtime router across many providers in this change.
- Changing product behavior for UI/UX of AI suggestions or semantic search.

## Decisions

1. Introduce two explicit config lanes under AI config
- Decision: separate config into logical lanes: `chat` (or general LLM) and `embedding`, each with independent `base_uri`, `api_key`, and `model`.
- Rationale: makes ownership and secret rotation clear; removes hidden key reuse.
- Alternative considered: keep one key with optional embedding override only. Rejected because it preserves ambiguity and weak isolation.

2. Move embedding requests to OpenAI-compatible embeddings contract
- Decision: embedding generation/search will call OpenAI-compatible embeddings endpoint/payload and use bearer auth from embedding-specific key.
- Rationale: aligns with desired provider portability and lets one contract serve OpenAI-compatible vendors.
- Alternative considered: keep Gemini native endpoint and only split key names. Rejected because user requirement is to make embeddings OpenAI-compatible.

3. Backward-compatible env fallback during rollout
- Decision: new embedding env keys become primary; legacy keys remain as fallback until migration is complete.
- Rationale: avoids immediate deployment breakage and supports phased secret rollout.
- Alternative considered: hard cutover to new keys only. Rejected due to operational risk.

4. Keep embedding dimensionality explicit in config
- Decision: retain configurable dimensions for embeddings and enforce/validate compatibility with `vector(768)` expectation.
- Rationale: prevents silent runtime errors when changing models/providers.
- Alternative considered: infer dimensions dynamically from provider response. Rejected because schema compatibility must be deterministic.

## Risks / Trade-offs

- [Misconfigured embedding endpoint/auth] -> Mitigation: explicit embedding config namespace, startup/config validation, and clear error messages.
- [Dimension mismatch with pgvector column] -> Mitigation: keep dimensions explicit, add checks in embedding pipeline, document migration path for any future dimension change.
- [Fallback ambiguity during migration] -> Mitigation: deterministic precedence order (new keys first), deprecation notice in docs/changelog.
- [Provider-specific behavioral differences] -> Mitigation: use OpenAI-compatible baseline contract and include focused tests for embedding request/response handling.

## Migration Plan

1. Add new embedding-specific env vars and config mapping while preserving old-key fallback.
2. Update embedding service/job codepaths to consume only embedding config lane and OpenAI-compatible request format.
3. Add tests for configuration precedence and embedding request generation.
4. Deploy with both old and new keys present; verify runtime logs/health checks show embedding lane is using expected key/provider.
5. Rotate environments to new embedding keys; remove reliance on legacy fallback in a later cleanup change.

Rollback:
- Revert to previous config + Gemini embedding calls if runtime integration issues occur.
- Keep old env values available during rollout window for fast rollback.

## Open Questions

- Should the embedding lane use `dimensions` parameter by default for all OpenAI-compatible providers, or only when explicitly configured?
- Should we add a startup warning when fallback keys are used, to accelerate migration completion?
- Do we want a dedicated service abstraction (`EmbeddingClient`) now, or keep scoped refactor limited to existing service/job classes in this change?
