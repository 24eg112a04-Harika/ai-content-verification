# VeriSource AI — Content Verification & Source Tracking

AI-powered fact-checking platform: submit text, article URLs, or documents; the system
decomposes input into atomic claims, retrieves reference sources (curated authoritative
catalogs + Wikipedia OpenSearch), scores evidentiary support per claim, and tracks every
source and audit event.

**Stack:** Spring Boot 3.3 (Java 21) · MySQL 8 · Flyway · JWT security · React 19 + Vite 8 · Docker

---

## Quick start (Docker — recommended)

Prerequisites: Docker + Docker Compose.

```bash
cp .env.example .env        # then edit .env (see below)
docker compose up --build -d
```

The app serves the **React frontend and the API from one port** (the production build is
baked into the Spring Boot jar):

| Service | URL |
|---|---|
| Web UI + API | http://localhost:10000 |
| API base | http://localhost:10000/api |

First start seeds demo accounts (disable with `SEED_DEMO_DATA=false`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@verification.org` | `Admin@123` |
| Analyst | `analyst@verification.org` | `Analyst@123` |

Stop / remove everything with `docker compose down` (`-v` also drops the DB volume).

### `.env` (production checklist)

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | **Required in production.** Random 64+ chars: `openssl rand -hex 48` |
| `SEED_DEMO_DATA` | `false` in production (no demo accounts / sample record) |
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Change from the compose defaults |
| `APP_PORT` | Host port for the app (default `10000`) |
| `AI_PROVIDER` / `AI_API_KEY` | Optional real LLM provider (default `DEMO` heuristics) |
| `SEARCH_PROVIDER` / `SEARCH_API_KEY` | Optional search provider (default `DEMO`: curated catalog + Wikipedia) |
| `CORS_ALLOWED_ORIGINS` | Only needed when serving the SPA separately |

---

## Local development (no Docker)

Requires **JDK 21**, **Maven 3.9+**, **Node 20+**, and a **MySQL 8** instance.

```bash
# 1. Database
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS content_verification_db"

# 2. Backend  (http://localhost:8080)
cd backend
mvn spring-boot:run
# Override DB credentials via env if needed:
# SPRING_DATASOURCE_URL=... SPRING_DATASOURCE_USERNAME=... SPRING_DATASOURCE_PASSWORD=...

# 3. Frontend  (http://localhost:5173, proxies /api -> :8080)
cd frontend
npm install
npm run dev
```

Run the backend unit tests with `cd backend && mvn test`.
Lint the frontend with `cd frontend && npm run lint`; production build with `npm run build`.

---

## Project layout

```
Dockerfile                Multi-stage: builds frontend, bakes dist/ into the jar
                          (root of the repo — used by CI and docker compose)
backend/                  Spring Boot 3.3 application
  pom.xml                 Maven build (Java 21)
  src/main/resources
    application.yml       Config (all secrets via env vars)
    db/migration/         Flyway migrations (V1 schema, V2 source excerpt)
  src/main/java/com/example/contentverification/
    controller/           REST API (auth, verifications, claims, dashboard, admin)
    service/              Claim extraction, source retrieval, evidence comparison,
                          SSRF-safe URL fetch, PDF/text/image file processing
    security/             JWT filter, token provider, security + CORS config
    entity|repository|dto|enums|exception
frontend/                 React 19 + Vite SPA (dashboard, verify, history, admin)
docker-compose.yml        App + MySQL 8 with healthchecks
.env.example              Environment template
```

---

## API overview

Base path: `/api` — all endpoints except `/api/auth/**` and `/api/public/**` require
`Authorization: Bearer <JWT>`. Admin endpoints require the `ROLE_ADMIN` authority.

| Method & path | Description |
|---|---|
| `POST /auth/register` | Create account (returns JWT) |
| `POST /auth/login` | Login (returns JWT) |
| `GET /auth/me` · `PUT /auth/profile` | Current profile / update name+password |
| `POST /verifications/text` · `/url` · `/file` | Submit content (file = multipart, ≤25 MB) |
| `GET /verifications` | Own history (`?status=&query=`) |
| `GET /verifications/{id}` · `/{id}/status` | Detail report · async progress |
| `DELETE /verifications/{id}` | Delete own record |
| `GET /verifications/{id}/claims` · `/claims/{id}` · `/claims/{id}/evidence` | Claim & evidence drill-down |
| `GET /dashboard/summary` · `/dashboard/activity` | Personal stats & audit trail |
| `GET /public/stats` | Public platform metrics |
| `GET /admin/users` · `PATCH /admin/users/{id}/status` | User management (admin) |
| `GET /admin/verifications` · `/admin/sources` | All records / source catalog (admin) |
| `GET /admin/stats` · `/admin/activity` | System analytics / audit logs (admin) |

Verification is processed asynchronously: `POST` returns `202` with a `PENDING` record;
poll `GET /verifications/{id}/status` until `COMPLETED`/`FAILED`.

---

## How verification works (demo mode)

1. **Claim extraction** — input is normalized and split into sentences; each claim is
   classified as factual, opinion, or prediction (marker heuristics).
2. **Source retrieval** — a curated authoritative catalog (ISRO, IPCC, NASA, WHO, ...)
   is matched first, then the Wikipedia OpenSearch API for open-ended claims. Retrieved
   snippets are stored with each source.
3. **Evidence comparison** — claim and source text are tokenized; overlap scores classify
   each source as supporting / conflicting / mixed / insufficient, and an overall status
   (supported, contradicted, partially supported, insufficient) is derived.
4. **Audit trail** — every submission, login, and admin action is logged.

> URL submissions go through an SSRF-hardened fetcher (public http/https only, private /
> link-local / cloud-metadata IPs blocked, every redirect hop re-validated).

---

## Production notes

- The Docker image runs the jar as a **non-root** user and serves the built SPA from
  `/`; no separate web server or CORS config is needed.
- Set a strong `JWT_SECRET` — the app logs a prominent warning if the demo default is in use.
- Set `SEED_DEMO_DATA=false` so demo accounts are not created.
- The MySQL volume persists data across `docker compose down`; back it up with
  `docker compose exec db mysqldump -uroot -p$MYSQL_ROOT_PASSWORD content_verification_db`.
- URL verification fetches external sites (Wikipedia + user-supplied URLs) from the
  server, so allow outbound HTTPS in the firewall.
