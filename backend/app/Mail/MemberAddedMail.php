<?php

namespace App\Mail;

use App\Models\Project;
use App\Models\User;
use App\Support\LocaleResolver;
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
    public string $selectedLocale;

    public function __construct(
        public User $invitee,
        public Project $project,
        public User $addedBy,
        ?string $locale = null
    ) {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $this->projectUrl = $frontendUrl.'/projects/'.$project->id;
        $this->selectedLocale = $locale ?: LocaleResolver::DEFAULT_LOCALE;
        $this->locale($this->selectedLocale);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: trans('mail.member_added.subject', ['project' => $this->project->name], $this->selectedLocale),
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
