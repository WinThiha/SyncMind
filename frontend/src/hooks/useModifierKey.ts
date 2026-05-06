import { useSyncExternalStore } from 'react';

// Platform never changes during a session — subscriber is a no-op.
const subscribe = () => () => {};

const getSnapshot = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const getServerSnapshot = () => false; // SSR always returns false (no hydration mismatch)

/**
 * Returns the primary modifier key label for the current platform.
 * Server-renders as "Ctrl" (Windows default) and hydrates to the real value.
 */
export function useModifierKey() {
  const isMac = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    isMac,
    modKey: isMac ? '⌘' : 'Ctrl',
  };
}
