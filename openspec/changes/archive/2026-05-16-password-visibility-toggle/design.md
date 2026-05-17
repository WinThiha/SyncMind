## Design Decisions

### Toggle Button Placement
The eye icon button is placed inside the input field on the right side using `relative` positioning on the wrapper `div` and `absolute right-3 top-1/2 -translate-y-1/2` on the button. The input gets `pr-10` to prevent the typed text from running under the button.

This avoids changing the existing input styling (`bg-foreground/5 border border-border-glow rounded-xl px-4 py-3`) — only `pr-10` is added to the right padding.

### State Management
A `boolean` state variable per password field tracks visibility (e.g., `showPassword`, `showConfirmPassword`). The input `type` is set to `"text"` when visible, `"password"` when hidden. No shared hook is needed since each form manages its own state independently.

### Icons
`Eye` and `EyeOff` from `lucide-react` are used — already imported in both forms. The icon button uses `type="button"` to prevent accidental form submission. It is styled as a ghost icon: `text-foreground/40 hover:text-foreground transition-colors` to blend with the field without competing visually.

### Accessibility
The toggle button has an `aria-label` driven by i18n keys (`auth.login.showPassword` / `auth.login.hidePassword`) so screen readers announce the action. The button is focusable via keyboard tab order.

### Register Form — Two Fields
The register form has both `password` and `password_confirmation` fields. Each gets its own independent toggle state (`showPassword`, `showConfirmPassword`). They are housed in a 2-column grid (`grid grid-cols-1 md:grid-cols-2 gap-6`) — both columns get the same wrapper treatment.

### i18n Keys
Two new keys added to every locale:
- `auth.login.showPassword` — label when password is currently hidden (button action: "show")
- `auth.login.hidePassword` — label when password is currently visible (button action: "hide")

These live under the `auth.login` namespace (shared by both login and register forms, consistent with the existing pattern of reusing `auth.login.passwordLabel` in `RegisterForm`).
