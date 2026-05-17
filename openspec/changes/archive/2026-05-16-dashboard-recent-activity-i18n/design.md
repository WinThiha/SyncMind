## Context

The `ActivityItem` component in `frontend/src/app/dashboard/page.tsx` renders activity descriptions using pre-composed English text from the backend's `text` field. The backend constructs strings like:

```
"{actor} commented on {issue_key}"
"{actor} changed {field} on {issue_key}"
```

These are rendered verbatim in the frontend via `{activity.text}`. The frontend receives structured data (`type`, `actor`, `issue_key`, `field`, `old_value`, `new_value`) but ignores it, using only the pre-composed `text`.

This blocks translation because the strings are already baked in PHP.

Additionally, the icon container uses `p-2` padding which creates variable height based on content. When text wraps to multiple lines, the icon misaligns vertically because only `mt-0.5` is used for top-offset, not proper vertical centering.

## Goals / Non-Goals

**Goals:**
- Replace `activity.text` rendering with composed translations using `t()` and structured data
- Add translation keys for `commented` and `changed` activity types with `{actor}` and `{issue}` params
- Fix icon container to use fixed height (`h-[44px]`) with vertical centering (`items-center`)
- Cover all 6 locales (en, my-MM, ja-JP, vi-VN, km-KH, ko-KR)

**Non-Goals:**
- No backend changes (API already sends structured fields)
- No new spec files (this is a wiring-only change)
- No changes to data model or API contract

## Decisions

**Approach: Frontend composition from structured data**

The API already sends `type`, `actor`, `issue_key`, and `field` as separate fields. The frontend will ignore `text` and compose display strings using translation keys:

```
Activity type: 'comment'
{ t('dashboard.activity.commented', { actor: activity.actor, issue: activity.issue_key }) }

Activity type: 'history'
{ t('dashboard.activity.changed', { actor: activity.actor, field: activity.field, issue: activity.issue_key }) }
```

**Why not backend i18n?** Backend would need locale detection and translation injection. Frontend already has the i18n system wired up with all 6 locales. Keeping translations on the frontend follows existing patterns used elsewhere in the app.

**Icon height fix**: Change from `p-2` to `h-[44px] items-center`. Fixed height ensures consistent sizing regardless of text wrapping. `items-center` vertically centers the icon within the fixed height container.

## Risks / Trade-offs

**Risk: Fallback to English** — Non-English locales that haven't added translations will fall back to English keys. Mitigation: Add translations for all 6 locales in this change.

**Risk: Missing actor** — API sometimes sends `actor: null`. Mitigation: Use fallback string "Someone" in translation params, or add null handling in component.

**Risk: Field name casing** — `field` from API uses lowercase (e.g., "status", "assignee"). Translation keys use lowercase for consistency. This is already consistent with existing patterns.

## Translation Keys

```typescript
// English (en/dashboard.ts)
'dashboard.activity.commented': '{actor} commented on {issue}'
'dashboard.activity.changed': '{actor} changed {field} on {issue}'
```

All 6 locales will be updated with these keys. Non-English locales use English as fallback until their translations are added.