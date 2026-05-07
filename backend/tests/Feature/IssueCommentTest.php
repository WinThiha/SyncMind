<?php

namespace Tests\Feature;

use App\Mail\IssueCommentNotification;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class IssueCommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_add_comment(): void
    {
        $member = User::factory()->create();
        $project = Project::factory()->create();
        $project->members()->attach($member->id, ['role' => 'member']);

        $issue = Issue::factory()->create(['project_id' => $project->id]);

        $response = $this->actingAs($member)
            ->postJson("/api/projects/{$project->id}/issues/{$issue->full_key}/comments", [
                'content' => 'My first comment',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('issue_comments', [
            'issue_id' => $issue->id,
            'user_id' => $member->id,
            'content' => 'My first comment',
        ]);
    }

    public function test_email_notification_is_sent_when_requested(): void
    {
        Mail::fake();

        $member = User::factory()->create();
        $creator = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($member->id, ['role' => 'member']);
        $project->members()->attach($creator->id, ['role' => 'admin']);

        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'creator_id' => $creator->id,
        ]);

        $response = $this->actingAs($member)
            ->postJson("/api/projects/{$project->id}/issues/{$issue->full_key}/comments", [
                'content' => 'Notify you!',
                'notify_emails' => true,
            ]);

        $response->assertStatus(201);

        Mail::assertQueued(IssueCommentNotification::class, function ($mail) use ($creator) {
            return $mail->hasTo($creator->email);
        });
    }

    public function test_non_member_cannot_add_comment(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();
        $issue = Issue::factory()->create(['project_id' => $project->id]);

        $response = $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/issues/{$issue->full_key}/comments", [
                'content' => 'Intruder',
            ]);

        $response->assertStatus(403);
    }
}
