<?php

namespace Tests\Feature;

use App\Jobs\GenerateIssueEmbeddingJob;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\AIIssueSearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AIEmbeddingRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_search_service_uses_openai_compatible_embedding_request(): void
    {
        config()->set('openai.embedding.api_key', 'embed-key');
        config()->set('openai.embedding.base_uri', 'https://embed.example/v1');
        config()->set('openai.embedding.model', 'text-embedding-3-small');
        config()->set('openai.embedding.dimensions', 768);

        Http::fake([
            'https://embed.example/v1/embeddings' => Http::response([
                'data' => [
                    ['embedding' => array_fill(0, 768, 0.1)],
                ],
            ]),
        ]);

        $user = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $user->id]);
        $project->members()->attach($user->id, ['role' => 'admin']);

        app(AIIssueSearchService::class)->findSimilar($project, 'search text');

        Http::assertSent(function ($request) {
            $headers = $request->headers();

            return $request->url() === 'https://embed.example/v1/embeddings'
                && ($headers['Authorization'][0] ?? null) === 'Bearer embed-key'
                && $request['model'] === 'text-embedding-3-small'
                && $request['input'] === 'search text'
                && $request['dimensions'] === 768;
        });
    }

    public function test_generate_embedding_job_uses_openai_compatible_embedding_request(): void
    {
        config()->set('openai.embedding.api_key', 'embed-key');
        config()->set('openai.embedding.base_uri', 'https://embed.example/v1');
        config()->set('openai.embedding.model', 'text-embedding-3-small');
        config()->set('openai.embedding.dimensions', 768);

        Http::fake([
            'https://embed.example/v1/embeddings' => Http::response([
                'data' => [
                    ['embedding' => array_fill(0, 768, 0.2)],
                ],
            ]),
        ]);

        $user = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $user->id]);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'summary' => 'S',
            'description' => 'D',
        ]);

        (new GenerateIssueEmbeddingJob($issue))->handle();

        Http::assertSent(function ($request) {
            $headers = $request->headers();

            return $request->url() === 'https://embed.example/v1/embeddings'
                && ($headers['Authorization'][0] ?? null) === 'Bearer embed-key'
                && $request['model'] === 'text-embedding-3-small'
                && str_contains((string) $request['input'], 'Summary: S')
                && str_contains((string) $request['input'], 'Description: D')
                && $request['dimensions'] === 768;
        });
    }
}
