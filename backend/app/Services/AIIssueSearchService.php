<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Project;
use Illuminate\Support\Collection;

class AIIssueSearchService
{
    /**
     * Search for issues similar to the provided text.
     */
    public function findSimilar(Project $project, string $text, int $limit = 5): Collection
    {
        $baseUrl = rtrim(config('openai.vector.base_uri'), '/');
        $model = config('openai.vector.model');

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'x-goog-api-key' => config('openai.api_key'),
        ])->post($baseUrl."/models/{$model}:embedContent", [
            'model' => "models/{$model}",
            'content' => [
                'parts' => [
                    ['text' => $text],
                ],
            ],
            'outputDimensionality' => config('openai.vector.output_dimensionality'),
        ])->throw()->json();

        $embedding = $response['embedding']['values'];
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
            ->map(function ($issue) {
                // Convert distance to similarity score (0 to 1)
                // distance = 1 - similarity
                $issue->similarity = round(1 - $issue->distance, 4);
                unset($issue->distance);
                unset($issue->embedding);

                return $issue;
            });
    }
}
