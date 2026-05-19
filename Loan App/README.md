# Loan App — Bilingual Lending Platform

A production-grade bilingual loan application intake system built for English- and Spanish-speaking borrowers. Designed with fintech compliance patterns in mind: JWT auth with refresh rotation, presigned S3 document storage, full audit logging, and an AI borrower assistant powered by Claude.

> Built as a Code Platoon apprenticeship portfolio project for the Affirm talent team.

---

## Table of Contents

1. System Architecture
2. Tech Stack
3. Security Model
4. Bilingual Implementation
5. AI Layer
6. AWS Infrastructure
7. Data Model
8. API Documentation
9. Running Locally
10. Running Tests
11. Deployment
12. Domain Expertise Note

---

## Repository Layout

```
Loan App/
├── CLAUDE.md                  Fintech best-practices spec (the project's North Star)
├── README.md                  This file
├── docs/                      Architecture, API contracts, ADRs, specs, guides
│   ├── architecture/
│   ├── api/
│   ├── decisions/             Architecture Decision Records
│   ├── specs/
│   ├── guides/
│   ├── changelog/
│   ├── audit-log.md           Audit logging design notes
│   └── context.md
├── backend/                   Flask API (Python)
│   ├── app/
│   │   ├── api/               Blueprints (one per domain)
│   │   ├── models/            SQLAlchemy models
│   │   ├── schemas/           Pydantic / Marshmallow request/response schemas
│   │   ├── services/          Business logic (approval, storage, audit)
│   │   └── loan_application.py
│   └── tests/
├── frontend/                  React + TypeScript (Redux + React Query)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── public/
├── database/                  Schema and migrations
│   ├── migrations/            Alembic migrations
│   └── schema.py
├── infrastructure/            Deployment manifests
│   ├── docker/
│   ├── k8s/
│   └── terraform/
└── .github/workflows/         CI/CD pipelines
```

---

## System Architecture

*(30-second architecture diagram goes here — see `docs/architecture/` for the source diagram.)*

The system is event-driven: the Flask origination API emits Kafka events on every loan lifecycle transition (`ApplicationSubmitted → UnderwritingCompleted → LoanFunded → PaymentReceived`). Downstream services (audit logger, notification dispatcher, analytics sync) consume these events independently.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend API | Python 3.12 + Flask | Readable, fast iteration, mature fintech ecosystem |
| High-throughput services | Kotlin | JVM performance for payment processing |
| Frontend | React + TypeScript | Type safety end-to-end; strict mode enabled |
| State management | Redux + React Query | Redux for session/auth, React Query for server state |
| Database | MySQL (AWS RDS, Multi-AZ) | Strong consistency for financial records |
| Streaming | Kafka (AWS MSK) | Decoupled loan lifecycle events |
| Warehouse | Snowflake | All analytics — never query prod MySQL |
| Document storage | S3 (SSE-KMS + Object Lock) | WORM compliance for audit-relevant docs |
| AI assistant | Claude | Bilingual borrower help, prompt-tuned for mortgage origination |
| Containers | Docker + EKS | Managed Kubernetes, minimal ops overhead |
| CI/CD | GitHub Actions | Lint, type-check, test, security-scan on every PR |

## Security Model

- TLS 1.2+ enforced at every entry point.
- PII encrypted at rest (AES-256). SSNs and bank account numbers field-level encrypted *before* reaching the database.
- JWT auth with refresh rotation. Tokens live in HttpOnly cookies, never `localStorage`.
- All secrets in AWS Secrets Manager.
- Every loan state change is logged with actor, timestamp, and reason code to an immutable audit trail.

## Bilingual Implementation

Every borrower-facing string is internationalized from day one (English / Spanish). The AI assistant detects the borrower's preferred language from the application context and replies in kind. Disclosures (TILA APR/cost breakdowns, adverse action notices) are pre-translated and reviewed — not on-the-fly machine translated, since regulatory disclosures must be exact.

## AI Layer

A Claude-backed assistant answers borrower questions about their application, the loan terms, and required documents. Guard rails:

- The assistant never quotes APR or final loan terms it has not been told by the system of record.
- All AI interactions are logged for compliance review.
- Prompts are tuned with mortgage-origination domain language (see Domain Expertise Note below).

## AWS Infrastructure

*(Terraform graph image goes here.)*

EKS cluster runs Flask and Kotlin services. RDS MySQL Multi-AZ for transactional data. MSK for Kafka. S3 buckets with Object Lock for audit artefacts. CloudTrail enabled across all accounts.

## Data Model

See `database/schema.py` and `docs/architecture/` for the full ER diagram. Highlights:

- `applications`, `loans`, `payments` — append-only with soft deletes.
- `audit_events` — immutable; every state change is recorded.
- `borrowers` — PII encrypted at the field level.

## API Documentation

OpenAPI spec lives in `docs/api/`. Client stubs are generated from the spec for both the React frontend and any internal Kotlin consumers — preventing producer/consumer drift.

## Running Locally

```bash
# One-shot local boot
docker compose up
```

See `infrastructure/docker/` for the Compose file once added.

## Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Deployment

GitHub Actions builds and deploys to staging on every merge to `main`. Production deploys require a manual reviewer approval via GitHub Environments.

## Domain Expertise Note

This project draws on four years of mortgage-origination experience and native Spanish fluency. The form UX, AI prompt design, and disclosure language reflect what borrowers actually struggle with at intake — not a generic template. The bilingual support is first-class, not bolted on.

---

## Status

This is an active build. See `docs/specs/` for what's planned next and `docs/decisions/` for architectural decisions made along the way.
