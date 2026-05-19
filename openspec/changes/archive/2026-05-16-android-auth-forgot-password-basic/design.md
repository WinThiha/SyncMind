# Design

## Backend Contract
Android will call `POST auth/forgot-password` with:

```json
{
  "email": "user@example.com"
}
```

The backend returns:

```json
{
  "message": "If that email address is registered, you will receive a password reset link shortly."
}
```

The screen will display the returned message and keep the user on the recovery screen with a back action to login.

## UI
Add a `Forgot password` action on the login screen. The recovery screen includes one email field, a send button, loading/error states, and success message text.
