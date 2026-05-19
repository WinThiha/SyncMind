# Design: Replace Browser Alerts with SweetAlert2

## Package

Install `sweetalert2`. No additional theme package needed — styling is done via `customClass` options using the app's existing Tailwind/CSS variables.

```bash
npm install sweetalert2
```

## Central Utility: `src/lib/alert.ts`

A single module exports one async function `confirmAction`. All call sites use this — no component imports SweetAlert2 directly.

```ts
import Swal from 'sweetalert2';

interface ConfirmOptions {
  title: string;
  text: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean; // true → red confirm button
}

export async function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  const isDark = document.documentElement.classList.contains('dark');

  const result = await Swal.fire({
    title: opts.title,
    text: opts.text,
    showCancelButton: true,
    confirmButtonText: opts.confirmText,
    cancelButtonText: opts.cancelText,
    reverseButtons: true,
    background: isDark ? 'hsl(var(--color-background))' : undefined,
    color: isDark ? 'hsl(var(--color-foreground))' : undefined,
    customClass: {
      popup: 'swal-glass',
      confirmButton: opts.danger ? 'swal-btn-danger' : 'swal-btn-primary',
      cancelButton: 'swal-btn-secondary',
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}
```

## Theme CSS: `src/styles/sweetalert.css`

Imported once in `src/app/globals.css`. Uses the app's existing CSS variables and `glass-card` aesthetic.

```css
.swal-glass {
  border-radius: 1rem;
  border: 1px solid hsl(var(--color-border-glow) / 0.2);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.3);
}

.swal-btn-primary,
.swal-btn-danger,
.swal-btn-secondary {
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  transition: opacity 0.15s;
}

.swal-btn-primary  { background: hsl(var(--color-brand-primary)); color: #fff; }
.swal-btn-danger   { background: #ef4444; color: #fff; }
.swal-btn-secondary { background: transparent; border: 1px solid hsl(var(--color-border-glow) / 0.4); }

.swal-btn-primary:hover,
.swal-btn-danger:hover,
.swal-btn-secondary:hover { opacity: 0.85; }
```

## Localisation

Add new keys to `en/common.ts` (and all 4 other language files):

```
common.confirm          — "Confirm"
common.yesDelete        — "Yes, delete"
common.yesTransfer      — "Yes, transfer"
common.yesRemove        — "Yes, remove"
common.discard          — "Discard"
common.areYouSure       — "Are you sure?"
```

Each call site passes `title: t('common.areYouSure')` plus the existing message key as `text`, and the appropriate action-specific confirm key.

## Call-site Pattern

Before:
```ts
if (!confirm(t('projects.settings.confirmDelete'))) return;
```

After:
```ts
const ok = await confirmAction({
  title: t('common.areYouSure'),
  text: t('projects.settings.confirmDelete'),
  confirmText: t('common.yesDelete'),
  cancelText: t('common.cancel'),
  danger: true,
});
if (!ok) return;
```

All affected functions become `async` if they are not already.

## Files Changed

| File | Change |
|------|--------|
| `frontend/package.json` | Add `sweetalert2` dependency |
| `frontend/src/lib/alert.ts` | New — central `confirmAction` utility |
| `frontend/src/styles/sweetalert.css` | New — SweetAlert2 theme overrides |
| `frontend/src/app/globals.css` | Import `sweetalert.css` |
| `frontend/src/lib/i18n/translations/en/common.ts` | Add 6 new keys |
| `frontend/src/lib/i18n/translations/ja-JP/index.ts` | Add 6 translated keys |
| `frontend/src/lib/i18n/translations/my-MM/index.ts` | Add 6 translated keys |
| `frontend/src/lib/i18n/translations/km-KH/index.ts` | Add 6 translated keys |
| `frontend/src/lib/i18n/translations/vi-VN/index.ts` | Add 6 translated keys |
| `frontend/src/components/projects/ProjectSettings.tsx` | Replace 2 `confirm()` calls |
| `frontend/src/components/milestones/EditMilestoneForm.tsx` | Replace 1 `confirm()` call |
| `frontend/src/components/projects/MemberManagement.tsx` | Replace 1 `confirm()` call |
| `frontend/src/components/issues/IssueDetailView.tsx` | Replace 1 `window.confirm()` call |
