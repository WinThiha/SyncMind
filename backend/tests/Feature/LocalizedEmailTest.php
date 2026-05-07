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
use App\Notifications\LocalizedResetPassword;
use App\Notifications\LocalizedVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocalizedEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_invitation_mailable_uses_locale_subject_and_copy(): void
    {
        $inviter = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $inviter->id, 'name' => 'Neon']);
        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'invitee@example.com',
            'role' => 'admin',
            'position' => null,
            'token' => bin2hex(random_bytes(8)),
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->load('project', 'inviter');

        $mail = new ProjectInvitationMail($invitation, 'ja-JP');

        $this->assertSame('SyncMind の Neon への招待', $mail->envelope()->subject);
        $this->assertStringContainsString('招待を承認', $mail->render());
    }

    public function test_member_added_mailable_uses_locale_subject(): void
    {
        $addedBy = User::factory()->create();
        $invitee = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $addedBy->id, 'name' => 'Delta']);
        $project->members()->attach($invitee->id, ['role' => 'normal', 'position' => null]);

        $mail = new MemberAddedMail($invitee, $project, $addedBy, 'vi-VN');

        $this->assertSame('Bạn đã được thêm vào Delta trên SyncMind', $mail->envelope()->subject);
    }

    public function test_issue_comment_mailable_uses_locale_subject(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create(['creator_id' => $user->id]);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'creator_id' => $user->id,
            'assignee_id' => $user->id,
            'summary' => 'Fix locale bug',
        ]);

        $comment = Comment::create([
            'issue_id' => $issue->id,
            'user_id' => $user->id,
            'content' => 'Please update language resources.',
        ]);

        $mail = new IssueCommentNotification($comment, 'my-MM');

        $this->assertStringContainsString('မှတ်ချက်အသစ်', $mail->envelope()->subject);
    }

    public function test_auth_notifications_use_user_locale(): void
    {
        $user = User::factory()->create([
            'settings' => ['preferences' => ['locale' => 'ja-JP']],
        ]);

        $verify = (new LocalizedVerifyEmail())->toMail($user);
        $reset = (new LocalizedResetPassword('token'))->toMail($user);

        $this->assertSame('メールアドレスの確認', $verify->subject);
        $this->assertSame('パスワード再設定通知', $reset->subject);
    }
}

