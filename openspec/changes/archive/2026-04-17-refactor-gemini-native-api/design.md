## Context

SyncMind's semantic issue search feature currently relies on Gemini's OpenAI compatibility endpoint (`/v1beta/openai/embeddings`) via Laravel's `Http` facade to generate vector embeddings. During implementation, we discovered that this undocumented compatibility layer omits the `index` key from the JSON response, which breaks strictly typed clients (like `openai-php/client`) and adds an unnecessary translation layer. Google officially recommends using the native Gemini REST API for interacting with Gemini models.

## Goals / Non-Goals

**Goals:**
- Refactor the backend AI services to use the native Gemini REST API for embeddings (`/v1beta/models/{model}:embedContent`).
- Ensure the payload structure and response parsing align with the native API's JSON schema.
- Update configuration environment variables to point directly to the native API base URL without the `/openai` suffix.

**Non-Goals:**
- Changing the underlying vector database (`pgvector`).
- Changing the model used for embeddings (`gemini-embedding-001`).
- Altering the frontend user experience or debounce logic.
- Modifying the OpenRouter configuration used for the Suggestion Service (LLM text generation).

## Decisions

- **Direct HTTP Calls over Custom SDK**: We will continue using Laravel's `Http` facade to make direct REST API calls to Gemini instead of bringing in a new Google Cloud SDK. This keeps dependencies light, given we only need a single POST request for embeddings.
- **Header-based Authentication**: We will pass the API key using the `x-goog-api-key` header rather than a query parameter (`?key=...`) to prevent the key from potentially appearing in server access logs or error traces.
- **Config Alignment**: We will update the `AI_VECTOR_BASE_URL` in `.env.example` and the `config/openai.php` file to point to `https://generativelanguage.googleapis.com/v1beta/`. The model name remains `gemini-embedding-001`.

## Risks / Trade-offs

- **[Risk] Schema differences between OpenAI and Gemini** → **[Mitigation]** The payload and response parsing logic in `AIIssueSearchService` and `GenerateIssueEmbeddingJob` must be meticulously updated. The new response structure isolates the vector array under `$response['embedding']['values']`. We will manually verify this structure using `curl` before implementation.
- **[Trade-off] Loss of portability** → Moving to the native Gemini API means we cannot easily swap the vector provider to another OpenAI-compatible service just by changing the base URL. However, since vector databases require re-embedding all existing data when changing providers, "hot-swapping" vector providers is not a realistic operational scenario anyway, making this trade-off acceptable.