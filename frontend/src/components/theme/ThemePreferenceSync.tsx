'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getUserSettings } from '@/lib/api/settings';

export function ThemePreferenceSync() {
  const { user, loading } = useAuth();
  const { applySavedThemePreference } = useTheme();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    let cancelled = false;

    async function syncThemePreference() {
      try {
        const settings = await getUserSettings();
        if (!cancelled) {
          applySavedThemePreference(settings.preferences.theme ?? 'system');
        }
      } catch {
        if (!cancelled) {
          applySavedThemePreference('system');
        }
      }
    }

    syncThemePreference();

    return () => {
      cancelled = true;
    };
  }, [loading, user, applySavedThemePreference]);

  return null;
}
