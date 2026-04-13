## Context

The `openai-php/laravel` package is used in the project, but its service provider automatically registers a default `OpenAI\Client` in the Laravel container. SyncMind requires passing custom HTTP headers (`HTTP-Referer` and `X-Title`) to the OpenAI client to properly authenticate and identify requests when routing them through custom LLM gateways like OpenRouter. Currently, binding `OpenAI\Client::class` in the `AppServiceProvider` gets overridden by the vendor's binding, causing services to receive an unconfigured client.

## Goals / Non-Goals

**Goals:**
- Ensure AI services in SyncMind use an `OpenAI\Client` that contains all necessary custom headers.
- Establish a clean, scalable architectural pattern for injecting the custom AI client into any future AI-related services.
- Prevent conflicts with the `openai-php/laravel` default bindings.

**Non-Goals:**
- We are not removing the `openai-php/laravel` package.
- We are not changing the underlying AI model configurations in this change, only how the client is built and injected.

## Decisions

**Decision 1: Use a Named Singleton Binding for the Custom Client**
Instead of attempting to override the `OpenAI\Client::class` binding or using Contextual Binding (which requires updating the provider for every new service), we will register a named singleton in `AppServiceProvider`:
```php
$this->app->singleton('ai.client', function () { ... });
```
Services will explicitly resolve this client using `$this->client = app('ai.client');` in their constructors.

*Rationale:* This is the most robust and DRY (Don't Repeat Yourself) approach. It centralizes the client configuration and avoids the "whack-a-mole" problem of Contextual Binding as new AI features are added.

## Risks / Trade-offs

- **[Risk]** Loss of automatic dependency injection: Services cannot simply type-hint `OpenAI\Client` in their constructor to get the custom client; they will get the vendor's default client instead.
  - **Mitigation**: Document this architectural decision in the AI infrastructure specs and ensure all current (`AIIssueSuggestionService`) and future services explicitly use `app('ai.client')`.
