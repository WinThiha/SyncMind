<?php

namespace Tests\Feature;

use App\Mail\MemberAddedMail;
use App\Mail\ProjectInvitationMail;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProjectInvitationTest extends TestCase
{
    use RefreshDatabase;

    private function makeProjectWithAdmin(): array
    {
        $admin = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $admin->id]);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        return [$admin, $project];
    }

    public function test_admin_inviting_non_existing_email_creates_invitation()
    {
        Mail::fake();
        [$admin, $project] = $this->makeProjectWithAdmin();

        $response = $this->actingAs($admin)->postJson("/api/projects/{$project->id}/members", [
            'email' => 'newuser@example.com',
            'role' => 'normal',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['type' => 'invited']);

        $this->assertDatabaseHas('project_invitations', [
            'project_id' => $project->id,
            'email' => 'newuser@example.com',
            'role' => 'normal',
        ]);

        Mail::assertQueued(ProjectInvitationMail::class, function ($mail) {
            return $mail->hasTo('newuser@example.com');
        });
    }

    public function test_admin_inviting_existing_user_adds_directly()
    {
        Mail::fake();
        [$admin, $project] = $this->makeProjectWithAdmin();
        $existing = User::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/projects/{$project->id}/members", [
            'email' => $existing->email,
            'role' => 'normal',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['type' => 'added']);

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $existing->id,
        ]);

        $this->assertDatabaseMissing('project_invitations', [
            'project_id' => $project->id,
            'email' => $existing->email,
        ]);

        Mail::assertQueued(MemberAddedMail::class);
    }

    public function test_duplicate_pending_invite_returns_409()
    {
        Mail::fake();
        [$admin, $project] = $this->makeProjectWithAdmin();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'pending@example.com',
            'role' => 'normal',
            'token' => bin2hex(random_bytes(32)),
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($admin)->postJson("/api/projects/{$project->id}/members", [
            'email' => 'pending@example.com',
            'role' => 'normal',
        ]);

        $response->assertStatus(409);
    }

    public function test_non_admin_cannot_create_invitation()
    {
        Mail::fake();
        [$admin, $project] = $this->makeProjectWithAdmin();
        $normal = User::factory()->create();
        $project->members()->attach($normal->id, ['role' => 'normal']);

        $response = $this->actingAs($normal)->postJson("/api/projects/{$project->id}/members", [
            'email' => 'someone@example.com',
            'role' => 'normal',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_cancel_pending_invitation()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'cancel@example.com',
            'role' => 'normal',
            'token' => bin2hex(random_bytes(32)),
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($admin)->deleteJson(
            "/api/projects/{$project->id}/invitations/{$invitation->id}"
        );

        $response->assertStatus(200);
        $this->assertDatabaseMissing('project_invitations', ['id' => $invitation->id]);
    }

    public function test_cannot_cancel_accepted_invitation()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'accepted@example.com',
            'role' => 'normal',
            'token' => bin2hex(random_bytes(32)),
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
            'accepted_at' => now(),
        ]);

        $response = $this->actingAs($admin)->deleteJson(
            "/api/projects/{$project->id}/invitations/{$invitation->id}"
        );

        $response->assertStatus(422);
    }

    public function test_show_returns_invite_info_for_valid_token()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'guest@example.com',
            'role' => 'normal',
            'token' => 'validtoken1234',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->getJson('/api/invitations/validtoken1234');

        $response->assertStatus(200)
            ->assertJsonPath('data.project_name', $project->name)
            ->assertJsonPath('data.role', 'normal');
    }

    public function test_show_returns_410_for_expired_token()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'expired@example.com',
            'role' => 'normal',
            'token' => 'expiredtoken5678',
            'invited_by' => $admin->id,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/invitations/expiredtoken5678');

        $response->assertStatus(410);
    }

    public function test_authenticated_user_can_accept_invitation()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();
        $invitee = User::factory()->create();

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => $invitee->email,
            'role' => 'normal',
            'token' => 'accepttoken9999',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->actingAs($invitee)->postJson('/api/invitations/accepttoken9999/accept');

        $response->assertStatus(200)
            ->assertJsonPath('project_id', $project->id);

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $invitee->id,
        ]);

        $this->assertDatabaseHas('project_invitations', [
            'token' => 'accepttoken9999',
        ]);

        $this->assertNotNull(
            ProjectInvitation::where('token', 'accepttoken9999')->first()->accepted_at
        );
    }

    public function test_unauthenticated_user_cannot_accept_invitation()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'unauth@example.com',
            'role' => 'normal',
            'token' => 'unauthtoken0000',
            'invited_by' => $admin->id,
            'expires_at' => now()->addDays(7),
        ]);

        $response = $this->postJson('/api/invitations/unauthtoken0000/accept');

        $response->assertStatus(401);
    }

    public function test_expired_token_cannot_be_accepted()
    {
        [$admin, $project] = $this->makeProjectWithAdmin();
        $invitee = User::factory()->create();

        ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => $invitee->email,
            'role' => 'normal',
            'token' => 'expiredaccept111',
            'invited_by' => $admin->id,
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($invitee)->postJson('/api/invitations/expiredaccept111/accept');

        $response->assertStatus(410);
    }
}
