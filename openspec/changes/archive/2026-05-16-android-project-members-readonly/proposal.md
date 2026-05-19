## Why

Android project detail currently shows only a member count even though the project detail API returns member records. Web users can inspect project membership, so Android should expose a basic read-only member list as part of project detail.

## What Changes

- Render project members on Android project detail from the existing project payload.
- Show each member name, email, role, and position when present.
- Keep management actions for a later change.

## Impact

- Android project detail screen
- Android project member display model already present in `Project.kt`
