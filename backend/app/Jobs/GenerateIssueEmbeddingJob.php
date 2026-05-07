<?php

namespace App\Jobs;

use App\Models\Issue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GenerateIssueEmbeddingJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Issue $issue)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $input = "Summary: {$this->issue->summary}\nDescription: {$this->issue->description}";

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

            $response = \Illuminate\Support\Facades\Http::withToken($apiKey)
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

            // Format for pgvector: [0.1, 0.2, ...]
            $vectorString = '['.implode(',', $embedding).']';

            $this->issue->updateQuietly([
                'embedding' => $vectorString,
            ]);

            Log::info("Generated embedding for issue #{$this->issue->id}");
        } catch (\Exception $e) {
            Log::error("Failed to generate embedding for issue #{$this->issue->id}: ".$e->getMessage());
            $this->fail($e);
        }
    }
}
