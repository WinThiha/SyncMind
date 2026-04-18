## Context

The SyncMind backend already implements a vector-based similarity search using `pgvector` and Gemini embeddings. This is currently utilized for duplicate issue detection during the issue creation process. The goal is to surface this same technology as a user-facing "Natural Language Search" in the main issue listing page.

## Goals / Non-Goals

**Goals:**
- Provide a toggleable AI search mode in the `IssueList` component.
- Display semantic matches with similarity scores.
- Maintain existing keyword search as the default mode.
- Ensure a responsive UI during asynchronous AI searches.

**Non-Goals:**
- Implementing a new vector search engine (we will use the existing `AIIssueSearchService`).
- Changing the underlying embedding model or dimensionality.
- Modifying the mobile view (focused on desktop/web experience for now).

## Decisions

- **Toggle Mechanism**: A ✨ (Sparkles) icon button will toggle between "Keyword" and "AI" search modes. This is clearer than a combined "hybrid" search which might confuse users with unexpected results.
- **Debouncing**: AI search will be debounced by 800-1000ms to prevent excessive API calls to the Gemini embedding endpoint.
- **Result Blending**: In AI mode, we will replace the client-side filtered list with the API-returned similar issues. We will not "blend" them with keyword matches to keep the UI state predictable.
- **Similarity Threshold**: We will show issues with a similarity score > 0.3 to ensure relevance, but we'll display the score so users can judge quality.

## Risks / Trade-offs

- **[Risk] API Latency** → **[Mitigation]** Use a prominent loading state (skeleton or spinner) specifically within the search bar or list area when AI search is active.
- **[Risk] Token Cost** → **[Mitigation]** Debouncing ensures we only generate embeddings when the user has finished typing.
- **[Risk] Search Precision** → **[Mitigation]** Keep Keyword search as the default. AI search is an "advanced" mode for discovery.
