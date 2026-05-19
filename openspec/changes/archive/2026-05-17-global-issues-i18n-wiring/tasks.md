## 1. Add Missing Translation Keys

- [x] 1.1 Add new keys to `en/issues.ts`:
  - `issues.global.search.action` = 'Search'
  - `issues.global.filters.hideFilters` = 'Hide Filters'
  - `issues.global.filters.showFilters` = 'Show Filters'
  - `issues.global.search.matchPercent` = '{percent}% match'
  - `issues.global.comments` = 'comments'
  - `issues.global.updated` = 'Updated'
  - `issues.global.filters.dueDateRange` = 'Due Date Range'
  - `issues.search.typeBug` = 'Bug'
  - `issues.search.typeTask` = 'Task'
  - `issues.search.typeFeature` = 'Feature'
  - `issues.search.typeStory` = 'Story'

## 2. Add Missing Keys to Non-English Locales

- [x] 2.1 Add new keys + `issues.global.*` keys to `ja-JP/index.ts`
- [x] 2.2 Add new keys + `issues.global.*` keys to `vi-VN/index.ts`
- [x] 2.3 Add new keys + `issues.global.*` keys to `my-MM/index.ts`
- [x] 2.4 Add new keys + `issues.global.*` keys to `km-KH/index.ts`

## 3. Wire Up `/issues/page.tsx` with t() Calls

- [x] 3.1 Replace header strings (title, subtitle, New Issue button)
- [x] 3.2 Replace project picker label and "All projects" option
- [x] 3.3 Replace search input placeholder and Search button
- [x] 3.4 Replace quick filter labels (All, Assigned to Me, Overdue, High Priority, Unassigned)
- [x] 3.5 Replace "Show Filters" / "Hide Filters" toggle
- [x] 3.6 Replace filter dropdown labels (ALL STATUS, ALL PRIORITY, ALL TYPE, Due Date Range)
- [x] 3.7 Replace result count ("{count} matching issues") and "Sorted by recently updated"
- [x] 3.8 Replace Reset button text
- [x] 3.9 Replace AI search loading text ("AI is searching for similar issues...")
- [x] 3.10 Replace empty state messages (AI no results, no issues found)
- [x] 3.11 Replace issue card metadata ("comments", "Updated {date}")
- [x] 3.12 Replace new issue modal text (title, description, Cancel)
- [x] 3.13 Add missing keys to ko-KR catalog (same new keys only)

## 4. Verify

- [x] 4.1 Run `docker compose exec frontend npm run test` ✓ 54 passed
- [x] 4.2 Run `docker compose exec frontend npm run lint` ✓ (warnings only, no new errors)