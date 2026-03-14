# Backend

Spring Boot backend for SubTrack.

## Local startup (MVP)

1. Start PostgreSQL:
   - `docker compose -f apps/backend/docker-compose.yml up -d`
2. Configure environment variables (use `apps/backend/.env.example` as a template).
   - `SPRING_PROFILES_ACTIVE=dev`
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/subtrack`
   - `SPRING_DATASOURCE_USERNAME=subtrack`
   - `SPRING_DATASOURCE_PASSWORD=subtrack`
   - `JWT_SECRET` must be at least 32 bytes for HS256.
   - Enable Gmail mailbox flow with `IMPORT_PROVIDERS_GMAIL_MAILBOX_ENABLED=true`.
   - Configure `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REDIRECT_URI`.
   - Keep OAuth state cleanup enabled in production (`INTEGRATIONS_OAUTH_STATE_CLEANUP_ENABLED=true`), otherwise backend startup is blocked in `prod` profile.
3. Run backend:
   - `cd apps/backend`
   - `./gradlew bootRun` (Linux/macOS)
   - `gradlew.bat bootRun` (Windows)

## Stop local PostgreSQL

- `docker compose -f apps/backend/docker-compose.yml down`
