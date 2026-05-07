<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_can_add_member()
    {
        $creator = User::factory()->create();
        $userToAdd = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);

        $response = $this->actingAs($creator)->postJson("/api/projects/{$project->id}/members", [
            'email' => $userToAdd->email,
            'role' => 'normal',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $userToAdd->id,
            'role' => 'normal',
        ]);
    }

    public function test_normal_member_cannot_add_members()
    {
        $creator = User::factory()->create();
        $normalMember = User::factory()->create();
        $userToAdd = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);
        $project->members()->attach($normalMember->id, ['role' => 'normal']);

        $response = $this->actingAs($normalMember)->postJson("/api/projects/{$project->id}/members", [
            'email' => $userToAdd->email,
            'role' => 'normal',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_member_role()
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'normal']);

        $response = $this->actingAs($creator)->putJson("/api/projects/{$project->id}/members/{$member->id}", [
            'role' => 'admin',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_remove_member()
    {
        $creator = User::factory()->create();
        $member = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);
        $project->members()->attach($member->id, ['role' => 'normal']);

        $response = $this->actingAs($creator)->deleteJson("/api/projects/{$project->id}/members/{$member->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_cannot_remove_creator()
    {
        $creator = User::factory()->create();
        $admin = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $response = $this->actingAs($admin)->deleteJson("/api/projects/{$project->id}/members/{$creator->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $creator->id,
        ]);
    }
}
