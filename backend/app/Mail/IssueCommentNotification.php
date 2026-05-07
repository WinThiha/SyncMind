<?php

namespace App\Mail;

use App\Models\Comment;
use App\Support\LocaleResolver;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class IssueCommentNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $comment;

    public $issue;

    public string $selectedLocale;

    /**
     * Create a new message instance.
     */
    public function __construct(Comment $comment, ?string $locale = null)
    {
        $this->comment = $comment;
        $this->issue = $comment->issue;
        $this->selectedLocale = $locale ?: LocaleResolver::DEFAULT_LOCALE;
        $this->locale($this->selectedLocale);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: trans('mail.issue_comment.subject', ['key' => $this->issue->full_key, 'summary' => $this->issue->summary], $this->selectedLocale),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.issues.comment',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
