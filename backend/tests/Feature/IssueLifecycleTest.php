<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class IssueLifecycleTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_admin_can_create_issue(): void
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->postJson("/api/projects/{$project->id}/issues", [
                'summary' => 'Test Issue',
                'description' => 'Test Description',
                'issue_type' => 'Bug',
                'priority' => 'high',
                'estimated_hours' => 10.5,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.summary', 'Test Issue')
            ->assertJsonPath('data.estimated_hours', 10.5);

        $this->assertDatabaseHas('issues', [
            'project_id' => $project->id,
            'summary' => 'Test Issue',
            'estimated_hours' => 10.5,
        ]);
    }

    public function test_sequential_key_is_correct(): void
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id, 'key' => 'SEQ']);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        // Create first issue
        $this->actingAs($admin)
            ->postJson("/api/projects/{$project->id}/issues", [
                'summary' => 'First Issue',
                'issue_type' => 'Task',
            ]);

        // Create second issue
        $response = $this->actingAs($admin)
            ->postJson("/api/projects/{$project->id}/issues", [
                'summary' => 'Second Issue',
                'issue_type' => 'Bug',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.key', 'SEQ-2');
    }

    public function test_member_can_view_issues(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'member']);

        Issue::factory()->count(3)->create(['project_id' => $project->id]);

        $response = $this->actingAs($member)
            ->getJson("/api/projects/{$project->id}/issues");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_non_member_cannot_view_issues(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();

        Issue::factory()->count(3)->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/projects/{$project->id}/issues");

        $response->assertStatus(403);
    }

    public function test_normal_member_cannot_create_issue_if_strictly_enforced(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->postJson("/api/projects/{$project->id}/issues", [
                'summary' => 'Illegal Issue',
                'issue_type' => 'Task',
            ]);

        $response->assertStatus(403);
    }

    public function test_normal_member_cannot_delete_issue(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $issue = Issue::factory()->create(['project_id' => $project->id, 'key_number' => 1]);

        $response = $this->actingAs($member)
            ->deleteJson("/api/projects/{$project->id}/issues/{$project->key}-1");

        $response->assertStatus(403);
        $this->assertDatabaseHas('issues', ['id' => $issue->id, 'deleted_at' => null]);
    }

    public function test_assigned_user_can_update_issue(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'member']);

        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'key_number' => 1,
            'assignee_id' => $member->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($member)
            ->patchJson("/api/projects/{$project->id}/issues/{$project->key}-1", [
                'status' => 'in_progress',
                'actual_hours' => 2.5,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.actual_hours', 2.5);

        $this->assertDatabaseHas('issues', [
            'id' => $issue->id,
            'status' => 'in_progress',
            'actual_hours' => 2.5,
        ]);
    }
}
