## Why

AI suggestions and thread summarization currently depend on `openai-php` response hydration, which can fail with OpenRouter-specific usage payload shapes (for example missing `accepted_prediction_tokens`). We need a deterministic chat path that works with OpenRouter without coupling runtime stability to third-party hydration assumptions.

## What Changes

- Add a dedicated OpenRouter chat client wrapper built on Laravel `Http` for chat completions.
- Route AI suggestion and thread summarization services through a shared chat-completion abstraction instead of direct dependence on `openai-php` response objects.
- Standardize OpenRouter request headers and response extraction (`choices[0].message.content`) for these services.
- Add clear error handling for missing/invalid response content and fallback behavior for JSON-mode incompatibility.
- Keep embedding flow unchanged.

## Capabilities

### New Capabilities
- `openrouter-chat-client`: A dedicated HTTP-based OpenRouter chat client contract and implementation for robust chat completion calls.

### Modified Capabilities
- `ai-issue-copilot`: AI issue suggestion requirements are updated to use the chat completion abstraction that supports OpenRouter direct HTTP execution.
- `ai-thread-summarization`: Thread summarization requirements are updated to use the same abstraction and response normalization path.
- `ai-infrastructure`: AI client wiring requirements are updated to include provider-specific chat client resolution and OpenRouter header/config handling.

## Impact

- Affected backend areas: `backend/app/Services/AIIssueSuggestionService.php`, `backend/app/Services/AIThreadSummarizationService.php`, service provider bindings, and related AI config.
- Testing impact: add or update feature/unit tests for OpenRouter chat request construction, response parsing, and fallback behavior.
- Operational impact: ensure OpenRouter-specific headers and provider settings are configured and validated.
