<?php

namespace App\Support;

use App\Models\User;

class LocaleResolver
{
    public const DEFAULT_LOCALE = 'en';

    /** @var array<int, string> */
    public const SUPPORTED_LOCALES = [
        'en',
        'my-MM',
        'ja-JP',
        'vi-VN',
        'km-KH',
    ];

    public function resolveForUser(?User $user): string
    {
        if (! $user) {
            return self::DEFAULT_LOCALE;
        }

        $settings = is_array($user->settings) ? $user->settings : [];
        $preferences = is_array($settings['preferences'] ?? null) ? $settings['preferences'] : [];
        $candidate = $preferences['locale'] ?? null;

        return $this->normalize($candidate);
    }

    public function normalize(mixed $value): string
    {
        if (! is_string($value)) {
            return self::DEFAULT_LOCALE;
        }

        return in_array($value, self::SUPPORTED_LOCALES, true)
            ? $value
            : self::DEFAULT_LOCALE;
    }

    public function humanLabel(string $locale): string
    {
        return match ($locale) {
            'my-MM' => 'Burmese (Myanmar)',
            'ja-JP' => 'Japanese',
            'vi-VN' => 'Vietnamese',
            'km-KH' => 'Khmer (Cambodia)',
            default => 'English',
        };
    }
}

