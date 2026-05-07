## Context

`AIIssueSuggestionService` and `AIThreadSummarizationService` currently call `openai-php` chat APIs through the shared `ai.client` binding. With OpenRouter-backed models, response hydration can fail when optional usage fields are absent (for example `accepted_prediction_tokens`), creating runtime instability despite valid model content in `choices[0].message.content`.

The project already uses Laravel `Http` directly for embedding calls and has explicit provider configuration patterns. A similar direct HTTP strategy for OpenRouter chat completions fits existing architecture and avoids dependence on strict vendor response objects.

## Goals / Non-Goals

**Goals:**
- Introduce a dedicated OpenRouter chat client abstraction for suggestions and summarization.
- Use Laravel `Http` to call `POST /chat/completions` and extract message content directly.
- Keep prompt construction and output sanitization logic inside existing services with minimal behavioral change.
- Preserve fallback behavior for models that reject strict JSON response modes.

**Non-Goals:**
- Replacing or removing embedding provider implementation from the previous change.
- Reworking frontend flows for AI suggestion or thread summary UX.
- Adding multi-provider orchestration beyond OpenRouter-focused chat support.

## Decisions

1. Add an internal chat completion interface and OpenRouter implementation
- Decision: create a small app-level client contract (content-in/content-out) and bind an OpenRouter HTTP implementation.
- Rationale: isolates provider quirks and keeps services provider-agnostic.
- Alternative considered: inline `Http` calls directly in each service. Rejected due to duplication and inconsistent error handling.

2. Keep existing services as orchestrators of prompts and parsing
- Decision: `AIIssueSuggestionService` and `AIThreadSummarizationService` continue building prompts and validating output; only transport layer changes.
- Rationale: minimizes risk and keeps behavior stable.
- Alternative considered: full service rewrite around new DTOs. Rejected as unnecessary scope.

3. Normalize OpenRouter request/response handling centrally
- Decision: wrapper owns auth headers (`Authorization`, `HTTP-Referer`, `X-Title`), endpoint construction, timeout, and content extraction from `choices[0].message.content`.
- Rationale: consistent, testable behavior across AI services.
- Alternative considered: continue using `openai-php` with upgraded dependencies only. Rejected as less deterministic and coupled to hydration shape changes.

4. Add explicit chat provider config lane
- Decision: add `chat` config keys (provider/base URL/key/model) with sensible fallback to existing AI keys.
- Rationale: aligns with prior embedding-provider split and allows clean migration.
- Alternative considered: reuse only existing `openai.*` keys. Rejected to avoid long-term ambiguity between provider lanes.

## Risks / Trade-offs

- [OpenRouter schema drift] -> Mitigation: central response normalization and defensive extraction checks.
- [Behavior regression in suggestion/summarization output] -> Mitigation: keep prompts/sanitization unchanged and add focused tests around response extraction.
- [Configuration confusion during migration] -> Mitigation: clear precedence docs and explicit provider-key naming.
- [Dual client paths increase complexity] -> Mitigation: narrow scope to chat-only abstraction and keep one default provider path.

## Migration Plan

1. Introduce chat client abstraction and OpenRouter HTTP implementation.
2. Add chat provider config and bind implementation in service provider.
3. Switch suggestion and summarization services to the abstraction.
4. Add tests for request shape, header injection, JSON-mode fallback, and content parsing.
5. Roll out with existing AI keys as fallback; then migrate environments to dedicated chat keys.

Rollback:
- Rebind services to previous `openai-php` path by toggling provider binding/config and redeploy.

## Open Questions

- Should chat abstraction return only content string or include usage metadata for observability?
- Do we want an explicit runtime feature flag to choose between OpenRouter HTTP and `openai-php` during transition?
