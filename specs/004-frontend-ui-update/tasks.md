# Tasks: Frontend UI Update

**Input**: Design documents from `/specs/004-frontend-ui-update/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `framer-motion` and `lucide-react` in `frontend/`
- [x] T002 Create `frontend/src/styles/glass.css` for Glassmorphism utility classes
- [x] T003 [P] Create `frontend/src/lib/animations.ts` with spring constants per research.md
- [x] T004 [P] Initialize `frontend/tests/dashboard.test.tsx` for Vitest setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for Glassmorphism and Theme management

**⚠️ CRITICAL**: Must complete before starting user story implementation

- [x] T005 Define CSS variables for light blue theme and glass effects in `frontend/src/app/globals.css`
- [x] T006 Implement `ThemeContext` with `ThemeContextValue` interface in `frontend/src/context/ThemeContext.tsx`
- [x] T007 [P] Implement LocalStorage persistence and system preference sync in `frontend/src/context/ThemeContext.tsx`
- [x] T008 [P] Implement `onPerformanceChange` and `data-performance` attribute in `frontend/src/context/ThemeContext.tsx`
- [x] T009 Create base `GlassCard` component in `frontend/src/components/ui/GlassCard.tsx`
- [x] T010 [P] Implement `useTheme` hook for consuming theme context in `frontend/src/hooks/useTheme.ts`

**Checkpoint**: Foundation ready - UI components can now be built using the theme and glass system.

---

## Phase 3: User Story 1 - Modernized Dashboard (Priority: P1) 🎯 MVP

**Goal**: A modern, light blue dashboard featuring glassmorphic sidebar/topbar and clean geometric typography.

**Independent Test**: Navigate to `/dashboard` and verify FCP < 1.5s, correct light blue theme application, and no layout shifts.

### Tests for User Story 1 (REQUIRED)

- [x] T011 [P] [US1] Create Vitest tests for Dashboard layout in `frontend/tests/dashboard.test.tsx`
- [x] T012 [P] [US1] Create Playwright performance test for SC-001 (navigation < 300ms) and SC-002 (FCP < 1.5s) in `frontend/tests/e2e/performance.spec.ts`

### Implementation for User Story 1

- [x] T013 [US1] Configure Inter/Geist fonts and base typography in `frontend/src/app/layout.tsx`
- [x] T014 [P] [US1] Implement glassmorphic `Sidebar` with translucency in `frontend/src/components/layout/Sidebar.tsx`
- [x] T015 [P] [US1] Implement glassmorphic `Topbar` in `frontend/src/components/layout/Topbar.tsx`
- [x] T016 [US1] Create `ProjectCard` with glass style and hover glow in `frontend/src/components/dashboard/ProjectCard.tsx`
- [x] T017 [US1] Update Dashboard page to use `Sidebar`, `Topbar`, and `ProjectCard` in `frontend/src/app/dashboard/page.tsx`
- [x] T018 [US1] Apply light blue theme as primary brand color in `frontend/src/styles/globals.css`

**Checkpoint**: User Story 1 complete - MVP dashboard is functional and stylish.

---

## Phase 4: User Story 2 - Smooth Issue Navigation (Priority: P2)

**Goal**: Fast, spring-based transitions between issues and a responsive detail view.

**Independent Test**: Click issue cards in the list and observe "instant" detail loading with spring motion; verify no horizontal scroll on mobile.

### Tests for User Story 2 (REQUIRED)

- [x] T019 [P] [US2] Create Playwright tests for mobile (320px) and tablet (768px) responsiveness in `frontend/tests/e2e/responsive.spec.ts`
- [x] T020 [P] [US2] Create Vitest tests for navigation transitions in `frontend/tests/navigation.test.tsx`

### Implementation for User Story 2

- [x] T021 [US2] Implement `AnimatePresence` wrapper for page transitions in `frontend/src/components/layout/TransitionWrapper.tsx`
- [x] T022 [P] [US2] Create responsive, glassmorphic `IssueDetailView` in `frontend/src/components/issues/IssueDetailView.tsx`
- [x] T023 [US2] Add spring-based hover elevations to `IssueListItem` in `frontend/src/components/issues/IssueListItem.tsx`
- [x] T024 [US2] Update Issue list page with smooth transitions in `frontend/src/app/projects/[id]/issues/page.tsx`

**Checkpoint**: User Story 2 complete - Navigation feels "fast" and transitions are smooth.

---

## Phase 5: User Story 3 - Stylish Interactive Feedback (Priority: P3)

**Goal**: Visual confidence through stylish feedback on all interactive elements.

**Independent Test**: Hover and click every button/link; verify spring feedback and glassmorphic loading indicators.

### Tests for User Story 3 (REQUIRED)

- [x] T025 [P] [US3] Create Vitest tests for `GlassButton` interaction states in `frontend/tests/ui-components.test.tsx`

### Implementation for User Story 3

- [x] T026 [P] [US3] Create `GlassButton` with spring-based scale feedback in `frontend/src/components/ui/GlassButton.tsx`
- [x] T027 [US3] Implement glassmorphic `LoadingOverlay` for async operations in `frontend/src/components/ui/LoadingOverlay.tsx`
- [x] T028 [US3] Implement `SkeletonCard` for dashboard/issue list loading states in `frontend/src/components/ui/SkeletonCard.tsx`
- [x] T029 [US3] Apply interactive feedback styles and Lucide icons to all primary actions in `frontend/src/components/`

**Checkpoint**: User Story 3 complete - The UI feels highly interactive and polished.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final optimizations and graceful degradation.

- [x] T030 [P] Implement automatic glassmorphism degradation for low-end devices (FCP/FPS-based) in `frontend/src/styles/glass.css`
- [x] T031 [P] Finalize Adaptive Dark Mode color mappings in `frontend/src/styles/globals.css`
- [x] T032 [P] Run final accessibility and performance audits (Lighthouse/Performance tab)
- [x] T033 Update `frontend/README.md` with new UI/UX guidelines and Glassmorphism usage
- [x] T034 Run validation check from `specs/004-frontend-ui-update/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2.
- **US2 (P2)**: Independent after Phase 2.
- **US3 (P3)**: Depends on components from US1/US2 but can be implemented partially in parallel.

### Parallel Opportunities

- All Setup tasks marked [P]
- Foundational tasks T007, T008, T010
- All tests marked [P] within their respective phases
- Component implementations (Sidebar, Topbar, GlassButton) can be built in parallel once Foundation is set.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup & Foundational phases.
2. Complete User Story 1 (Modernized Dashboard).
3. **VALIDATE**: Ensure dashboard meets FCP < 1.5s and "stylish" criteria.

### Incremental Delivery

1. Foundation → Theme and Glass system ready.
2. US1 → Dashboard MVP (First Impression).
3. US2 → Navigation speed and responsiveness.
4. US3 → Interaction polish.
5. Polish → Graceful degradation and final audits.
