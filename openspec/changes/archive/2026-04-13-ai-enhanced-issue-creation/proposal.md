## Why

Creating new issues can be tedious and prone to inconsistent details or missing context. We want to enhance the issue creation process with an AI Copilot that automatically suggests descriptions, breaks down tasks, estimates effort, and intelligently recommends an assignee based on their role and workload. This reduces friction, speeds up project management, and leverages LLMs via an affordable OpenRouter integration.

## What Changes

- Add a `position` string column to the `users` table to provide the AI with context on team members' roles (e.g., "Senior Frontend Engineer").
- Introduce the `openai-php/laravel` package configured to use an OpenRouter-compatible endpoint for structured JSON AI generation.
- Add a new backend endpoint (`POST /api/projects/{project}/ai/suggest-issue`) that takes a summary, project issue types, priorities, and user positions, and returns strict structured output.
- Update the frontend `CreateIssueForm.tsx` to include an "✨ Auto-fill with AI" button that handles shimmer/loading states and safely populates the form without overwriting existing user input.

## Capabilities

### New Capabilities
- `ai-issue-copilot`: AI-driven issue field suggestion and smart assignee recommendation based on user roles.

### Modified Capabilities
- `003-issue-management`: Issue creation flow is enhanced with an AI copilot button and context-aware assignment.

## Impact

- **Database**: Migration needed to add `position` to `users` table.
- **Backend API**: New endpoint for AI issue analysis.
- **Dependencies**: Adds `openai-php/laravel` to the backend.
- **Frontend**: Modifies `CreateIssueForm.tsx` for AI integration and adds loading states.
- **External Services**: Requires configuration of `AI_BASE_URL` and `AI_API_KEY` for OpenRouter/OpenAI API usage.
