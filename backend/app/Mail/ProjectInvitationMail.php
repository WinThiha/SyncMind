<?php

namespace App\Mail;

use App\Models\ProjectInvitation;
use App\Support\LocaleResolver;
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
    public string $selectedLocale;

    public function __construct(public ProjectInvitation $invitation, ?string $locale = null)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $this->acceptUrl = $frontendUrl.'/invitations/'.$invitation->token;
        $this->selectedLocale = $locale ?: LocaleResolver::DEFAULT_LOCALE;
        $this->locale($this->selectedLocale);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: trans('mail.project_invitation.subject', ['project' => $this->invitation->project->name], $this->selectedLocale),
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
