## ADDED Requirements

### Requirement: Sidebar collapse toggle
The system SHALL provide a toggle control in the sidebar header that switches between expanded (256px) and collapsed (80px) widths.

#### Scenario: User collapses the sidebar
- **WHEN** user clicks the chevron toggle button in the sidebar header
- **THEN** the sidebar transitions from 256px to 80px width and the chevron icon rotates 180 degrees

#### Scenario: User expands the sidebar
- **WHEN** the sidebar is collapsed and user clicks the chevron toggle button
- **THEN** the sidebar transitions from 80px to 256px width and the chevron icon rotates back to 0 degrees

### Requirement: Icon-only rail when collapsed
When the sidebar is collapsed, the system SHALL display only the icons for each navigation item, hiding text labels.

#### Scenario: Navigation items in collapsed state
- **WHEN** the sidebar is in collapsed state
- **THEN** each navigation item displays its icon only, text labels are hidden via overflow-hidden and opacity transition

#### Scenario: Navigation items in expanded state
- **WHEN** the sidebar is in expanded state
- **THEN** each navigation item displays its icon and text label side by side

### Requirement: Tooltips on collapsed navigation items
When the sidebar is collapsed, each navigation icon SHALL display a custom absolute tooltip with the item's label text.

#### Scenario: Hover over collapsed navigation icon
- **WHEN** the sidebar is collapsed and user hovers over a navigation icon
- **THEN** a custom absolute tooltip appears showing the item's label (e.g., "Dashboard", "Settings", "Help")

#### Scenario: No tooltip when expanded
- **WHEN** the sidebar is expanded
- **THEN** navigation items do not show tooltips since labels are visible

### Requirement: Sidebar state persistence
The system SHALL persist the sidebar collapsed state to localStorage so it survives page navigation and browser refresh.

#### Scenario: Collapsed state persists across navigation
- **WHEN** user collapses the sidebar and navigates to a different authenticated page
- **THEN** the sidebar remains collapsed on the new page

#### Scenario: Collapsed state persists across refresh
- **WHEN** user collapses the sidebar and refreshes the browser
- **THEN** the sidebar renders in collapsed state on page load

#### Scenario: Default state for new users
- **WHEN** a user visits the app for the first time (no localStorage key)
- **THEN** the sidebar renders in expanded state

### Requirement: Layout elements react to sidebar state
The Topbar and main content area SHALL adjust their horizontal offset to match the current sidebar width.

#### Scenario: Topbar offset when collapsed
- **WHEN** the sidebar is collapsed to 80px
- **THEN** the Topbar's left offset is 80px and the main content area's left margin is 80px

#### Scenario: Topbar offset when expanded
- **WHEN** the sidebar is expanded to 256px
- **THEN** the Topbar's left offset is 256px and the main content area's left margin is 256px

### Requirement: Smooth CSS transition on collapse/expand
All layout shift animations SHALL use CSS transitions with a 200ms ease timing function, not JavaScript-driven animation.

#### Scenario: Sidebar width transition
- **WHEN** the sidebar collapses or expands
- **THEN** the sidebar width, Topbar left offset, and main content margin-left animate over 200ms using CSS transition

#### Scenario: Label opacity transition
- **WHEN** the sidebar collapses or expands
- **THEN** navigation item text labels fade out (opacity 0) or fade in (opacity 1) over the same 200ms transition duration

### Requirement: Sidebar state managed via React Context
The system SHALL use a SidebarContext (React Context) to manage the collapsed state, providing `collapsed` boolean and `toggle` function to all descendant components.

#### Scenario: Sidebar reads context
- **WHEN** the Sidebar component renders
- **THEN** it reads `collapsed` and `toggle` from SidebarContext

#### Scenario: Topbar reads context
- **WHEN** the Topbar component renders
- **THEN** it reads `collapsed` from SidebarContext to determine its left offset

#### Scenario: AuthenticatedLayout provides context
- **WHEN** the AuthenticatedLayout renders
- **THEN** it wraps its children with SidebarProvider and reads `collapsed` for main content margin
