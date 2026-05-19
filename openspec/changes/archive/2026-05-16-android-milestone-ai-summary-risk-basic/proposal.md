# Android milestone AI summary and risk

## Summary
Port the web app's AI milestone summary and risk analysis outputs to Android.

## Motivation
The web milestone AI panel can generate a milestone summary and risk analysis. Android milestone editing currently lacks these read-only AI insights.

## Scope
- Add Android models for milestone summary and risk analysis responses.
- Add Retrofit endpoints and repository methods for milestone summary and risk analysis.
- Add edit milestone view model state/actions.
- Render summary and risk outputs on the edit milestone screen.
- Validate with Android unit tests.

## Out of Scope
- Milestone issue suggestions and adding suggested issues.
- New milestone date suggestions, already covered separately.
- Backend AI changes.
