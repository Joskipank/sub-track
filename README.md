# SubTrack

**SubTrack** — fullstack-приложение для управления подписками.  
Проект позволяет пользователю отслеживать свои подписки, смотреть аналитику расходов, получать уведомления о ближайших списаниях и импортировать данные через CSV.

## Возможности проекта

- регистрация и авторизация пользователей
- JWT-аутентификация
- добавление, редактирование и удаление подписок
- категории подписок
- аналитика расходов
- уведомления о предстоящем списании
- прогноз месячных и годовых расходов
- синхронизация между Web и Mobile через единый Backend API
- импорт подписок через CSV
- Swagger / OpenAPI
- demo seed-данные для тестирования

---

## Технологический стек

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- PostgreSQL
- Flyway / Liquibase
- Swagger / OpenAPI

### Web
- React
- TypeScript
- Vite

### Mobile
- React Native
- Expo
- TypeScript

### Infra
- Docker
- Docker Compose

---

## Архитектура проекта

Проект организован в виде **monorepo**.

- **Backend** — один Spring Boot backend-монолит
- **Web** — React-клиент
- **Mobile** — React Native / Expo-клиент
- **Database** — PostgreSQL
- **Docs** — документация, сценарий демо, инструкции запуска
- **Infra / Scripts** — docker-compose, env-примеры, вспомогательные скрипты

Все клиенты работают с одним REST API, поэтому синхронизация между Web и Mobile реализуется через Backend.

---

## Структура проекта

```text
subtrack/
├─ README.md
├─ .gitignore
├─ .editorconfig
├─ .env.example
├─ apps/
│  ├─ backend/
│  ├─ web/
│  └─ mobile/
├─ database/
│  ├─ migrations/
│  ├─ seed/
│  └─ schema/
├─ docs/
│  ├─ api-notes/
│  ├─ demo-script/
│  └─ launch-guide/
├─ infra/
│  ├─ docker-compose.yml
│  ├─ docker/
│  └─ env/
└─ scripts/
   ├─ start/
   ├─ db/
   └─ utils/
```

---

## API Contract Policy

API-контракт backend считается стабильным и self-serve.  
Детальные правила и handoff: [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md).

Обязательные требования для любого PR с изменением API:
- обновить OpenAPI (`docs/api-notes/subtrack-openapi.yaml`) в том же PR;
- обновить/добавить backend тесты под изменённое поведение;
- обновить docs/demo сценарии при изменении внешнего поведения API;
- не допускать “тихих” breaking changes (только с явной депрекацией/миграционными заметками).
