<?php

namespace App\Mail;

use App\Models\ProjectInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(public ProjectInvitation $invitation)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $this->acceptUrl = $frontendUrl.'/invitations/'.$invitation->token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You\'ve been invited to join '.$this->invitation->project->name.' on SyncMind',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-invitation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
