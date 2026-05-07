<?php

namespace App\Notifications;

use App\Support\LocaleResolver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class LocalizedResetPassword extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $locale = app(LocaleResolver::class)->resolveForUser($notifiable);
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject(trans('mail.auth_reset.subject', [], $locale))
            ->line(trans('mail.auth_reset.line1', [], $locale))
            ->action(trans('mail.auth_reset.action', [], $locale), $url)
            ->line(trans('mail.auth_reset.line2', [], $locale));
    }
}
