## 1. Infrastructure & Configuration

- [x] 1.1 Update `docker-compose.yml` DB image to `pgvector/pgvector:pg16`
- [x] 1.2 Restart Docker containers to apply the new DB image
- [x] 1.3 Add `AI_VECTOR_BASE_URL` and `AI_VECTOR_MODEL` to backend `.env.example`
- [x] 1.4 Update backend `config/openai.php` (or similar config) to register the Vector Search Service client configuration alongside the Suggestion Service

## 2. Database Schema

- [x] 2.1 Create a new migration to enable the `vector` extension in PostgreSQL (`CREATE EXTENSION IF NOT EXISTS vector;`)
- [x] 2.2 Create a new migration to add an `embedding` column of type `vector` to the `issues` table

## 3. Backend Implementation

- [x] 3.1 Create `GenerateIssueEmbeddingJob` to generate vector embeddings using the Vector Search Service and save them to the `Issue` model
- [x] 3.2 Update the `Issue` model to dispatch `GenerateIssueEmbeddingJob` on `created` and `updated` events via an Observer
- [x] 3.3 Create a new API endpoint `GET /api/issues/similar` (changed to `GET /api/projects/{project}/ai/similar-issues`) that accepts a text string
- [x] 3.4 Implement the logic in the new endpoint to generate an embedding for the query and search the `issues` table using cosine similarity
- [x] 3.5 Refactor `AIIssueSearchService` and `GenerateIssueEmbeddingJob` to use Laravel's `Http` facade for embeddings, bypassing `openai-php` due to missing `index` key in Gemini API response.

## 4. Frontend Implementation

- [x] 4.1 Update the issue creation form component to include a 1000ms debounce on the summary input field
- [x] 4.2 Create a "Possible Duplicates" inline card component
- [x] 4.3 Integrate the debounce logic to call the `GET /api/issues/similar` endpoint and pass results to the duplicate card component