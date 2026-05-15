<?php

namespace App\Jobs;

use App\Models\WikiPage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GenerateWikiEmbeddingJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public WikiPage $wikiPage) {}

    public function handle(): void
    {
        try {
            $input = "Title: {$this->wikiPage->title}\nContent: {$this->wikiPage->content}";

            $baseUrl = rtrim((string) config('openai.embedding.base_uri'), '/');
            $model = (string) config('openai.embedding.model');
            $apiKey = (string) config('openai.embedding.api_key');
            $dimensions = config('openai.embedding.dimensions');

            $payload = [
                'model' => $model,
                'input' => $input,
            ];

            if (is_numeric($dimensions) && (int) $dimensions > 0) {
                $payload['dimensions'] = (int) $dimensions;
            }

            $response = Http::withToken($apiKey)
                ->post("{$baseUrl}/embeddings", $payload)
                ->throw()
                ->json();

            $embedding = Arr::get($response, 'data.0.embedding');
            if (! is_array($embedding) || $embedding === []) {
                throw new RuntimeException('Embedding response did not contain data.0.embedding.');
            }

            if (is_numeric($dimensions) && (int) $dimensions > 0 && count($embedding) !== (int) $dimensions) {
                throw new RuntimeException(sprintf(
                    'Embedding dimensions mismatch. Expected %d, got %d.',
                    (int) $dimensions,
                    count($embedding)
                ));
            }

            $vectorString = '['.implode(',', $embedding).']';

            $this->wikiPage->updateQuietly(['embedding' => $vectorString]);

            Log::info("Generated embedding for wiki page #{$this->wikiPage->id}");
        } catch (\Exception $e) {
            Log::error("Failed to generate embedding for wiki page #{$this->wikiPage->id}: ".$e->getMessage());
            $this->fail($e);
        }
    }
}
