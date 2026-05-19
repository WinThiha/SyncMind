---
name: SyncMind Mobile
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#424754'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4f5d6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#677687'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d5e4f8'
  tertiary-fixed-dim: '#b9c8db'
  on-tertiary-fixed: '#0e1d2b'
  on-tertiary-fixed-variant: '#3a4858'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  background-subtle: '#F8FAFC'
  status-open: '#64748B'
  status-in-progress: '#3B82F6'
  status-resolved: '#10B981'
  status-closed: '#0F172A'
  priority-low: '#94A3B8'
  priority-normal: '#3B82F6'
  priority-high: '#EF4444'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 16px
  gutter-mobile: 12px
  touch-target-min: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system focuses on high-performance project management for professional teams. The brand personality is efficient, reliable, and hyper-focused, minimizing cognitive load to keep users in a state of "flow."

The aesthetic is **Corporate Modern** with heavy **Material 3** influences. It prioritizes clarity over decorative elements, utilizing a structured information hierarchy that feels native to mobile OS environments. The interface uses generous white space and rhythmic verticality to ensure that even complex issue boards remain scannable during quick mobile check-ins.

## Colors

The color system is anchored by **SyncMind Light Blue**, used strategically for primary actions and active states. 

- **Primary & Secondary:** Used for high-emphasis branding and core navigation elements.
- **Surface Palette:** Employs `#F8FAFC` for light mode backgrounds to reduce eye strain compared to pure white, and deep charcoals for dark mode.
- **Status & Priority:** These functional colors are calibrated for high visibility. "High Priority" uses a vibrant red to trigger immediate attention, while "Resolved" uses a success green that contrasts clearly against the brand blue.
- **Dark Mode:** In dark mode, surfaces use tonal elevation (lighter shades of grey/navy) rather than pure black to maintain depth and readability.

## Typography

The design system utilizes **Hanken Grotesk** for its clean, geometric, yet professional character, ensuring legibility at small sizes on mobile displays.

- **Headlines:** Use tighter letter spacing and heavier weights to create a strong visual anchor for screens.
- **Labels:** Meta-data, such as Issue IDs (e.g., SYNC-102) and timestamps, utilize **JetBrains Mono**. This monospaced choice distinguishes technical data from human-readable content, aiding rapid scanning of logs and ticket lists.
- **Scale:** All type is set on a 4px baseline grid to maintain vertical rhythm.

## Layout & Spacing

This system follows a **Fluid Grid** model optimized for 4-column mobile layouts. 

- **Thumb-Zone Optimization:** Critical actions (FABs, Navigation Bars) are placed within the lower third of the screen. 
- **Rhythm:** A strict 8px spatial system is used for component spacing, with a 4px sub-grid for fine-tuning icons and labels.
- **Touch Targets:** No interactive element should have a hit area smaller than `48px`, even if the visual representation is smaller (e.g., a small "Close" X).
- **Margins:** Standard mobile screens utilize a `16px` side margin to prevent content from crowding the edge of the device.

## Elevation & Depth

Hierarchy is conveyed through **Tonal Layers** and subtle shadows, following Material 3 principles.

- **Level 0 (Flat):** Main background surface.
- **Level 1 (Card):** Used for issue cards in a list. Features a very soft, `4%` opacity neutral shadow or a `1px` subtle border in dark mode.
- **Level 2 (Navigation/Floating):** Used for Bottom App Bars and Floating Action Buttons (FABs). These use a slightly more pronounced shadow with a `2px` offset to indicate they sit above the scrollable content.
- **Overlays:** Modals and bottom sheets use a `40%` opacity scrim to dim the background, pushing the focus entirely to the task at hand.

## Shapes

The shape language is **Rounded**, signaling a modern and approachable tool while maintaining professional boundaries.

- **Containers:** Issue cards and input fields use `0.5rem` (8px) corners.
- **Interaction Elements:** Buttons and Chips utilize `1rem` (16px) or fully pill-shaped corners to make them appear more "tappable" and distinct from information containers.
- **Priority Indicators:** Use a vertical bar shape on the left edge of cards for instant color-coding without taking up horizontal space.

## Components

- **Buttons:** Primary buttons use a solid light blue fill with white text. Secondary buttons use the tertiary light blue as a background with primary blue text.
- **Chips (Status):** Small, pill-shaped indicators. "Open" uses a neutral grey outline, "In Progress" uses a soft blue tint, and "Resolved" uses a soft green tint. Text is always high-contrast.
- **Lists:** Issue lists use a "Clean Stack" approach. Each item is a card with a `1px` separation or subtle shadow. Priority is indicated by a colored vertical strip on the left-most edge.
- **Input Fields:** Outlined style with `1px` borders. On focus, the border thickens to `2px` and changes to the primary brand color. Labels transition to a smaller size above the input (floating label).
- **FAB (Floating Action Button):** A large, prominent button in the bottom right corner for "New Issue," utilizing the primary brand color and a high-elevation shadow.
- **Bottom Navigation:** A 4-item bar (Home, My Tasks, Notifications, Profile) with active states indicated by a pill-shaped "pill" behind the icon.