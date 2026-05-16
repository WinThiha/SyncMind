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
    public function findSimilar(Project $project, string $text, int $limit = 5, array $filters = []): Collection
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

        $query = Issue::query()
            ->where('project_id', $project->id)
            ->whereNotNull('embedding')
            ->select(['id', 'project_id', 'key_number', 'summary', 'description', 'status', 'priority', 'issue_type', 'due_date', 'updated_at', 'assignee_id'])
            ->with('project:id,name,key')
            ->with('assignee:id,name,email')
            ->withCount('comments')
            ->selectRaw('embedding <=> ? AS distance', [$vectorString]);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (! empty($filters['issue_type'])) {
            $query->where('issue_type', $filters['issue_type']);
        }
        if (! empty($filters['due_date_start'])) {
            $query->whereDate('due_date', '>=', $filters['due_date_start']);
        }
        if (! empty($filters['due_date_end'])) {
            $query->whereDate('due_date', '<=', $filters['due_date_end']);
        }

        return $query
            ->orderBy('distance', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($issue) use ($project) {
                $issue->similarity = round(1 - $issue->distance, 4);
                $issue->key = $issue->key_number ? "{$project->key}-{$issue->key_number}" : null;
                $issue->comments_count = $issue->comments_count ?? 0;
                unset($issue->distance);
                unset($issue->embedding);

                return $issue;
            });
    }
}
