# Quickstart: Android App Setup (Jetpack Compose)

**Feature**: `005-android-app-setup`  
**Date**: 2026-04-08

## Prerequisites

- **Android Studio Jellyfish** (or latest Koala/Ladybug)
- **Android SDK**: API 34 (Android 14) installed
- **JDK**: Java 17+ (usually bundled with Android Studio)
- **Emulator/Device**: Android 7.0 (API 24) or higher
- **Backend**: Running at `http://localhost:8000` (or your local IP)

## Project Setup

1. Open Android Studio and select "Open".
2. Navigate to the project root and select the `android/` directory (created during implementation).
3. Wait for Gradle sync to complete.
4. If running against a local backend, update `BASE_URL` in `com.syncmind.android.Constants` to your local machine's IP (e.g., `http://10.0.2.2:8000/api/` for the emulator).

## Key Components

- **Activity**: `MainActivity` (Single activity with Compose Navigation)
- **Theme**: `SyncMindTheme` (Material3 based)
- **Entry Point**: `NavHost` in `MainActivity`

## Authentication Setup

The app uses **Laravel Sanctum** token-based authentication.

1. Ensure the backend is configured to accept token requests (not just cookie-based sessions).
2. The `AuthInterceptor` will automatically add the `Authorization: Bearer {token}` header to requests if a token is stored in `EncryptedSharedPreferences`.

## Troubleshooting

- **Connection Error**: Ensure you're using `10.0.2.2` to access your host machine's localhost from the emulator.
- **Login Failure**: Check that the user exists in the backend database (`php artisan tinker` -> `User::all()`).
- **Gradle Sync Issues**: Clean and rebuild project (`Build` -> `Clean Project`).
