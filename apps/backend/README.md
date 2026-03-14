# Backend

Spring Boot backend for SubTrack.

## Local startup (MVP)

1. Start PostgreSQL:
   - `docker compose -f apps/backend/docker-compose.yml up -d`
2. Configure environment variables (use `apps/backend/.env.example` as a template).
   - Backend automatically loads `.env` from `apps/backend/.env` and `../.env` (repo root) if files exist.
   - `SPRING_PROFILES_ACTIVE=dev`
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/subtrack`
   - `SPRING_DATASOURCE_USERNAME=subtrack`
   - `SPRING_DATASOURCE_PASSWORD=subtrack`
   - `JWT_SECRET` must be at least 32 bytes for HS256.
   - Enable Gmail mailbox flow with `IMPORT_PROVIDERS_GMAIL_MAILBOX_ENABLED=true`.
   - Keep Gmail provider enabled with `IMPORT_PROVIDERS_GMAIL_ENABLED=true`.
   - Configure `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI`, and `GMAIL_FRONTEND_REDIRECT_URI`.
   - Configure `INTEGRATIONS_TOKEN_ENCRYPTION_SECRET` and `INTEGRATIONS_OAUTH_STATE_SECRET` (or ensure `JWT_SECRET` is set, because these values fallback to it).
   - When mailbox flow is enabled, backend startup fails fast if required Gmail OAuth configuration is missing.
   - Keep OAuth state cleanup enabled in production (`INTEGRATIONS_OAUTH_STATE_CLEANUP_ENABLED=true`), otherwise backend startup is blocked in `prod` profile.
3. Run backend:
   - `cd apps/backend`
   - `./gradlew bootRun` (Linux/macOS)
   - `gradlew.bat bootRun` (Windows)

## Stop local PostgreSQL

- `docker compose -f apps/backend/docker-compose.yml down`
