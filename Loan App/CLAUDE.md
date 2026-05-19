# Fintech Best Practices
## Lending & Credit Platform
**Security • Compliance • Privacy • Fraud • Architecture • UX • Tech Stack**

**Prepared:** May 6, 2026
**For Internal Use Only — Confidential**

---

## Introduction

This document outlines best practices for building and operating a lending and credit fintech platform. It covers six compliance and engineering domains, followed by a dedicated Tech Stack section that maps every tool in the chosen stack to specific, actionable guidance.

The guiding philosophy throughout is simplicity and directness — favour the straightforward solution, avoid premature complexity, and build compliance in from day one rather than patching it in later.
  
---

## 1. Security & Compliance (KYC/AML)

### Know Your Customer (KYC)

- Implement a tiered KYC approach — lightweight checks for low-risk borrowers, enhanced due diligence (EDD) for high-value loans.
- Use automated identity verification providers (e.g., Persona, Onfido, Socure) for document checks, liveness detection, and database matching.
- Capture and store KYC evidence with timestamps and version history for audit trails.
- Re-verify customers periodically or when risk signals change (address change, large loan request).

### Anti-Money Laundering (AML)

- Screen all applicants against OFAC, PEP (Politically Exposed Persons), and sanctions lists at onboarding and on an ongoing basis.
- Implement transaction monitoring rules to flag unusual repayment patterns or suspicious fund sources.
- File Suspicious Activity Reports (SARs) and Currency Transaction Reports (CTRs) as required by FinCEN.
- Assign a dedicated BSA/AML Compliance Officer, even if outsourced initially.

### Regulatory Licensing

- Ensure state-by-state lending licenses are in place, or use a bank partner/sponsor bank model to lend under their charter.
- Track and comply with TILA (Truth in Lending Act), ECOA (Equal Credit Opportunity Act), and FCRA (Fair Credit Reporting Act).
- Maintain a compliance calendar for regulatory filings, exam readiness, and policy reviews.

---

## 2. API Design & Integration

### Design Principles

- Follow RESTful conventions with versioned endpoints (`/v1/loans`, `/v2/applications`) — never break existing integrations silently.
- Use OpenAPI/Swagger specs as the source of truth for all internal and external APIs.
- Design for idempotency on all mutation endpoints (loan creation, disbursement triggers) using idempotency keys to prevent duplicate transactions.

### Third-Party Integrations

- Use abstraction layers (adapter pattern) when integrating credit bureaus (Experian, Equifax, TransUnion), bank data providers (Plaid, MX), and payment rails (ACH via Dwolla, Stripe, or a direct ODFI).
- Never hard-code API credentials — use AWS Secrets Manager for all service credentials.
- Implement circuit breakers and fallback logic for all third-party calls; a credit bureau outage should not bring down your origination flow.

### Webhooks & Events

- Emit events for all major loan state transitions (`submitted → approved → funded → repaid`) via Kafka topics.
- Secure inbound webhooks with HMAC signature verification.
- Build a retry and dead-letter queue (DLQ) mechanism for failed webhook deliveries.

---

## 3. Data Privacy (GDPR/CCPA)

### Data Minimization

- Only collect data necessary for underwriting, servicing, and compliance — nothing more.
- Define and document a data retention policy: what is kept, for how long, and why (e.g., loan records for 7 years per regulatory requirement).

### Consumer Rights

- Build mechanisms to honour Right to Access, Right to Deletion (where not prohibited by law), and Right to Correction requests within required timeframes (45 days under CCPA).
- Deletion requests must be balanced against legal obligations to retain records — document this exception explicitly.

### Consent & Disclosures

- Obtain explicit, informed consent before pulling credit reports or sharing data with third parties.
- Surface plain-language privacy notices at the point of data collection.
- Log all consent events with timestamps for audit purposes.

### Technical Controls

- Encrypt PII at rest (AES-256) and in transit (TLS 1.2+) — enforce this at the MySQL and S3 layer.
- Implement field-level encryption for SSNs and bank account numbers before they reach the database.
- Use data masking in non-production environments — developers should never see real SSNs or account numbers.

---

## 4. Fraud Prevention

### Application Fraud

- Apply device fingerprinting and behavioural biometrics at application entry to detect bot traffic and synthetic identities.
- Cross-reference applicant data against identity graph providers (LexisNexis, Socure) to detect inconsistencies.
- Flag velocity patterns: multiple applications from the same device, IP, or email domain within a short window.

### Synthetic Identity Fraud

- Implement SSNVT (SSN Verification with the SSA) where possible — this is the #1 fraud vector in lending.
- Look for thin-file profiles with suspiciously clean credit histories and benchmark against consortium fraud networks (Early Warning, Point Predictive).

### Loan Stacking

- Monitor for applicants simultaneously applying at multiple lenders using SAMBA or consortium checks.
- Implement a 24–48 hour funding delay for higher-risk segments to allow stacking signals to surface before disbursement.

### Ongoing Transaction Monitoring

- Flag sudden changes in repayment behaviour — ACH returns, NSFs, account closures.
- Monitor for account takeover indicators: new device, new IP, changed contact info combined with a withdrawal request.

---

## 5. Architecture & Scalability

### System Design

- Use an event-driven architecture for loan lifecycle management — decouple origination, underwriting, servicing, and collections into independent services.
- Implement a loan management system (LMS) as the system of record, separate from the origination layer.
- Design for multi-tenancy from the start if you plan to white-label or serve multiple lending programs.

### Reliability

- Target 99.9%+ uptime for borrower-facing surfaces and 99.99% for payment processing and disbursement rails.
- Queue applications gracefully when upstream dependencies (credit bureaus, bank data) are unavailable — never return a hard error to the borrower.
- Use async processing for underwriting decisions — avoid synchronous waits on third-party API calls.

### Data & Reporting

- Run all analytics and model training against Snowflake — never run reports against the production MySQL database.
- Build a real-time portfolio monitoring dashboard tracking delinquency rates, cohort performance, and loss curves.
- All financial records must be immutable and append-only — use soft deletes, never hard deletes.

### Compliance-Ready Infrastructure

- Maintain a full audit log of every state change on every loan, with actor, timestamp, and reason code.
- Store audit logs in an immutable, tamper-evident store (WORM S3 buckets / AWS CloudTrail).

---

## 6. UX & Accessibility

### Application Flow

- Design a progressive application — collect minimum information upfront, request additional data only when required for underwriting.
- Show clear, real-time progress indicators and estimated completion time.
- Provide instant pre-qualification with a soft credit pull before requesting consent for a hard inquiry.

### Transparency & Trust

- Clearly display APR, total cost of credit, repayment schedule, and all fees before the borrower signs — mandated by TILA.
- Use plain language throughout — aim for an 8th-grade reading level for disclosures and communications.
- Offer an interactive loan calculator so borrowers can model different amounts and terms before committing.

### Accessibility (WCAG 2.1 AA)

- Ensure all forms are keyboard navigable and screen-reader compatible.
- Maintain a minimum 4.5:1 colour contrast ratio — especially critical for status indicators (approved / denied).
- Test with real assistive technology (NVDA, VoiceOver), not just automated checkers.

### Servicing Experience

- Give borrowers a self-service portal to view statements, make payments, request hardship accommodations, and update contact info.
- Send proactive communications (payment reminders, confirmations, delinquency alerts) via the borrower's preferred channel.
- Design collections flows with empathy — offer payment plans before escalating, and comply with FDCPA if using third-party collectors.

---

## 7. Tech Stack & Implementation Guidelines

The following stack has been selected for its directness and minimal operational overhead. Each tool is chosen to do one job well. Avoid adding layers unless they solve a concrete, present problem.

| Category | Tools | Role / Rationale |
|---|---|---|
| Backend | Python (Flask) | Primary API layer — simple, readable, fast to iterate |
| Backend | Kotlin | Secondary backend for performance-critical or JVM services |
| Frontend | React + TypeScript | Typed component UI; Redux for global state management |
| Styling | CSS3 / JavaScript ES6 | No extra CSS framework unless needed — keep it lean |
| Cloud | AWS | Core infrastructure; use managed services to reduce ops burden |
| Containers | Docker + Kubernetes | Containerised workloads, orchestrated on AWS EKS |
| CI/CD | GitHub Actions | Automated test, lint, build, and deploy pipelines |
| Database | MySQL | Primary relational store for loan and user records |
| Streaming | Kafka | Event backbone for loan lifecycle and async workflows |
| Processing | Spark | Batch processing for portfolio analytics and feature engineering |
| Warehouse | Snowflake | Analytics, reporting, and ML training data — never prod MySQL |
| ML / AI | Cursor, Gemini | Daily developer tooling; credit decisioning model infrastructure |
| Practices | Git / GitHub + PRs | Version control, code review, and technical specs |

### Backend — Python / Flask / Kotlin

#### Python & Flask

- Keep Flask apps flat and explicit — one Blueprint per domain (`applications`, `loans`, `users`, `payments`). Resist adding abstraction layers until they are genuinely needed.
- Use Flask application factories and environment-based config (not hard-coded settings). Load all secrets from AWS Secrets Manager at startup, never from `.env` files committed to Git.
- Validate every inbound request with a schema library (Marshmallow or Pydantic). Reject malformed payloads at the boundary — never let raw user input reach the database layer.
- Return consistent JSON error responses across all endpoints: `{ error, code, message }`. This makes client-side handling and logging trivial.
- Write synchronous Flask handlers for fast endpoints; defer slow work (credit bureau calls, ML scoring, document generation) to background workers via Kafka events.
- Pin all dependencies in `requirements.txt` and run `pip-audit` in CI to catch vulnerable packages before they reach production.

#### Kotlin (Secondary Backend)

- Use Kotlin for services where JVM performance, strong typing, or existing Java library ecosystem matters (e.g., payment processing, high-throughput event consumers).
- Leverage Kotlin coroutines for I/O-bound work rather than blocking threads — keeps resource usage predictable under load.
- Expose Kotlin services as internal REST endpoints consumed by the Flask API layer — do not expose them directly to the frontend.
- Use the same OpenAPI contract approach as Python services — generate client stubs automatically to avoid drift between producer and consumer.

#### REST API Design

- Version all public endpoints: `/api/v1/`. Never change the contract of an existing version — create `v2` instead.
- Use standard HTTP verbs correctly: GET (read), POST (create), PATCH (partial update), DELETE (soft delete). Avoid RPC-style verbs in URLs.
- Return `202 Accepted` with a job ID for long-running operations (underwriting, document generation) and provide a status polling endpoint.
- Rate-limit all public endpoints using AWS API Gateway or a middleware layer — especially the application submission endpoint.

---

### Frontend — React / TypeScript / Redux / CSS3

- Use TypeScript strictly — enable `strict` mode in `tsconfig.json`. Type API responses from day one using generated types from the OpenAPI spec (`openapi-typescript` or similar).
- Keep the Redux store small and flat. Only global, cross-component state (auth, loan application session, notifications) belongs in Redux. Local UI state stays in component `useState`.
- Use React Query (TanStack Query) for server state (loan data, application status) — it handles caching, refetching, and loading/error states far better than hand-rolled Redux async thunks.
- Write CSS in plain CSS3 modules (`*.module.css`) per component. No CSS-in-JS library needed — keep the build simple and performance predictable.
- Never store tokens, SSNs, or PII in `localStorage` or `sessionStorage`. Keep auth tokens in HttpOnly cookies managed by the backend.
- Run `axe-core` or Lighthouse accessibility checks in CI — fail the build on WCAG 2.1 AA regressions.
- Lazy-load heavy routes (document upload, loan calculator, account settings) using `React.lazy` and `Suspense` to keep the initial bundle small.

---

### Cloud & Infrastructure — AWS / Docker / Kubernetes

#### AWS

- Prefer managed AWS services over self-managed equivalents: RDS (MySQL), MSK (Kafka), EKS (Kubernetes), S3 (document storage), SES (email), SNS/SQS (async messaging).
- Use AWS IAM roles for service-to-service auth — never embed AWS access keys in application code or Docker images.
- Store all application secrets (DB passwords, API keys, third-party tokens) in AWS Secrets Manager and rotate them on a schedule.
- Enable AWS CloudTrail across all accounts and regions — this is your immutable audit log for infrastructure-level events.
- Use S3 with server-side encryption (SSE-S3 or SSE-KMS) for all document storage. Enable versioning and Object Lock (WORM) on audit buckets.
- Set up AWS Cost Anomaly Detection and budget alerts from day one — fintech workloads can spike unexpectedly during campaign launches or batch runs.

#### Docker

- Write minimal, multi-stage Dockerfiles — build stage installs deps, final stage copies only the artefact. Keeps image sizes small and attack surface low.
- Pin base image versions (`python:3.12-slim`, not `python:latest`). Rebuild images weekly to pull in OS security patches.
- Run containers as a non-root user. Add `USER` directive to every Dockerfile.
- Scan images with Trivy or AWS ECR image scanning before pushing to production.

#### Kubernetes (EKS)

- Keep Kubernetes manifests simple: Deployments, Services, ConfigMaps, and HorizontalPodAutoscalers cover 90% of needs. Avoid over-engineering with Operators until necessary.
- Use Kubernetes Secrets backed by AWS Secrets Manager (via External Secrets Operator) — never embed plaintext secrets in manifests.
- Set resource requests and limits on every container — this prevents noisy-neighbour problems and enables the autoscaler to work correctly.
- Use readiness and liveness probes on all services so Kubernetes can route traffic correctly during deployments and restarts.

---

### CI/CD — GitHub Actions

- Every pull request must pass: lint (`flake8`/`eslint`), type checks (`mypy`/`tsc`), unit tests, and a security scan (`bandit` for Python, `npm audit` for Node) before merge.
- Keep workflows simple: one workflow file per concern (`ci.yml`, `deploy-staging.yml`, `deploy-prod.yml`). Avoid deeply nested reusable workflow chains.
- Use GitHub Environments with required reviewers for production deployments. No code reaches production without a human approval step.
- Store all Action secrets (AWS credentials, registry tokens) in GitHub Encrypted Secrets at the repository or organisation level — never in workflow YAML.
- Generate and publish an SBOM (Software Bill of Materials) on every production release for compliance and supply-chain audit readiness.
- Tag every production release with a Git tag and maintain a CHANGELOG — makes rollback straightforward and audit trail clear.

---

### Data & Storage — MySQL / Kafka / Spark / Snowflake

#### MySQL (Primary Database)

- Use AWS RDS for MySQL with Multi-AZ enabled — automated failover, backups, and patching handled by AWS.
- Run all schema changes through a migration tool (Alembic for Python, Flyway for Kotlin). Never alter schema manually in production.
- Encrypt all tables containing PII or financial data using MySQL Transparent Data Encryption (TDE). Enforce SSL for all connections.
- Never run analytics queries against the production database — use a read replica for any reporting that cannot wait for Snowflake sync.
- Append-only financial records: use soft deletes (`deleted_at` timestamp), never hard `DELETE` on loans, payments, or transactions.

#### Kafka (Event Streaming)

- Use Kafka as the backbone for all async loan lifecycle events: `ApplicationSubmitted`, `UnderwritingCompleted`, `LoanFunded`, `PaymentReceived`, `LoanDefaulted`.
- Use AWS MSK (Managed Kafka) — no cluster management overhead.
- Enforce schema validation on all topics using AWS Glue Schema Registry or Confluent Schema Registry — prevent producers from publishing malformed events.
- Set appropriate retention periods per topic: audit events → 7 years; operational events → 30 days.
- Design consumers to be idempotent — Kafka at-least-once delivery means duplicate events will occur.

#### Spark (Data Processing)

- Use Spark for batch jobs: portfolio risk reports, ML feature engineering, cohort loss analysis, and regulatory data exports.
- Run Spark on AWS EMR or as Kubernetes Spark jobs — not on always-on instances that sit idle between runs.
- Write Spark jobs in Python (PySpark) to stay consistent with the primary backend language. Kotlin Spark is available but adds complexity.
- Test Spark transformations locally with small fixtures before running on the full dataset — catch logic errors cheaply.

#### Snowflake (Data Warehouse)

- Snowflake is the only query destination for analytics, dashboards, and ML training data — this is a hard rule to protect production MySQL.
- Load data into Snowflake via Kafka (Snowflake Kafka Connector) for near-real-time sync, plus nightly Spark batch for backfill and transformation.
- Use Snowflake row-level security policies to enforce that analysts cannot query raw PII fields without explicit data steward approval.
- Warehouse auto-suspend should be set to 1–5 minutes to avoid idle compute costs.

---

### ML & AI — Credit Decisioning / Cursor / Gemini

#### Credit Decisioning Models

- Treat your ML credit model as a regulated model: document inputs, outputs, training data, and known limitations. This is required for SR 11-7 / model risk management compliance.
- Never let a model make a fully automated adverse action (denial) without a compliant adverse action notice generated and delivered to the borrower (ECOA / FCRA requirement).
- Maintain a champion/challenger framework — the production model (champion) runs alongside a new candidate (challenger) on a small traffic slice before full rollout.
- Log every model input and output for every decision — you need this for regulatory exams, bias audits, and model debugging.
- Run regular disparate impact analysis on model outputs segmented by protected classes (race, gender, age proxies) — even if you do not use these features directly.

#### Feature Platform

- Centralise feature computation in a feature store so training features and serving features are identical — training/serving skew is a leading cause of model degradation.
- Version all features and maintain backward compatibility — old models should still be able to run on historical data for backtesting.
- Compute features from Snowflake (batch) and Kafka (real-time) depending on latency requirements.

#### AI Developer Tooling (Cursor, Gemini)

- Use Cursor and Gemini to accelerate code generation, code review, and documentation — but treat all AI-generated code as untrusted until reviewed by a human engineer.
- Never paste real borrower PII, production credentials, or proprietary model weights into AI tools. Use synthetic data for all AI-assisted development workflows.
- Establish a team policy on which AI tools are approved and what data categories may be shared with them — document this in your security policies.

---

### Engineering Practices — Git / Code Review / Tech Specs

- Trunk-based development: short-lived feature branches merged to main frequently. Long-lived branches create merge pain and slow down delivery.
- Every pull request must have at least one human reviewer who understands the domain. Compliance-adjacent code requires a second reviewer.
- Write a tech spec before building anything non-trivial: problem statement, proposed solution, alternatives considered, rollout plan. Keep specs in a `/docs` folder in the repo.
- Use conventional commits (`feat:`, `fix:`, `chore:`) and enforce with a commit linter in CI. This makes changelog generation and release notes automatic.
- Tag and document every external API integration: what it does, who owns it, what the SLA is, and what the fallback is when it is unavailable.
- Conduct quarterly dependency audits — upgrade packages proactively rather than reactively after a CVE is published.

---

## Overarching Principles

These principles apply across every domain and every line of code written for this platform:

1. **Simplicity first.** Choose the straightforward solution. Add complexity only when a concrete problem demands it. The best code is the code you do not have to write.
2. **Compliance by design.** Build regulatory requirements into your architecture from day one. Retrofitting compliance is expensive, slow, and risky.
3. **Audit everything.** In lending, if it is not logged it did not happen. Every state change on every loan needs an actor, a timestamp, and a reason.
4. **Protect borrower data.** Treat every PII record as if it were your own. Data breaches in lending carry reputational and regulatory consequences that can end a company.
5. **Partner early.** Engage a fintech-specialised attorney and compliance consultant before you launch. The regulatory surface area in lending is large and state-specific.
