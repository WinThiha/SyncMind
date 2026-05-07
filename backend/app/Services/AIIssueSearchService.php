<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Project;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use RuntimeException;

class AIIssueSearchService
{
    /**
     * Search for issues similar to the provided text.
     */
    public function findSimilar(Project $project, string $text, int $limit = 5): Collection
    {
        $baseUrl = rtrim((string) config('openai.embedding.base_uri'), '/');
        $model = (string) config('openai.embedding.model');
        $apiKey = (string) config('openai.embedding.api_key');
        $dimensions = config('openai.embedding.dimensions');

        $payload = [
            'model' => $model,
            'input' => $text,
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

        $vectorString = '['.implode(',', $embedding).']';

        // Use cosine distance (<=>) for similarity search
        // Higher similarity = lower distance
        return Issue::query()
            ->where('project_id', $project->id)
            ->whereNotNull('embedding')
            ->select(['id', 'project_id', 'key_number', 'summary', 'status', 'priority'])
            ->selectRaw('embedding <=> ? AS distance', [$vectorString])
            ->orderBy('distance', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($issue) use ($project) {
                // Convert distance to similarity score (0 to 1)
                // distance = 1 - similarity
                $issue->similarity = round(1 - $issue->distance, 4);
                $issue->key = $issue->key_number ? "{$project->key}-{$issue->key_number}" : null;
                unset($issue->distance);
                unset($issue->embedding);

                return $issue;
            });
    }
}
