# Endpoints

API endpoint notes for SubTrack.
List auth, subscriptions, categories and analytics endpoints.
Keep this file in sync with OpenAPI.

## Forecast endpoints
- Canonical forecast endpoint: `GET /api/v1/analytics/forecast`.
- Compatibility alias: `GET /api/v1/forecast` (deprecated).
- `months` query parameter on `/api/v1/forecast` is deprecated and ignored.

## Import consent endpoints
- Check status: `GET /api/v1/consents/imports/GMAIL`.
- Grant consent: `POST /api/v1/consents/imports/GMAIL/grant`.
- Revoke consent: `POST /api/v1/consents/imports/GMAIL/revoke`.
- Import endpoint `POST /api/v1/imports/start` requires active consent and returns `403 IMPORT_CONSENT_REQUIRED` when missing.
