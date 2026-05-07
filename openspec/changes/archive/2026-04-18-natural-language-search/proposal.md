## Why

The current issue search is limited to exact keyword matches on summary and key, making it difficult to find relevant issues that use different terminology. By leveraging the existing vector search infrastructure, we can provide a "Natural Language Search" that understands the intent and context of the user's query, significantly improving issue discoverability and reducing duplicate creation.

## What Changes

- Add a "Natural Language Search" toggle (✨) to the `IssueList` component.
- Integrate the `getSimilarIssues` API call into the frontend search workflow.
- Display semantic similarity scores for results when in AI search mode.
- Update the `IssueList` to handle asynchronous searching and loading states for AI queries.

## Capabilities

### New Capabilities
- `natural-language-search`: Enables semantic, intent-based searching for issues using vector embeddings.

### Modified Capabilities
- `semantic-issue-search`: Extend existing duplicate detection capabilities to general-purpose issue searching.

## Impact

- **Frontend**: `IssueList.tsx` and `IssueListItem.tsx` will be updated to support the new search mode and display similarity scores.
- **API**: Uses the existing `/api/projects/{project}/ai/similar-issues` endpoint.
- **Performance**: AI search involves a network request and vector similarity calculation, so debouncing and loading states are critical.
