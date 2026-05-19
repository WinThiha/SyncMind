## Design

Password update will live in the existing Android settings screen under an account security section. The UI will collect current password, new password, and confirmation, then call the settings repository. The ViewModel will perform basic client validation before submitting and clear password drafts on success.

The backend remains responsible for password policy validation, current-password verification, and token revocation behavior.

## Non-goals

- Forgot-password flow changes
- Biometric unlock
- Email verification resend
- Showing detailed password policy rules beyond backend errors
