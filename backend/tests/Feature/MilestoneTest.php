<?php

namespace Tests\Feature;

use App\Models\Issue;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MilestoneTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private User $outsider;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin    = User::factory()->create();
        $this->member   = User::factory()->create();
        $this->outsider = User::factory()->create();

        $this->project = Project::factory()->create(['creator_id' => $this->admin->id]);
        $this->project->members()->attach($this->admin->id,  ['role' => 'admin']);
        $this->project->members()->attach($this->member->id, ['role' => 'member']);
    }

    // ── index ──────────────────────────────────────────────────────────────

    public function test_member_can_list_milestones(): void
    {
        Milestone::factory()->count(3)->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/milestones");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_outsider_cannot_list_milestones(): void
    {
        $this->actingAs($this->outsider)
            ->getJson("/api/projects/{$this->project->id}/milestones")
            ->assertStatus(403);
    }

    // ── store ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_milestone(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/milestones", [
                'name'        => 'v1.0 Launch',
                'description' => 'First public release',
                'start_date'  => '2026-05-10',
                'due_date'    => '2026-06-01',
                'status'      => 'open',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'v1.0 Launch')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('milestones', [
            'project_id' => $this->project->id,
            'name'       => 'v1.0 Launch',
        ]);
    }

    public function test_member_cannot_create_milestone(): void
    {
        $this->actingAs($this->member)
            ->postJson("/api/projects/{$this->project->id}/milestones", ['name' => 'Beta'])
            ->assertStatus(403);
    }

    public function test_due_date_must_be_after_start_date(): void
    {
        $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/milestones", [
                'name'       => 'Bad dates',
                'start_date' => '2026-06-01',
                'due_date'   => '2026-05-01',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['due_date']);
    }

    // ── show ───────────────────────────────────────────────────────────────

    public function test_show_includes_progress_and_issues(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);
        Issue::factory()->count(2)->create([
            'project_id'   => $this->project->id,
            'milestone_id' => $milestone->id,
            'status'       => 'open',
            'creator_id'   => $this->admin->id,
        ]);
        Issue::factory()->create([
            'project_id'   => $this->project->id,
            'milestone_id' => $milestone->id,
            'status'       => 'closed',
            'creator_id'   => $this->admin->id,
        ]);

        $response = $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/milestones/{$milestone->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.progress.total', 3)
            ->assertJsonPath('data.progress.completed', 1)
            ->assertJsonPath('data.progress.percentage', 33)
            ->assertJsonCount(3, 'data.issues');
    }

    // ── update ─────────────────────────────────────────────────────────────

    public function test_admin_can_update_milestone(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->admin)
            ->patchJson("/api/projects/{$this->project->id}/milestones/{$milestone->id}", [
                'status' => 'in_progress',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');
    }

    public function test_member_cannot_update_milestone(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->member)
            ->patchJson("/api/projects/{$this->project->id}/milestones/{$milestone->id}", [
                'status' => 'closed',
            ])
            ->assertStatus(403);
    }

    // ── destroy ────────────────────────────────────────────────────────────

    public function test_admin_can_delete_milestone(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/projects/{$this->project->id}/milestones/{$milestone->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('milestones', ['id' => $milestone->id]);
    }

    public function test_deleting_milestone_nullifies_issue_milestone_id(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);
        $issue = Issue::factory()->create([
            'project_id'   => $this->project->id,
            'milestone_id' => $milestone->id,
            'creator_id'   => $this->admin->id,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/projects/{$this->project->id}/milestones/{$milestone->id}")
            ->assertStatus(204);

        $this->assertNull($issue->fresh()->milestone_id);
    }

    // ── issue due_date + milestone_id ──────────────────────────────────────

    public function test_issue_can_be_created_with_due_date_and_milestone(): void
    {
        $milestone = Milestone::factory()->create(['project_id' => $this->project->id]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/projects/{$this->project->id}/issues", [
                'summary'      => 'Scheduled issue',
                'issue_type'   => 'Task',
                'due_date'     => '2026-05-20',
                'milestone_id' => $milestone->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.due_date', '2026-05-20')
            ->assertJsonPath('data.milestone_id', $milestone->id);
    }

    // ── overdue flag ───────────────────────────────────────────────────────

    public function test_overdue_flag_is_true_when_past_due_and_not_closed(): void
    {
        $milestone = Milestone::factory()->create([
            'project_id' => $this->project->id,
            'due_date'   => now()->subDay()->toDateString(),
            'status'     => 'open',
        ]);

        $response = $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/milestones");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.is_overdue', true);
    }

    public function test_overdue_flag_is_false_when_closed(): void
    {
        $milestone = Milestone::factory()->create([
            'project_id' => $this->project->id,
            'due_date'   => now()->subDay()->toDateString(),
            'status'     => 'closed',
        ]);

        $response = $this->actingAs($this->member)
            ->getJson("/api/projects/{$this->project->id}/milestones");

        $response->assertStatus(200)
            ->assertJsonPath('data.0.is_overdue', false);
    }
}
