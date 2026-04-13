<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\IssueHistory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_status_creates_history_record(): void
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'status' => 'open'
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/api/projects/{$project->id}/issues/{$issue->full_key}", [
                'status' => 'in_progress'
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('issue_histories', [
            'issue_id' => $issue->id,
            'user_id' => $admin->id,
            'field' => 'status',
            'old_value' => 'open',
            'new_value' => 'in_progress'
        ]);
    }

    public function test_updating_multiple_fields_creates_multiple_records(): void
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'summary' => 'Old Summary',
            'priority' => 'normal'
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/api/projects/{$project->id}/issues/{$issue->full_key}", [
                'summary' => 'New Summary',
                'priority' => 'high'
            ]);

        $response->assertStatus(200);

        $this->assertEquals(2, IssueHistory::where('issue_id', $issue->id)->count());
    }

    public function test_issue_detail_includes_history(): void
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $issue = Issue::factory()->create(['project_id' => $project->id]);
        
        // Create some history
        IssueHistory::create([
            'issue_id' => $issue->id,
            'user_id' => $admin->id,
            'field' => 'status',
            'old_value' => 'open',
            'new_value' => 'in_progress'
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/api/projects/{$project->id}/issues/{$issue->full_key}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'history' => [
                        '*' => ['field', 'old_value', 'new_value', 'user']
                    ]
                ]
            ]);
    }
}
