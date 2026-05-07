## Why

Finding relevant or duplicate issues currently relies on exact keyword matching, which is inefficient and often misses conceptually similar but differently worded issues. Implementing semantic search using vector embeddings allows users to find similar issues based on meaning, significantly reducing duplicate work and improving overall issue management efficiency.

## What Changes

- Upgrade the local PostgreSQL database image in `docker-compose.yml` to `pgvector/pgvector:pg16` to support vector storage and similarity search natively.
- Separate the existing AI client configuration into two distinct services: a "Suggestion Service" (for text generation) and a new "Vector Search Service" (specifically utilizing the Gemini API and the `text-embedding-004` model).
- Implement a background process (Laravel Job) that generates and saves a vector embedding combining the issue's summary and description whenever an issue is created or updated.
- Introduce an inline "Possible Duplicates" card in the frontend issue creation form. This card will query the Vector Search Service for semantically similar existing issues after a 1000ms debounce of the user typing the summary.

## Capabilities

### New Capabilities
- `semantic-issue-search`: AI-driven semantic search for issues and proactive duplicate detection during the issue creation process.

### Modified Capabilities
- `ai-infrastructure`: Update to support multiple distinct AI service configurations (Suggestion Service vs. Vector Search Service) with separate base URLs and models.

## Impact

- **Database**: The PostgreSQL Docker image will be updated, and the `issues` table will require a new migration to add a `vector` column for embeddings.
- **Backend API**: A new endpoint for semantic search will be added. Existing Issue models will need Observers to trigger embedding jobs.
- **Frontend UI**: The issue creation form will be updated to include the debounce logic and the new "Possible Duplicates" inline card component.
- **Configuration**: New environment variables will be required for the Vector Search Service (Gemini API credentials and model).