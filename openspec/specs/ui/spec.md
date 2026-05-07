## MODIFIED Requirements

### Requirement: Issue creation UI handles dark mode correctly
The system MUST render the issue creation forms properly in dark mode, ensuring text is legible.

#### Scenario: User views the issue creation form in dark mode
- **WHEN** user enables dark mode and navigates to the issue creation page
- **THEN** the Markdown Editor and Assignee select dropdown render with correct contrast

### Requirement: Theme selection persists across navigation
The system MUST preserve the currently active light/dark theme during route navigation, including when opening Settings.

#### Scenario: User navigates to Settings with unsaved server preference
- **GIVEN** the user has dark mode active from local preference
- **AND** the server-side settings record has no explicit saved theme yet
- **WHEN** the user navigates to `/settings`
- **THEN** the UI remains in dark mode and does not switch to light mode automatically

#### Scenario: User saves theme preference from Settings
- **WHEN** the user explicitly saves theme preference in Settings
- **THEN** the saved preference becomes the active theme for subsequent navigation and sessions

### Requirement: Collapsible sidebar layout synchronization
The system SHALL ensure that the Sidebar width, Topbar horizontal offset, and Main Content margin-left are synchronized to exactly 80px (20 units) when the sidebar is in a collapsed state.

#### Scenario: User collapses the sidebar
- **WHEN** the user clicks the sidebar toggle to collapse it
- **THEN** the Sidebar width transitions to 80px, the Topbar left offset transitions to 80px, and the Main Content margin-left transitions to 80px simultaneously.

### Requirement: Sidebar label visibility
The system SHALL render sidebar menu labels with full opacity (100%) when the sidebar is in the expanded state.

#### Scenario: User expands the sidebar
- **WHEN** the user clicks the sidebar toggle to expand it
- **THEN** the menu labels transition from 0% to 100% opacity and become fully visible.

### Requirement: Navigation vertical stacking
The system SHALL maintain a vertical stacking order for navigation items within the sidebar, regardless of whether the sidebar is collapsed or expanded.

#### Scenario: User views collapsed sidebar navigation
- **WHEN** the sidebar is collapsed
- **THEN** navigation icons are displayed in a single vertical column.

### Requirement: Logout button alignment
The system SHALL ensure the Logout button icon is horizontally centered within the sidebar container when the sidebar is collapsed.

#### Scenario: User views Logout button in collapsed sidebar
- **WHEN** the sidebar is collapsed
- **THEN** the Logout icon is centered within the 80px sidebar width, with no horizontal shift caused by invisible text or spacing.

## ADDED Requirements

### Requirement: Authenticated layout offsets react to sidebar collapsed state
The Topbar and main content area MUST use dynamic horizontal offsets driven by SidebarContext instead of hardcoded pixel values.

#### Scenario: Topbar uses dynamic left offset
- **WHEN** the sidebar state changes between collapsed and expanded
- **THEN** the Topbar's `left` CSS property transitions between `80px` and `256px` respectively

#### Scenario: Main content uses dynamic margin-left
- **WHEN** the sidebar state changes between collapsed and expanded
- **THEN** the main content area's `margin-left` CSS property transitions between `80px` and `256px` respectively
