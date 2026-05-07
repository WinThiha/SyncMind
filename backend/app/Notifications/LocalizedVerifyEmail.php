<?php

namespace App\Notifications;

use App\Support\LocaleResolver;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class LocalizedVerifyEmail extends VerifyEmail
{
    public function toMail($notifiable): MailMessage
    {
        $locale = app(LocaleResolver::class)->resolveForUser($notifiable);
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject(trans('mail.auth_verify.subject', [], $locale))
            ->line(trans('mail.auth_verify.line1', [], $locale))
            ->action(trans('mail.auth_verify.action', [], $locale), $verificationUrl)
            ->line(trans('mail.auth_verify.line2', [], $locale));
    }
}
