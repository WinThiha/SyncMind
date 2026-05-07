## 1. Configuration Updates

- [x] 1.1 Update `AI_VECTOR_BASE_URL` in `.env.example` from `https://generativelanguage.googleapis.com/v1beta/openai/` to `https://generativelanguage.googleapis.com/v1beta/`
- [x] 1.2 Update `config/openai.php` to reflect the new `AI_VECTOR_BASE_URL` structure (`https://generativelanguage.googleapis.com/v1beta/`)

## 2. Backend Implementation

- [x] 2.1 Refactor `GenerateIssueEmbeddingJob` to format the request payload for the native Gemini API (`{"model": "...", "content": {"parts": [{"text": "..."}]}}`)
- [x] 2.2 Refactor `GenerateIssueEmbeddingJob` to use the `x-goog-api-key` header and target the `{model}:embedContent` URL path
- [x] 2.3 Refactor `GenerateIssueEmbeddingJob` to extract the embedding array from `$response['embedding']['values']`
- [x] 2.4 Refactor `AIIssueSearchService` to format the request payload for the native Gemini API
- [x] 2.5 Refactor `AIIssueSearchService` to use the `x-goog-api-key` header and target the `{model}:embedContent` URL path
- [x] 2.6 Refactor `AIIssueSearchService` to extract the embedding array from `$response['embedding']['values']`