## 1. Chat Client Abstraction

- [x] 1.1 Add an application-level chat completion interface and an OpenRouter HTTP implementation that posts to `/chat/completions`.
- [x] 1.2 Add provider/config-driven service container bindings for chat client resolution, including OpenRouter headers and auth setup.

## 2. Service Migration

- [x] 2.1 Refactor `AIIssueSuggestionService` to use the chat completion abstraction and preserve existing JSON parsing/sanitization behavior.
- [x] 2.2 Refactor `AIThreadSummarizationService` to use the same abstraction and preserve current summary parsing fallback behavior.
- [x] 2.3 Remove temporary debug logging related to raw chat response objects once the new client path is in place.

## 3. Configuration and Error Handling

- [x] 3.1 Add chat provider configuration keys (provider/base URI/API key/model) with documented fallback precedence.
- [x] 3.2 Add defensive handling for missing `choices[0].message.content` and explicit exceptions for malformed OpenRouter responses.
- [x] 3.3 Ensure strict-JSON first attempt with fallback retry without strict JSON mode remains supported through the new client.

## 4. Verification

- [x] 4.1 Add/update tests for OpenRouter request construction (URL, headers, payload) and response content extraction.
- [x] 4.2 Add/update service-level tests confirming suggestion/summarization flows still return expected normalized structures.
- [x] 4.3 Run backend test sequence with required safety policy (`config:clear` first, then Docker testing env test command).
