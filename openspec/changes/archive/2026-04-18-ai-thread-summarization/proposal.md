## Why

Long issue threads are difficult to parse, leading to missed decisions and slow onboarding for team members. AI-driven thread summarization provides instant clarity on consensus and action items by analyzing both discussions and field updates.

## What Changes

- **AI Timeline Aggregation**: Backend logic to merge `Comments` and `IssueHistory` into a single chronological narrative for AI analysis.
- **Summarization Service**: New service layer to interact with the AI client (OpenAI/Gemini) and generate structured summaries (Overview, Decisions, Consensus, Action Items).
- **REST API**: New endpoint `POST /api/projects/{project}/issues/{issue_key}/ai/summarize` with integrated caching and invalidation.
- **UI Enhancement**: A "✨ Summarize Thread" button in the issue comment section and a dedicated `SummaryCard` to display the AI's findings.

## Capabilities

### New Capabilities
- `ai-thread-summarization`: Provides automated extraction of decisions, consensus, and action items from issue activity timelines.

### Modified Capabilities
- `003-issue-management`: Extends the issue detail view with AI-powered summarization features.

## Impact

- **Backend**: `AIIssueController`, `AIIssueSuggestionService` (patterns), and new `AIThreadSummarizationService`.
- **Frontend**: `Comments.tsx` component, issue detail page, and a new `SummaryCard` component.
- **Infrastructure**: Redis/Cache usage for summary persistence.
