<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\AI\Contracts\ChatCompletionClient;
use App\Services\AIIssueSuggestionService;
use App\Services\AIThreadSummarizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AIChatServiceIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_suggestion_service_retries_without_strict_json_mode(): void
    {
        $user = User::factory()->create([
            'position' => 'Backend Engineer',
            'settings' => ['preferences' => ['locale' => 'my-MM']],
        ]);
        $project = Project::factory()->create(['creator_id' => $user->id, 'issue_types' => ['Task', 'Bug', 'Story']]);
        $project->members()->attach($user->id, ['role' => 'admin']);

        $mock = Mockery::mock(ChatCompletionClient::class);
        $mock->shouldReceive('complete')
            ->once()
            ->withArgs(function (array $messages, array $options): bool {
                return isset($messages[0]['content'])
                    && str_contains($messages[0]['content'], 'Output language locale: my-MM')
                    && ($options['response_format']['type'] ?? null) === 'json_object';
            })
            ->andThrow(new \RuntimeException('json mode unsupported'));

        $mock->shouldReceive('complete')
            ->once()
            ->withArgs(function (array $messages, array $options): bool {
                return isset($messages[0]['content'])
                    && str_contains($messages[0]['content'], 'Output language locale: my-MM')
                    && ! isset($options['response_format']);
            })
            ->andReturn(json_encode([
                'description' => 'Generated description',
                'issue_type' => 'Bug',
                'priority' => 'high',
                'estimated_hours' => 4,
                'assignee_suggestions' => [
                    ['assignee_id' => $user->id, 'reason' => 'Matches backend ownership'],
                ],
            ], JSON_THROW_ON_ERROR));

        $this->app->instance(ChatCompletionClient::class, $mock);

        $result = app(AIIssueSuggestionService::class)->suggest($project, 'Fix auth failure', $user);

        $this->assertSame('Generated description', $result['description']);
        $this->assertSame('Bug', $result['issue_type']);
        $this->assertSame('high', $result['priority']);
        $this->assertSame(4.0, $result['estimated_hours']);
        $this->assertSame($user->id, $result['assignee_suggestions'][0]['assignee_id']);
    }

    public function test_thread_summarization_service_uses_chat_client_path(): void
    {
        $user = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'ja-JP']],
        ]);
        $project = Project::factory()->create(['creator_id' => $user->id]);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'creator_id' => $user->id,
            'assignee_id' => $user->id,
            'summary' => 'Summary',
        ]);

        Comment::create([
            'issue_id' => $issue->id,
            'user_id' => $user->id,
            'content' => 'Looks good to proceed',
        ]);

        $mock = Mockery::mock(ChatCompletionClient::class);
        $mock->shouldReceive('complete')
            ->once()
            ->withArgs(function (array $messages): bool {
                return isset($messages[0]['content'])
                    && str_contains($messages[0]['content'], 'Output language locale: ja-JP');
            })
            ->andReturn(json_encode([
                'summary' => 'Thread summary',
                'decisions' => ['Ship it'],
                'consensus' => 'Aligned',
                'action_items' => ['Deploy'],
            ], JSON_THROW_ON_ERROR));

        $this->app->instance(ChatCompletionClient::class, $mock);

        $result = app(AIThreadSummarizationService::class)->summarize($issue, $user);

        $this->assertSame('Thread summary', $result['summary']);
        $this->assertSame(['Ship it'], $result['decisions']);
        $this->assertSame('Aligned', $result['consensus']);
        $this->assertSame(['Deploy'], $result['action_items']);
    }
}
