## Why

Embedding and general AI model usage are currently coupled to overlapping configuration keys, which makes provider separation, key rotation, and incident isolation harder than necessary. We need a clear split now so embedding can use OpenAI-compatible APIs independently from chat/suggestion/summarization providers.

## What Changes

- Separate AI runtime configuration into two explicit lanes: non-embedding model services and embedding services.
- Introduce dedicated embedding provider settings (base URL, API key, model, optional dimensions) that do not reuse general AI service credentials.
- Standardize embedding requests to OpenAI-compatible embeddings API contracts.
- Preserve backward compatibility during rollout via temporary fallback mapping from legacy environment keys.
- Update runtime validation and logging to make provider/key source unambiguous for each AI path.
- Update docs and `.env.example` to reflect the new split and migration path.

## Capabilities

### New Capabilities
- `embedding-provider-config`: Dedicated configuration contract for embedding providers and credentials, including OpenAI-compatible endpoint support.

### Modified Capabilities
- `ai-infrastructure`: AI provider configuration and dependency wiring requirements are updated to separate embedding and non-embedding credentials/providers.
- `semantic-issue-search`: Embedding generation/search requirements are updated to use the new embedding provider contract and OpenAI-compatible request shape.

## Impact

- Affected backend areas: [backend/config/openai.php](/home/winthiha/projects/SyncMind/backend/config/openai.php), [backend/app/Providers/AppServiceProvider.php](/home/winthiha/projects/SyncMind/backend/app/Providers/AppServiceProvider.php), [backend/app/Services/AIIssueSearchService.php](/home/winthiha/projects/SyncMind/backend/app/Services/AIIssueSearchService.php), [backend/app/Jobs/GenerateIssueEmbeddingJob.php](/home/winthiha/projects/SyncMind/backend/app/Jobs/GenerateIssueEmbeddingJob.php), [backend/.env.example](/home/winthiha/projects/SyncMind/backend/.env.example).
- Operational impact: environment variable changes for deploy pipelines and secrets management.
- Data compatibility risk: embedding model dimensionality must remain compatible with existing pgvector column constraints unless accompanied by migration/re-embedding.
