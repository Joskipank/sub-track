# Endpoints

API endpoint notes for SubTrack.
List auth, subscriptions, categories and analytics endpoints.
Keep this file in sync with OpenAPI.

Contract guard checks and baseline policy: `docs/api-notes/contract-guard.md`.

## Auth endpoints
- `POST /api/v1/auth/register` returns `201` with JWT payload.
- `POST /api/v1/auth/login` returns `200` with JWT payload.
- Auth validation/business errors return `400`, invalid credentials return `401`.

## Forecast endpoints
- Canonical forecast endpoint: `GET /api/v1/analytics/forecast`.
- Compatibility alias: `GET /api/v1/forecast` (deprecated).
- `months` query parameter on `/api/v1/forecast` is deprecated and ignored.

## Import consent endpoints
- Check status: `GET /api/v1/consents/imports/GMAIL`.
- Grant consent: `POST /api/v1/consents/imports/GMAIL/grant`.
- Revoke consent: `POST /api/v1/consents/imports/GMAIL/revoke`.
- Import endpoint `POST /api/v1/imports/start` requires active consent and returns `403 IMPORT_CONSENT_REQUIRED` when missing.

## Usage signal endpoints
- Create usage signal: `POST /api/v1/usage-signals`.
- List usage signals: `GET /api/v1/usage-signals?subscriptionId=<id>` (optional filter).
- Signals are user-scoped: subscription must exist and belong to current user, otherwise `400` with `{"message":"Subscription not found"}`.

## Other authenticated endpoints
- Integrations: `GET /api/v1/integrations`.
- Recommendations: `GET /api/v1/recommendations?category=<category>`.
  - Returns catalog-backed alternatives from `recommendation_catalog` (seeded by backend migrations).
