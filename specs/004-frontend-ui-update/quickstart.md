# Quickstart: Frontend UI Update

**Feature**: 004-frontend-ui-update
**Date**: 2026-03-24

## 1. Local Development Setup

To begin implementing the new design, follow these steps:

1.  **Branch Check**: Ensure you are on the `004-frontend-ui-update` branch.
2.  **Dependencies**: Install `framer-motion` and `lucide-react` in the `frontend` directory:
    ```bash
    cd frontend
    npm install framer-motion lucide-react
    ```
3.  **Local Dev Server**:
    ```bash
    npm run dev
    ```

## 2. Using the Glassmorphism Component

The design system is built around a central set of CSS variables. To create a glassmorphic element:

1.  **CSS Definition**: Apply the `glass-card` class to your element:
    ```css
    .glass-card {
        background: var(--bg-surface);
        backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--border-glow);
    }
    ```
2.  **Spring Animations**: Use `framer-motion` for interactions:
    ```tsx
    import { motion } from 'framer-motion';

    const MyComponent = () => (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Content */}
      </motion.div>
    );
    ```

## 3. Dark Mode Toggle

The theme can be toggled via the `ThemeContext`. It automatically syncs with the user's system preference and persists in `localStorage`.

```tsx
const { toggleTheme, isDarkMode } = useTheme();
```
