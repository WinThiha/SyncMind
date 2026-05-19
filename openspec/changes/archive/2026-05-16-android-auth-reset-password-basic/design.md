# Design

## Backend Contract
Android will call `POST auth/reset-password` with token, email, password, and password confirmation. On success the backend returns a message.

## Navigation
Add `reset-password?token={token}&email={email}`. The screen validates that token and email are present before allowing submission. App link patterns will cover localhost-style frontend reset links used by this project.

## UI
The reset screen includes password and confirmation fields, loading/error/success states, and a login action after success.
