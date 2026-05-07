'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { getUserSettings } from '@/lib/api/settings';

export function LocalePreferenceSync() {
  const { user, loading } = useAuth();
  const { setLocale } = useLocale();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    let cancelled = false;

    async function syncLocalePreference() {
      try {
        const settings = await getUserSettings();
        if (!cancelled) {
          setLocale(settings.preferences.locale ?? 'en');
        }
      } catch {
        // Keep the existing locale if the settings fetch fails.
      }
    }

    syncLocalePreference();

    return () => {
      cancelled = true;
    };
  }, [loading, user, setLocale]);

  return null;
}
