<?php

namespace Tests\Feature;

use App\Mail\IssueCommentNotification;
use App\Mail\MemberAddedMail;
use App\Mail\ProjectInvitationMail;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Services\AI\Contracts\ChatCompletionClient;
use App\Services\AIIssueSuggestionService;
use App\Services\AIThreadSummarizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Mockery;
use Tests\TestCase;

class LocaleEndToEndIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_saved_locale_propagates_to_settings_response(): void
    {
        $user = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'ja-JP']],
        ]);

        $this->actingAs($user, 'web')
            ->getJson('/api/user/settings')
            ->assertOk()
            ->assertJsonPath('data.preferences.locale', 'ja-JP');
    }

    public function test_inviter_locale_is_used_in_project_invitation_email(): void
    {
        Mail::fake();

        $inviter = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'ja-JP']],
        ]);
        $project = Project::factory()->create(['creator_id' => $inviter->id, 'name' => 'Neon']);
        $project->members()->attach($inviter->id, ['role' => 'admin']);

        $this->actingAs($inviter)
            ->postJson("/api/projects/{$project->id}/invitations", [
                'email' => 'invitee@example.com',
                'role' => 'admin',
            ])
            ->assertOk();

        Mail::assertQueued(ProjectInvitationMail::class, function (ProjectInvitationMail $mail) {
            return $mail->selectedLocale === 'ja-JP'
                && $mail->envelope()->subject === 'SyncMind の Neon への招待';
        });
    }

    public function test_recipient_locale_is_used_in_comment_notification_email(): void
    {
        Mail::fake();

        $creator = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'my-MM']],
        ]);
        $commenter = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $creator->id]);
        $project->members()->attach($commenter->id, ['role' => 'normal']);
        $project->members()->attach($creator->id, ['role' => 'admin']);

        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'creator_id' => $creator->id,
        ]);

        $this->actingAs($commenter)
            ->postJson("/api/projects/{$project->id}/issues/{$issue->full_key}/comments", [
                'content' => 'New comment',
                'notify_emails' => true,
            ])
            ->assertStatus(201);

        Mail::assertQueued(IssueCommentNotification::class, function (IssueCommentNotification $mail) use ($creator) {
            return $mail->hasTo($creator->email)
                && $mail->selectedLocale === 'my-MM'
                && str_contains($mail->envelope()->subject, 'မှတ်ချက်အသစ်');
        });
    }

    public function test_member_added_email_uses_recipient_locale(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'vi-VN']],
        ]);
        $newMember = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'vi-VN']],
        ]);
        $project = Project::factory()->create(['creator_id' => $admin->id, 'name' => 'Delta']);
        $project->members()->attach($admin->id, ['role' => 'admin']);

        $this->actingAs($admin)
            ->postJson("/api/projects/{$project->id}/members", [
                'email' => $newMember->email,
                'role' => 'normal',
            ])
            ->assertStatus(201);

        Mail::assertQueued(MemberAddedMail::class, function (MemberAddedMail $mail) {
            return $mail->selectedLocale === 'vi-VN'
                && $mail->envelope()->subject === 'Bạn đã được thêm vào Delta trên SyncMind';
        });
    }

    public function test_saved_locale_appears_in_ai_issue_suggestion_prompt(): void
    {
        $user = User::factory()->create([
            'position' => 'Backend Engineer',
            'settings' => ['preferences' => ['locale' => 'km-KH']],
        ]);
        $project = Project::factory()->create([
            'creator_id' => $user->id,
            'issue_types' => ['Task', 'Bug', 'Story'],
        ]);
        $project->members()->attach($user->id, ['role' => 'admin']);

        $mock = Mockery::mock(ChatCompletionClient::class);
        $mock->shouldReceive('complete')
            ->once()
            ->withArgs(function (array $messages): bool {
                return isset($messages[0]['content'])
                    && str_contains($messages[0]['content'], 'Output language: Khmer (Cambodia) (km-KH)')
                    && str_contains($messages[0]['content'], 'Khmer (Cambodia)');
            })
            ->andReturn(json_encode([
                'summary' => 'Localized summary',
                'description' => 'Localized description',
                'issue_type' => 'Bug',
                'priority' => 'high',
                'estimated_hours' => 4,
                'due_date' => null,
                'milestone_id' => null,
                'assignee_suggestions' => [
                    ['assignee_id' => $user->id, 'reason' => 'Localized reason'],
                ],
                'open_questions' => [],
            ], JSON_THROW_ON_ERROR));

        $this->app->instance(ChatCompletionClient::class, $mock);

        $result = app(AIIssueSuggestionService::class)->suggest($project, 'Test summary', $user);

        $this->assertSame('Localized description', $result['description']);
        $this->assertSame('Bug', $result['issue_type']);
        $this->assertSame('high', $result['priority']);
    }

    public function test_saved_locale_appears_in_ai_thread_summarization_prompt(): void
    {
        $user = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'vi-VN']],
        ]);
        $project = Project::factory()->create(['creator_id' => $user->id]);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'creator_id' => $user->id,
            'assignee_id' => $user->id,
            'summary' => 'Test issue',
        ]);

        Comment::create([
            'issue_id' => $issue->id,
            'user_id' => $user->id,
            'content' => 'Test comment',
        ]);

        $mock = Mockery::mock(ChatCompletionClient::class);
        $mock->shouldReceive('complete')
            ->once()
            ->withArgs(function (array $messages): bool {
                return isset($messages[0]['content'])
                    && str_contains($messages[0]['content'], 'Output language locale: vi-VN')
                    && str_contains($messages[0]['content'], 'Vietnamese');
            })
            ->andReturn(json_encode([
                'summary' => 'Localized summary',
                'decisions' => ['Decision 1'],
                'consensus' => 'Consensus',
                'action_items' => ['Action 1'],
            ], JSON_THROW_ON_ERROR));

        $this->app->instance(ChatCompletionClient::class, $mock);

        $result = app(AIThreadSummarizationService::class)->summarize($issue, $user);

        $this->assertSame('Localized summary', $result['summary']);
        $this->assertSame(['Decision 1'], $result['decisions']);
    }

    public function test_locale_change_flows_through_end_to_end(): void
    {
        $user = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'en']],
        ]);

        // Step 1: Update locale to ja-JP
        $this->actingAs($user, 'web')
            ->putJson('/api/user/settings', [
                'preferences' => [
                    'locale' => 'ja-JP',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.preferences.locale', 'ja-JP');

        // Step 2: Verify settings read returns the new locale
        $this->actingAs($user, 'web')
            ->getJson('/api/user/settings')
            ->assertOk()
            ->assertJsonPath('data.preferences.locale', 'ja-JP');

        // Step 3: Verify email localization uses the new locale
        Mail::fake();
        $project = Project::factory()->create(['creator_id' => $user->id, 'name' => 'Omega']);
        $project->members()->attach($user->id, ['role' => 'admin']);

        $this->actingAs($user)
            ->postJson("/api/projects/{$project->id}/invitations", [
                'email' => 'test@example.com',
                'role' => 'normal',
            ])
            ->assertOk();

        Mail::assertQueued(ProjectInvitationMail::class, function (ProjectInvitationMail $mail) {
            return $mail->selectedLocale === 'ja-JP';
        });
    }
}
