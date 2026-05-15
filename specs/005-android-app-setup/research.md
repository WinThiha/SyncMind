# Research: Android App Setup (Jetpack Compose)

**Feature**: `005-android-app-setup`  
**Date**: 2026-04-08

## Decision: UI Framework - Jetpack Compose
- **Decision**: Use Jetpack Compose for all UI development.
- **Rationale**: User explicitly requested Jetpack Compose. It is the modern standard for Android UI, offering declarative syntax, better performance, and reduced boilerplate compared to XML layouts.
- **Alternatives considered**: XML-based layouts (rejected per user request).

## Decision: Architecture - MVVM with Clean Architecture
- **Decision**: Implement Model-View-ViewModel (MVVM) architecture with repository patterns and use cases if necessary.
- **Rationale**: Industry standard for Android development. Decouples UI from business logic, making it easier to test and maintain. Works seamlessly with Compose's state-driven UI.
- **Alternatives considered**: MVI (Model-View-Intent), MVP (Model-View-Presenter). MVVM is more idiomatic with Compose.

## Decision: Networking - Retrofit + OkHttp
- **Decision**: Use Retrofit for API definition and OkHttp for the underlying network client.
- **Rationale**: Proven, robust, and industry-standard libraries for Android networking. Supports interceptors for token management.
- **Alternatives considered**: Ktor Client (modern, Multiplatform-ready but Retrofit is more established for pure Android).

## Decision: Dependency Injection - Hilt
- **Decision**: Use Hilt (built on Dagger) for dependency injection.
- **Rationale**: Google's recommended DI solution for Android. Simplifies Dagger boilerplate and integrates perfectly with ViewModel and Compose.
- **Alternatives considered**: Koin (simpler but less powerful/compile-time safe than Dagger/Hilt).

## Decision: Token Management - EncryptedSharedPreferences
- **Decision**: Use `EncryptedSharedPreferences` from the Security library to store the Sanctum auth token.
- **Rationale**: Provides hardware-backed encryption for sensitive data, fulfilling the security requirement in the constitution.
- **Alternatives considered**: Standard `SharedPreferences` (not secure enough for tokens), DataStore (modern but requires extra effort for encryption).

## Decision: Navigation - Compose Navigation Component
- **Decision**: Use the official Jetpack Compose Navigation library.
- **Rationale**: Type-safe navigation (in recent versions) and deep integration with the Compose lifecycle.
- **Alternatives considered**: Voyager or other third-party libraries. Stick to official for long-term support.

## Decision: JSON Parsing - Kotlin Serialization
- **Decision**: Use `kotlinx.serialization`.
- **Rationale**: Native to Kotlin, type-safe, and performs well.
- **Alternatives considered**: Gson (legacy), Moshi (modern but Kotlin Serialization is the new standard).

## Summary of Tech Stack
- **Language**: Kotlin 2.0+
- **UI**: Jetpack Compose
- **DI**: Hilt
- **Networking**: Retrofit + OkHttp
- **Serialization**: Kotlin Serialization
- **Local Storage**: EncryptedSharedPreferences
- **Async**: Kotlin Coroutines + Flow
- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
