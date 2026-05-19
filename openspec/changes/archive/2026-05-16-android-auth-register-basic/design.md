# Design

## Backend Contract
Android will call `POST auth/register` with name, email, password, and password confirmation. The backend returns user data but currently returns `token: null`, so Android cannot persist an authenticated session directly from the register response.

After successful registration, the repository will call the existing `auth/login` endpoint with the same email/password and save the returned token through the existing login path.

## UI
Add a register screen with name, email, password, and password confirmation fields. On success, navigate to the projects screen using the same post-login destination. Add a secondary action on the login screen to open registration.
