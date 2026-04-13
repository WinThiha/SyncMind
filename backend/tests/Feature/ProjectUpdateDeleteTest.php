<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectUpdateDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_can_update_project()
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create([
            'creator_id' => $creator->id, 
            'name' => 'Old Name',
            'issue_types' => ['Task']
        ]);
        $project->members()->attach($creator->id, ['role' => 'admin']);

        $response = $this->actingAs($creator)->putJson("/api/projects/{$project->id}", [
            'name' => 'New Name',
            'issue_types' => ['Task', 'Bug']
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'name' => 'New Name']);
        $this->assertEquals(['Task', 'Bug'], $project->fresh()->issue_types);
    }

    public function test_creator_can_delete_project()
    {
        $creator = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);

        $response = $this->actingAs($creator)->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_creator_can_transfer_ownership_to_admin()
    {
        $creator = User::factory()->create();
        $newOwner = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($creator->id, ['role' => 'admin']);
        $project->members()->attach($newOwner->id, ['role' => 'admin']);

        $response = $this->actingAs($creator)->postJson("/api/projects/{$project->id}/transfer", [
            'new_creator_id' => $newOwner->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'creator_id' => $newOwner->id]);
    }
}
