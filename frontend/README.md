# SyncMind Frontend

Modernized UI/UX for SyncMind, featuring a **Glassmorphism** aesthetic, **Light Blue** branding, and **Spring-based** interactions.

## 🎨 Design System: Glassmorphism

The UI utilizes a translucent, multi-layered design system. Key components are located in `src/components/ui`.

### CSS Utilities
- `.glass-card`: Base translucent card with blur and border glow.
- `.glass-navbar`: Navigation bar with heavy blur.
- `.glass-sidebar`: Sidebar with heavy blur and right border.

### Tokens (CSS Variables)
- `--brand-primary`: #3B82F6 (Light Blue).
- `--bg-surface`: Translucent background for glass elements.
- `--glass-blur`: 12px (Standard blur).
- `--glass-shadow`: Subtle shadow for depth.

## 🌓 Theme & Performance

Managed via `ThemeContext` (`src/context/ThemeContext.tsx`).

- **Adaptive Dark Mode**: Automatically syncs with system preferences and persists in `localStorage`.
- **Performance Mode**: Automatically detects low-power devices (or manual toggle) to degrade expensive `backdrop-filter` effects to solid colors for 60fps consistency.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker (Project runs in a containerized environment)

### Installation
```bash
docker compose up -d
```

### Running Tests
```bash
docker compose exec frontend npm test
```

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **State**: React Context API
- **Animations**: Framer Motion (Spring-based)
- **Icons**: Lucide React
- **Styles**: Vanilla CSS + CSS Modules
- **Testing**: Vitest + React Testing Library
