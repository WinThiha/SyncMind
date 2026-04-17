## Why

The current semantic issue search implementation uses Gemini's OpenAI compatibility layer via Laravel's `Http` facade. While functional, it relies on an undocumented endpoint (`/v1beta/openai/embeddings`) that has known quirks (e.g., omitting the `index` key in responses). Google officially recommends using the native Gemini REST API for full compatibility and access to Gemini-specific features. Switching to the native API removes the unnecessary "translation layer" and ensures better long-term resilience and support.

## What Changes

- Modify `AIIssueSearchService` to use the native Gemini REST API endpoint (`/v1beta/models/{model}:embedContent`) instead of the OpenAI compatibility endpoint.
- Modify `GenerateIssueEmbeddingJob` to use the native Gemini REST API endpoint.
- Update the payload structure in both files to match the native Gemini API requirements (`{"model": "...", "content": {"parts": [{"text": "..."}]}}`).
- Update the response parsing in both files to extract the embedding from `$response['embedding']['values']` instead of `$response['data'][0]['embedding']`.
- Update environment variables (`AI_VECTOR_BASE_URL`) to point to the base Gemini API URL without the `/openai/` suffix.
- Pass the API key as a query parameter (`?key=...`) or via the `x-goog-api-key` header instead of a Bearer token.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `ai-infrastructure`: Update the Vector Search Service configuration and implementation to use the native Gemini REST API instead of the OpenAI compatibility layer.

## Impact

- **Backend Services**: `AIIssueSearchService` and `GenerateIssueEmbeddingJob` will be refactored.
- **Configuration**: The `.env` and potentially `config/openai.php` files will be updated to reflect the new base URL and authentication method for the Vector Search Service.
- **Dependencies**: No new dependencies are introduced; we continue to use Laravel's `Http` facade.