## ADDED Requirements

### Requirement: Auth emails honor saved user locale
The system SHALL localize authentication-related emails (including verification and password reset content) using the user’s saved locale preference when a user context exists and SHALL fallback to English otherwise.

#### Scenario: Verification email for user with saved Japanese locale
- **WHEN** a user with saved locale `ja-JP` requests a verification email
- **THEN** the email subject and body are rendered in Japanese

#### Scenario: Password reset email for user with saved Khmer locale
- **WHEN** a password reset email is generated for a user with saved locale `km-KH`
- **THEN** the email subject and body are rendered in Khmer

#### Scenario: Auth email locale fallback
- **WHEN** auth email rendering cannot resolve a supported saved locale
- **THEN** the email is rendered in English
