<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberAddedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $projectUrl;

    public function __construct(
        public User $invitee,
        public Project $project,
        public User $addedBy
    ) {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $this->projectUrl = $frontendUrl.'/projects/'.$project->id;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You\'ve been added to '.$this->project->name.' on SyncMind',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.member-added',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
