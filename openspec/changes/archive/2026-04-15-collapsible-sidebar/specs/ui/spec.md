## MODIFIED Requirements

### Requirement: Issue creation UI handles dark mode correctly
The system MUST render the issue creation forms properly in dark mode, ensuring text is legible.

#### Scenario: User views the issue creation form in dark mode
- **WHEN** user enables dark mode and navigates to the issue creation page
- **THEN** the Markdown Editor and Assignee select dropdown render with correct contrast

## ADDED Requirements

### Requirement: Authenticated layout offsets react to sidebar collapsed state
The Topbar and main content area MUST use dynamic horizontal offsets driven by SidebarContext instead of hardcoded pixel values.

#### Scenario: Topbar uses dynamic left offset
- **WHEN** the sidebar state changes between collapsed and expanded
- **THEN** the Topbar's `left` CSS property transitions between `64px` and `256px` respectively

#### Scenario: Main content uses dynamic margin-left
- **WHEN** the sidebar state changes between collapsed and expanded
- **THEN** the main content area's `margin-left` CSS property transitions between `64px` and `256px` respectively
