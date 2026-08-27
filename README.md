# Expense Tracker

A personal expense tracker that I use as a substutitue fro logging everything into an excel file. It allows to: log payments by category, edit them anytime, see monthly summaries with charts and tables, import transactions straight from a bank statement CSV, and optionally get them auto-categorized by a local AI model.

## Features

- **Categories** — create/edit/delete your own spending categories (color-coded), with 8 defaults seeded on registration
- **Transactions** — log, edit, delete, filter by month/category, paginated
- **Monthly dashboard** — per-category totals as a table + bar chart, plus a grand total
- **CSV import** — upload a Swedbank (Baltics) account statement export; duplicate transactions are detected and skipped automatically
- **Local AI categorization (optional)** — imported transactions can be auto-assigned a category by a local LLM running via [Ollama](https://ollama.com), entirely on your own machine, no API key, no cost, no data leaving your computer. If Ollama isn't running, everything just falls back to your "Other" category — the app works fully without it.
- **Auth** — JWT-based, stateless, BCrypt password hashing

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form + Zod, Recharts |
| AI | LangChain4j + Ollama (`llama3.2:3b`) |
| Infra | Docker Compose (Postgres + Ollama), Maven Wrapper (no local Maven install needed) |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (for the frontend)
- Java 21 — only needed if you want to run `mvnw` outside the wrapper's own JDK resolution; the Maven Wrapper handles Maven itself
- Git Bash (ships with [Git for Windows](https://git-scm.com/downloads/win)) — the `tracker` script is a bash script

## Quick start

From the repo root:

```bash
bash ./tracker start
```

This brings up the whole stack in the background:
1. Postgres (Docker) — the database
2. Ollama (Docker) — pulls the `llama3.2:3b` model automatically on first run (~5GB one-time download: the Ollama image + the model)
3. Backend — Spring Boot on `:8080`
4. Frontend — Vite dev server on `:5173`

Open **http://localhost:5173** and register an account — you'll get 8 default categories automatically.

Other commands:
```bash
bash ./tracker status              # what's running, and on which ports
bash ./tracker logs                # tail backend + frontend logs together
bash ./tracker logs backend        # just one
bash ./tracker stop                # tears everything down cleanly
```

`tracker` tracks backend/frontend by the port they're listening on (not PID) and launches them fully detached from the invoking terminal — closing the terminal window or hitting Ctrl+C won't kill them; use `tracker stop` instead.

## Manual setup (without `tracker`)

```bash
docker compose up -d                        # Postgres on :5433, Ollama on :11434
cd backend && ./mvnw.cmd spring-boot:run     # :8080
cd frontend && npm install && npm run dev    # :5173
```

If you want AI categorization, pull the model once Ollama is up:
```bash
docker exec expense-tracker-ollama ollama pull llama3.2:3b
```

## CSV import

The importer expects a Swedbank (Baltics) account statement CSV export — no header row, 13 quoted columns per row. It keeps only actual transaction rows (not opening/closing balance lines) that are debits (money out) in EUR, and skips anything that already matches an existing transaction on the same date/amount/description.

Imported transactions land in your "Other" category by default, or get auto-categorized if Ollama is running (see below).

## How AI categorization works

For each unique merchant name in an import, the backend sends a small prompt to your local Ollama instance, just the merchant name and your category list, nothing else:

```
You are categorizing a personal bank transaction for an expense tracker app.
Transaction description: "MAXIMA LT"

Choose exactly one category from this list, and respond with ONLY the category
name exactly as written below, nothing else - no punctuation, no explanation:
Bills, Entertainment, Food, Health, Other, Shopping, Transport, Travel
```

Nothing leaves your machine — the call goes to `localhost:11434`. If Ollama isn't installed or isn't running, the call fails fast and the transaction falls back to "Other"; nothing breaks.

Configurable in `backend/src/main/resources/application.yml` (or via env vars `OLLAMA_BASE_URL` / `OLLAMA_MODEL`) if you want to point at a different model or a remote Ollama instance.

## Project structure

```
backend/    Spring Boot API (entity/repository/dto/service/controller/security/config)
frontend/   React app (pages/components/api/context)
tracker     Dev control script (start/stop/status/logs)
docker-compose.yml   Postgres + Ollama
```

## Configuration

Backend config lives in `backend/src/main/resources/application.yml`, all overridable via environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `DB_PORT` | `5433` | Postgres host port |
| `DB_USERNAME` / `DB_PASSWORD` | `expense_user` / `expense_pass` | Postgres credentials |
| `JWT_SECRET` | dev-only default | JWT signing secret — **change this for anything beyond local dev** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Allowed frontend origin |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | `llama3.2:3b` | Model used for categorization |

Postgres runs on host port `5433` rather than the default `5432` to avoid colliding with a native Postgres install some machines already have running.
