# Tasks: Replace Browser Alerts with SweetAlert2

## Setup

- [x] Install `sweetalert2` npm package in `frontend/`

## Central Utility

- [x] Create `frontend/src/lib/alert.ts` — export `confirmAction(opts: ConfirmOptions): Promise<boolean>` wrapping SweetAlert2 with dark-mode detection and `customClass` styling (no `buttonsStyling`)

## Theme CSS

- [x] Create `frontend/src/styles/sweetalert.css` — `.swal-glass`, `.swal-btn-primary`, `.swal-btn-danger`, `.swal-btn-secondary` using the app's CSS variables
- [x] Add `@import "../styles/sweetalert.css";` to `frontend/src/app/globals.css`

## Localisation — English

- [x] Add 6 keys to `frontend/src/lib/i18n/translations/en/common.ts`: `common.confirm`, `common.yesDelete`, `common.yesTransfer`, `common.yesRemove`, `common.discard`, `common.areYouSure`

## Localisation — Other Languages

- [x] Add translated equivalents of the 6 keys to `frontend/src/lib/i18n/translations/ja-JP/index.ts`
- [x] Add translated equivalents of the 6 keys to `frontend/src/lib/i18n/translations/my-MM/index.ts`
- [x] Add translated equivalents of the 6 keys to `frontend/src/lib/i18n/translations/km-KH/index.ts`
- [x] Add translated equivalents of the 6 keys to `frontend/src/lib/i18n/translations/vi-VN/index.ts`

## Call-site Replacements

- [x] Replace `confirm()` on delete in `frontend/src/components/projects/ProjectSettings.tsx:51` — use `confirmAction` with `danger: true` and `confirmText: t('common.yesDelete')`; make handler `async`
- [x] Replace `confirm()` on transfer in `frontend/src/components/projects/ProjectSettings.tsx:75` — use `confirmAction` with `confirmText: t('common.yesTransfer')`; make handler `async`
- [x] Replace `confirm()` in `frontend/src/components/milestones/EditMilestoneForm.tsx:70` — use `confirmAction` with `danger: true` and `confirmText: t('common.yesDelete')`; make handler `async`
- [x] Replace `confirm()` in `frontend/src/components/projects/MemberManagement.tsx:93` — use `confirmAction` with `danger: true` and `confirmText: t('common.yesRemove')`; make handler `async`
- [x] Replace `window.confirm()` in `frontend/src/components/issues/IssueDetailView.tsx:340` — use `confirmAction` with `confirmText: t('common.discard')`; make handler `async`

## Verification

- [x] Confirm zero `confirm(` / `window.confirm(` occurrences remain under `frontend/src/`
