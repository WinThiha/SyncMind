<?php

namespace App\Jobs;

use App\Models\Issue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

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
            
            $baseUrl = rtrim(config('openai.vector.base_uri'), '/');
            $model = config('openai.vector.model');
            
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'x-goog-api-key' => config('openai.api_key'),
            ])->post($baseUrl . "/models/{$model}:embedContent", [
                'model' => "models/{$model}",
                'content' => [
                    'parts' => [
                        ['text' => $input]
                    ]
                ],
                'outputDimensionality' => config('openai.vector.output_dimensionality'),
            ])->throw()->json();

            $embedding = $response['embedding']['values'];
            
            // Format for pgvector: [0.1, 0.2, ...]
            $vectorString = '[' . implode(',', $embedding) . ']';
            
            $this->issue->updateQuietly([
                'embedding' => $vectorString,
            ]);
            
            Log::info("Generated embedding for issue #{$this->issue->id}");
        } catch (\Exception $e) {
            Log::error("Failed to generate embedding for issue #{$this->issue->id}: " . $e->getMessage());
            $this->fail($e);
        }
    }
}
