## 1. Frontend: API Client Update

- [x] 1.1 Ensure `SimilarIssue` interface in `lib/api/issues.ts` correctly reflects backend response (should have `similarity` field).

## 2. Frontend: UI Components

- [x] 2.1 Update `IssueList` state to include `isAISearchEnabled` and `isSearchingAI`.
- [x] 2.2 Add AI Search toggle button (Sparkles ✨) to the search bar in `IssueList.tsx`.
- [x] 2.3 Implement debounced AI search logic in `IssueList.tsx` that calls `getSimilarIssues`.
- [x] 2.4 Update `IssueListItem.tsx` to optionally display a similarity score badge.
- [x] 2.5 Ensure loading states and "No results" messages are handled for AI search mode.

## 3. Verification

- [x] 3.1 Verify AI search toggle correctly switches modes.
- [x] 3.2 Verify semantic matches are returned and displayed with scores.
- [x] 3.3 Verify keyword search still works as expected when AI mode is off.
- [x] 3.4 Verify debouncing prevents excessive API calls.
