## Context

SyncMind currently relies on keyword matching for finding similar issues. The goal is to implement semantic search using embeddings to improve duplicate issue detection during issue creation.

## Goals / Non-Goals

**Goals:**
- Implement a seamless "Possible Duplicates" inline card during issue creation.
- Use `pgvector` for similarity search natively in PostgreSQL.
- Configure a separate Vector Search Service using the Gemini API and `text-embedding-004` model.

**Non-Goals:**
- Expanding semantic search to all global search features across the app (for now, focus on duplicate detection during issue creation).
- Adding embeddings for issue comments (only summary and description will be embedded).

## Decisions

- **Separate AI Configs**: Use environment variables to distinguish between the Suggestion Service and the Vector Search Service. This prevents rate limit interference and allows utilizing the Gemini API specifically for its `text-embedding-004` model.
- **Database Vector Support**: Use `pgvector` over an external vector DB (like Pinecone) to simplify the stack since we are already using Postgres. Upgrade the `docker-compose.yml` DB image to `pgvector/pgvector:pg16` which is safe and retains existing data in volumes.
- **Async Embedding Generation**: Use a Laravel Background Job dispatched by an Eloquent Observer on the `Issue` model. This ensures issue creation/update isn't delayed by API calls to generate embeddings.
- **Bypass openai-php for Embeddings**: Use Laravel's `Http` facade to call the Gemini embeddings API directly, bypassing the `openai-php` client. This avoids crashes caused by the missing `index` key in Gemini's OpenAI compatibility layer.
- **UI Debounce**: Apply a 1000ms debounce on the frontend summary input before triggering the search query to minimize unnecessary API calls.

## Risks / Trade-offs

- **[Risk] Latency during issue creation** → **[Mitigation]** 1000ms debounce ensures the search only triggers when the user takes a pause, and background jobs are used to save embeddings, making the user experience smooth.
- **[Risk] Network failures to Gemini API** → **[Mitigation]** Queue jobs with retry mechanisms for saving embeddings. On the frontend, fallback gracefully if the search endpoint fails (by simply not displaying the duplicate card).