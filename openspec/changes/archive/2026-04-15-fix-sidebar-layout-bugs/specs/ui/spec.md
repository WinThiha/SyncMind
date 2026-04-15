## MODIFIED Requirements

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
