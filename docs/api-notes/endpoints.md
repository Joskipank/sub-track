# Endpoints

API endpoint notes for SubTrack.
List auth, subscriptions, categories and analytics endpoints.
Keep this file in sync with OpenAPI.

## Forecast endpoints
- Canonical forecast endpoint: `GET /api/v1/analytics/forecast`.
- Compatibility alias: `GET /api/v1/forecast` (deprecated).
- `months` query parameter on `/api/v1/forecast` is deprecated and ignored.
