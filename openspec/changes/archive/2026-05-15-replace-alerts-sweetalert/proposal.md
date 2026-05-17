# Proposal: Replace Browser Alerts with SweetAlert2

## What

Replace all native `confirm()` and `window.confirm()` calls in the frontend with SweetAlert2 modals. All button labels and messages in these dialogs must be localised across the five supported languages (en, ja-JP, my-MM, km-KH, vi-VN).

## Why

The native browser `confirm()` dialog is unbranded, blocks the JS thread, ignores the app's dark/light theme, and cannot be styled or localised. It breaks the visual experience and makes internationalisation of destructive-action prompts impossible. SweetAlert2 is a well-maintained, accessible, Promise-based replacement that supports custom classes, theming, and localised button text.

## Scope

**5 call sites across 4 files:**

| File | Trigger | Message key |
|------|---------|-------------|
| `components/projects/ProjectSettings.tsx:51` | Delete project | `projects.settings.confirmDelete` |
| `components/projects/ProjectSettings.tsx:75` | Transfer ownership | `projects.settings.confirmTransfer` |
| `components/milestones/EditMilestoneForm.tsx:70` | Delete milestone | `milestones.delete.confirm` |
| `components/projects/MemberManagement.tsx:93` | Remove member | `projects.members.confirmRemove` |
| `components/issues/IssueDetailView.tsx:340` | Discard comment | `issues.detail.discardConfirm` |

**Out of scope:** Toast notifications, success/error banners — only destructive-confirm dialogs.

## Success Criteria

- Zero native `confirm()` / `window.confirm()` calls remain in `frontend/src`
- SweetAlert2 modal matches the app's dark/light theme and glass aesthetic
- Confirm and Cancel button labels are localised in all 5 languages
- Behaviour is identical to before (action proceeds on confirm, cancels on dismiss)
