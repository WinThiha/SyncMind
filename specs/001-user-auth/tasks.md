# Tasks: User Authentication and Social Login

**Feature Branch**: `001-user-auth`
**Status**: Completed

## Strategy

- **MVP**: Email/password registration (with verification) and login (User Story 1 & 2).
- **Subsequent Increments**: Google Social Login integration and account linking (User Story 3), followed by global route protection (User Story 4) and final polish (rate limiting).

## Dependency Graph

```text
Phase 1: Setup (Next.js & Laravel Configs)
  ↓
Phase 2: Foundational (Data Models & Migrations)
  ↓
Phase 3: US1 - Email/Password Registration
  ↓
Phase 4: US2 - Email/Password Login
  ↓
Phase 5: US3 - Google Social Login
  ↓
Phase 6: US4 - Protected System Access
  ↓
Phase 7: Polish (Rate Limiting, Unlinking Logic)
```

## Phase 1: Setup

Setup environment configurations and global dependencies required for the project.

- [X] T001 Initialize basic Next.js 16 structure and install TailwindCSS in `frontend/`
- [X] T002 Initialize basic Laravel 12 API structure in `backend/`
- [X] T003 [P] Install and configure Laravel Sanctum for SPA authentication in `backend/`
- [X] T004 [P] Install and configure Laravel Socialite in `backend/`
- [X] T005 [P] Install `@react-oauth/google` and configure Next.js environment variables in `frontend/`
- [X] T006 Configure Sanctum stateful domains and session domains in `backend/.env`

## Phase 2: Foundational

Set up database schemas, models, and shared utilities.

- [X] T007 Verify default `User` migration ensures `name` and `password` are mandatory in `backend/database/migrations/*_create_users_table.php`
- [X] T008 [P] Create `social_accounts` migration with constraints in `backend/database/migrations/*_create_social_accounts_table.php`
- [X] T009 Update `User` model to handle social accounts relationship in `backend/app/Models/User.php`
- [X] T010 [P] Create `SocialAccount` model with relationships in `backend/app/Models/SocialAccount.php`

## Phase 3: User Story 1 - Email/Password Registration

**Goal**: As a new user, I want to register for an account using my email and a password so that I can access the system.
**Independent Test**: Can be fully tested by submitting a valid email and password on the registration form, verifying that a verification email is sent, and completing the verification process.

- [X] T011 [US1] Create REST API contract test for registration endpoint in `backend/tests/Feature/Auth/RegistrationTest.php`
- [X] T012 [US1] Implement registration controller method handling validation and user creation in `backend/app/Http/Controllers/Auth/RegisterController.php`
- [X] T013 [US1] Configure and implement Laravel's built-in email verification notification flow in `backend/app/Models/User.php` and `backend/routes/api.php`
- [X] T014 [US1] Create frontend registration form component with validation in `frontend/src/components/auth/RegisterForm.tsx`
- [X] T015 [US1] Create frontend registration page integrating the form in `frontend/src/app/(auth)/register/page.tsx`
- [X] T016 [US1] Create frontend email verification notice/handling page in `frontend/src/app/(auth)/verify-email/page.tsx`

## Phase 4: User Story 2 - Email/Password Login

**Goal**: As a registered user, I want to log in using my email and password so that I can access my account.
**Independent Test**: Can be tested by submitting credentials of an existing account and verifying access is granted.

- [X] T017 [US2] Create REST API contract test for login endpoint in `backend/tests/Feature/Auth/LoginTest.php`
- [X] T018 [US2] Implement login controller method utilizing Sanctum cookie auth and handling "Remember Me" in `backend/app/Http/Controllers/Auth/LoginController.php`
- [X] T019 [US2] Implement logout controller method to invalidate sessions in `backend/app/Http/Controllers/Auth/LoginController.php`
- [X] T020 [US2] Create frontend login form component with validation and "Remember Me" toggle in `frontend/src/components/auth/LoginForm.tsx`
- [X] T021 [US2] Create frontend login page integrating the form in `frontend/src/app/(auth)/login/page.tsx`
- [X] T022 [US2] Implement frontend auth context/hook to manage session state and fetch current user in `frontend/src/context/AuthContext.tsx`

## Phase 5: User Story 3 - Google Social Login

**Goal**: As a user, I want to log in using my Google account so that I can access the system quickly without remembering a separate password.
**Independent Test**: Can be tested using a Google account to log in and verifying successful authentication.

- [X] T023 [US3] Create REST API contract test for Google callback endpoint in `backend/tests/Feature/Auth/GoogleLoginTest.php`
- [X] T024 [US3] Implement Google callback controller method using stateless Socialite to verify token in `backend/app/Http/Controllers/Auth/GoogleAuthController.php`
- [X] T025 [US3] Implement logic to link existing email or create new active user within Google callback controller in `backend/app/Http/Controllers/Auth/GoogleAuthController.php`
- [X] T026 [US3] Create frontend Google Login Button component utilizing `@react-oauth/google` in `frontend/src/components/auth/GoogleLoginButton.tsx`
- [X] T027 [US3] Integrate Google Login Button into both login and registration pages in `frontend/src/app/(auth)/login/page.tsx` and `frontend/src/app/(auth)/register/page.tsx`

## Phase 6: User Story 4 - Protected System Access

**Goal**: As an unauthenticated user, I should not be able to access the system so that private data and features remain secure.
**Independent Test**: Can be tested by navigating to any internal system URL without an active session and verifying the user is redirected to the login page.

- [X] T028 [US4] Implement global frontend middleware to redirect unauthenticated users to `/login` in `frontend/src/middleware.ts`
- [X] T029 [US4] Secure all internal API routes using the `auth:sanctum` middleware in `backend/routes/api.php`
- [X] T030 [US4] Create a protected dashboard/home route to verify access in `frontend/src/app/dashboard/page.tsx`

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T031 Implement rate limiting on all authentication API endpoints (Register, Login) in `backend/app/Providers/AppServiceProvider.php`
- [X] T032 Implement account lockout mechanism for failed login attempts using Laravel's RateLimiter in `backend/app/Http/Controllers/Auth/LoginController.php`
- [X] T033 Implement Model Observer to automatically delete associated `SocialAccount` records when a User's email is updated in `backend/app/Observers/UserObserver.php` and register it in `backend/app/Providers/AppServiceProvider.php`
