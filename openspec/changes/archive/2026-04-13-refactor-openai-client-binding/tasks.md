## 1. Setup Named Binding

- [x] 1.1 Update `backend/app/Providers/AppServiceProvider.php` to register a named singleton (`ai.client`) instead of binding `OpenAI\Client::class`.

## 2. Refactor Services

- [x] 2.1 Update `backend/app/Services/AIIssueSuggestionService.php` constructor to explicitly resolve the `ai.client` binding using `app('ai.client')`.

## 3. Validation

- [x] 3.1 Run tests to verify `AIIssueSuggestionService` still functions as expected.
