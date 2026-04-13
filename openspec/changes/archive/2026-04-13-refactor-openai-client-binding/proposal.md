## Why

The `openai-php/laravel` package registers a default `OpenAI\Client` in the Laravel service container. This default binding overwrites any custom singleton bindings made for the `OpenAI\Client` class, causing custom headers (like `HTTP-Referer` and `X-Title`, which are required by API gateways like OpenRouter) to be lost when the client is injected into services. A more robust, scalable architecture is needed to support current and future AI features without conflicting with the vendor package.

## What Changes

- Introduce a named singleton binding (`ai.client`) in `AppServiceProvider` for the `OpenAI\Client` configured with custom headers.
- Refactor existing AI services (e.g., `AIIssueSuggestionService`) to resolve the custom `ai.client` explicitly rather than relying on global type-hint injection.

## Capabilities

### New Capabilities
- `ai-infrastructure`: Establishes the core configuration and integration patterns for the OpenAI client within the application.

### Modified Capabilities
None

## Impact

- `App\Providers\AppServiceProvider`: Will contain the new named binding logic.
- `App\Services\AIIssueSuggestionService`: Constructor will be updated to explicitly resolve the named binding.
- Future AI services will be impacted as they must adopt the named binding pattern.
