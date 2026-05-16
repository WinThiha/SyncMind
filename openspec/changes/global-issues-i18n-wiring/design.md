## Context

The `/issues` page renders a global issues list with project filtering, quick filters, advanced filters, search, and a "new issue" modal. All UI text is hardcoded English despite the translation catalog already having keys under `issues.global.*` (35+ keys) and `issues.search.*`.

## Goals / Non-Goals

**Goals:**
- Replace every visible hardcoded string on `/issues/page.tsx` with a `t()` call
- Ensure all 6 locales have complete `issues.global.*` coverage

**Non-Goals:**
- No data model or API changes
- No restructuring of the quickFilters data array
- No refactoring of the filter dropdown values (status/priority/type labels)
- Not adding new strings — only wiring existing keys

## Decisions

**Approach: Direct substitution**

For each hardcoded string, find the matching `issues.global.*` or `issues.search.*` key from the catalog and replace. Example:

```
"Issues"              → {t('issues.global.title')}
"Hide Filters"       → {t('issues.global.filters.hideFilters')}
"matching issues"    → {t('issues.global.search.matchingIssues', { count: finalIssues.length })}
```

For `matchingIssues` and similar keys with `{count}` interpolation, pass the value as a param.

**Key mapping reference (page line → translation key):**

| Page text | Translation key |
|-----------|-----------------|
| `Issues` (h1) | `issues.global.title` |
| `Showing work assigned to you...` | `issues.global.subtitle` |
| `New Issue` | `issues.global.newIssue` |
| `Project` (label) | `issues.global.projectPickerLabel` |
| `All projects` | `issues.global.allProjects` |
| `Search issues, keys, descriptions...` | `issues.global.search.placeholder` |
| `Search` (button) | `issues.global.search.action` (new key) |
| `Hide Filters` / `Show Filters` | `issues.global.filters.hideFilters` / `issues.global.filters.showFilters` |
| `ALL STATUS`, `OPEN`, etc. | `issues.search.allStatus`, `issues.search.statusOpen` |
| `ALL PRIORITY`, etc. | `issues.search.allPriority`, `issues.search.priorityHigh` |
| `ALL TYPE`, `Bug`, etc. | `issues.search.allType`, `issues.search.typeBug` |
| `Due Date Range` | `issues.global.filters.dueDateRange` |
| `{count} matching issues` | `issues.global.search.matchingIssues` |
| `Sorted by recently updated` | `issues.global.search.sortedByRecent` |
| `Reset` | `issues.global.search.resetFilters` |
| `AI is searching for similar issues...` | `issues.search.aiSearching` |
| `AI couldn't find any relevant issues` | `issues.search.aiNoResults` |
| `No issues found matching your filters` | `issues.search.noResults` |
| `% match` | `issues.search.matchPercent` (new key) |
| `comments` | `issues.global.comments` (new key) |
| `Updated` | `issues.global.updated` (new key) |
| `Select project for new issue` | `issues.global.newIssueSelectProject` |
| `Choose which project to create the issue in.` | `issues.global.newIssueSelectProjectDesc` |
| `Cancel` | `common.cancel` (existing) |

## Risks / Trade-offs

**Risk: Key not found in catalog** → Some keys may not exist in certain locales. If `t()` falls back to the key itself (no translation found), English will show. After implementation, run through each locale manually to verify.

**Risk: New keys needed** → A few strings (`Search` button label, `% match`, `comments`, `Updated`) don't have existing keys. They will be added as new keys to all catalogs. This is unavoidable with Approach A.

**Mitigation for both:** After first pass, run `docker compose exec frontend npm run test` to catch any runtime errors from missing keys.