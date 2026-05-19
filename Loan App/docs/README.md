# Documentation

Living documentation for the Loan App.

## Layout

```
docs/
├── architecture/              System diagrams, service boundaries, data flow
├── api/                       OpenAPI spec + endpoint reference
├── decisions/                 Architecture Decision Records (ADRs)
├── specs/                     Tech specs for non-trivial features (write before building)
├── guides/                    Developer how-tos and runbooks
├── changelog/                 Per-release notes
├── audit-log.md               Audit logging design
└── context.md                 General project context
```

## Conventions

- One ADR per significant decision — number them sequentially: `0001-record-architecture-decisions.md`.
- Write a tech spec for anything non-trivial before writing code. Specs cover: problem, proposed solution, alternatives considered, rollout plan.
- Keep diagrams as source files (Mermaid `.mmd`, draw.io `.drawio`) in addition to any exported PNGs.
