<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\User;
use App\Services\AIMilestoneService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AIMilestoneTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    private Project $project;

    private Milestone $milestone;

    protected function setUp(): void
    {
        parent::setUp();

        $this->member = User::factory()->create();
        $this->project = Project::factory()->create(['creator_id' => $this->member->id]);
        $this->project->members()->attach($this->member->id, ['role' => 'admin']);
        $this->milestone = Milestone::factory()->create(['project_id' => $this->project->id]);
    }

    private function milestoneAiUrl(string $action): string
    {
        return "/api/projects/{$this->project->id}/milestones/{$this->milestone->id}/ai/{$action}";
    }

    // ── summarize ──────────────────────────────────────────────────────────

    public function test_summarize_unauthenticated_returns_401(): void
    {
        $this->postJson($this->milestoneAiUrl('summarize'))->assertStatus(401);
    }

    public function test_summarize_non_member_returns_403(): void
    {
        $outsider = User::factory()->create();

        $this->actingAs($outsider)
            ->postJson($this->milestoneAiUrl('summarize'))
            ->assertStatus(403);
    }

    public function test_summarize_returns_correct_shape(): void
    {
        $fakeSummary = [
            'summary' => 'The milestone is progressing well.',
            'generated_at' => now()->toISOString(),
        ];

        $this->mock(AIMilestoneService::class, function ($mock) use ($fakeSummary) {
            $mock->shouldReceive('summarize')->once()->andReturn($fakeSummary);
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('summarize'));

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['summary', 'generated_at'], 'cached'])
            ->assertJsonPath('cached', false);
    }

    public function test_summarize_second_call_returns_cached(): void
    {
        $fakeSummary = [
            'summary' => 'Cached summary.',
            'generated_at' => now()->toISOString(),
        ];

        Cache::put("milestone_{$this->milestone->id}_summary", $fakeSummary, now()->addMinutes(30));

        $this->mock(AIMilestoneService::class, function ($mock) {
            $mock->shouldNotReceive('summarize');
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('summarize'));

        $response->assertStatus(200)
            ->assertJsonPath('cached', true)
            ->assertJsonPath('data.summary', 'Cached summary.');
    }

    // ── risk-analysis ──────────────────────────────────────────────────────

    public function test_risk_analysis_returns_correct_shape(): void
    {
        $fakeRisk = [
            'verdict' => 'at_risk',
            'signals' => ['3 overdue issues', 'High-priority task still open'],
            'recommendation' => 'Prioritise the high-priority open issues.',
            'generated_at' => now()->toISOString(),
        ];

        $this->mock(AIMilestoneService::class, function ($mock) use ($fakeRisk) {
            $mock->shouldReceive('analyzeRisk')->once()->andReturn($fakeRisk);
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('risk-analysis'));

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['verdict', 'signals', 'recommendation', 'generated_at'], 'cached']);

        $this->assertContains($response->json('data.verdict'), ['on_track', 'at_risk', 'critical']);
    }

    // ── suggest-dates ──────────────────────────────────────────────────────

    public function test_suggest_dates_returns_correct_shape(): void
    {
        $fakeDates = [
            'start_date' => '2026-06-01',
            'due_date' => '2026-06-30',
            'rationale' => 'Based on 5 open issues with estimates totalling 20h.',
        ];

        $this->mock(AIMilestoneService::class, function ($mock) use ($fakeDates) {
            $mock->shouldReceive('suggestDates')->once()->andReturn($fakeDates);
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('suggest-dates'));

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['start_date', 'due_date', 'rationale']]);
    }

    // ── suggest-issues ─────────────────────────────────────────────────────

    public function test_suggest_issues_returns_correct_shape(): void
    {
        $unlinkedIssue = Issue::factory()->create([
            'project_id' => $this->project->id,
            'milestone_id' => null,
            'summary' => 'Fix login timeout',
        ]);

        $fakeSuggestions = [
            [
                'issue_id' => $unlinkedIssue->id,
                'key' => "{$this->project->key}-{$unlinkedIssue->key_number}",
                'summary' => 'Fix login timeout',
                'score' => 0.87,
                'reason' => 'Directly related to authentication scope.',
            ],
        ];

        $this->mock(AIMilestoneService::class, function ($mock) use ($fakeSuggestions) {
            $mock->shouldReceive('suggestIssues')->once()->andReturn($fakeSuggestions);
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('suggest-issues'));

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['issue_id', 'key', 'summary', 'score', 'reason']]]);
    }

    public function test_suggest_issues_respects_limit(): void
    {
        $this->mock(AIMilestoneService::class, function ($mock) {
            $mock->shouldReceive('suggestIssues')
                ->once()
                ->withArgs(fn ($m, $limit) => $limit === 3)
                ->andReturn([]);
        });

        $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('suggest-issues'), ['limit' => 3])
            ->assertStatus(200);
    }

    public function test_suggest_issues_does_not_include_linked_issues(): void
    {
        $linkedIssue = Issue::factory()->create([
            'project_id' => $this->project->id,
            'milestone_id' => $this->milestone->id,
            'summary' => 'Already linked issue',
        ]);

        $this->mock(AIMilestoneService::class, function ($mock) {
            $mock->shouldReceive('suggestIssues')
                ->once()
                ->andReturn([]);
        });

        $response = $this->actingAs($this->member)
            ->postJson($this->milestoneAiUrl('suggest-issues'));

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('issue_id')->toArray();
        $this->assertNotContains($linkedIssue->id, $ids);
    }
}
