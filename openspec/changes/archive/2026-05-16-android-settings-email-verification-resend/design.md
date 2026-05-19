## Design

The existing settings screen already displays whether the email is verified. This change adds a button inside the account section when `email_verified` is false. The ViewModel owns resend state and delegates to the repository.

The response model accepts either `status` or `message` because the backend returns `status: verification-link-sent` for the normal resend path and `message: Email already verified.` when no resend is needed.

## Non-goals

- Deep-link verification handling
- Changing registration/login verification requirements
- Polling verification status after resend
