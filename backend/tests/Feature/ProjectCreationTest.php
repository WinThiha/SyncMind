<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registered_user_can_create_project()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'name' => 'Test Project',
            'key' => 'TEST',
            'issue_types' => ['Task', 'Bug'],
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.name', 'Test Project')
                 ->assertJsonPath('data.key', 'TEST');

        $this->assertDatabaseHas('projects', [
            'key' => 'TEST',
            'creator_id' => $user->id,
        ]);

        $this->assertDatabaseHas('project_members', [
            'user_id' => $user->id,
            'role' => 'admin',
        ]);
    }

    public function test_project_key_must_be_unique()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Project::factory()->create([
            'key' => 'UNIQUE',
            'creator_id' => $user1->id,
        ]);

        $response = $this->actingAs($user2)->postJson('/api/projects', [
            'name' => 'Another Project',
            'key' => 'UNIQUE',
            'issue_types' => ['Task'],
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['key']);
    }
    
    public function test_project_key_must_be_uppercase_alpha()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'name' => 'Another Project',
            'key' => 'invalid-key123',
            'issue_types' => ['Task'],
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['key']);
    }
}
