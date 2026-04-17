## 1. Configuration

- [x] 1.1 Add `output_dimensionality` key to `config/openai.php` under the `vector` section with default value `768`
- [x] 1.2 Add `AI_VECTOR_OUTPUT_DIMENSIONALITY` env variable reference to the new config key

## 2. Embedding Services

- [x] 2.1 Add `outputDimensionality` parameter to the `embedContent` request payload in `GenerateIssueEmbeddingJob`, using `config('openai.vector.output_dimensionality')`
- [x] 2.2 Add `outputDimensionality` parameter to the `embedContent` request payload in `AIIssueSearchService`, using `config('openai.vector.output_dimensionality')`

## 3. Verification

- [x] 3.1 Create an issue via the API and confirm it saves successfully with a 768-dim embedding stored
- [x] 3.2 Confirm similarity search returns results without dimension errors
