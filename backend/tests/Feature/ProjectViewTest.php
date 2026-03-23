<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_their_involved_projects()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $project1 = Project::factory()->create(['creator_id' => $user->id, 'name' => 'Project 1']);
        $project1->members()->attach($user->id, ['role' => 'admin']);

        $project2 = Project::factory()->create(['creator_id' => $otherUser->id, 'name' => 'Project 2']);
        $project2->members()->attach($otherUser->id, ['role' => 'admin']);
        $project2->members()->attach($user->id, ['role' => 'normal']);

        $project3 = Project::factory()->create(['creator_id' => $otherUser->id, 'name' => 'Project 3']);
        $project3->members()->attach($otherUser->id, ['role' => 'admin']);

        $response = $this->actingAs($user)->getJson('/api/projects');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data')
                 ->assertJsonFragment(['name' => 'Project 1'])
                 ->assertJsonFragment(['name' => 'Project 2'])
                 ->assertJsonMissing(['name' => 'Project 3']);
    }

    public function test_user_cannot_view_project_they_are_not_involved_in()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $otherUser->id]);
        $project->members()->attach($otherUser->id, ['role' => 'admin']);

        $response = $this->actingAs($user)->getJson("/api/projects/{$project->id}");

        $response->assertStatus(403);
    }
    
    public function test_user_can_view_project_they_are_involved_in()
    {
        $user = User::factory()->create();

        $project = Project::factory()->create(['creator_id' => $user->id]);
        $project->members()->attach($user->id, ['role' => 'admin']);

        $response = $this->actingAs($user)->getJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $project->id);
    }
}
