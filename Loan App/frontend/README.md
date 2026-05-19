# Frontend — React + TypeScript

Borrower-facing application UI. React + TypeScript, Redux for cross-cutting state, React Query for server state.

## Layout

```
frontend/
├── public/
└── src/
    ├── components/            Reusable UI (LoanApplication, forms, modals)
    ├── pages/                 Route-level views
    ├── styles/                Plain CSS3 modules per component
    ├── App.jsx                Root component / router
    └── index.tsx              Entry point (to be added)
```

## Conventions

- TypeScript `strict` mode on. Types for API responses generated from the OpenAPI spec.
- Redux store stays small and flat — only global state (auth, session, notifications).
- React Query handles loans, applications, and other server data.
- No tokens or PII in `localStorage` / `sessionStorage` — auth lives in HttpOnly cookies.
- CSS in plain `*.module.css` files. No CSS-in-JS library.
- Run `axe-core` / Lighthouse in CI — fail on WCAG 2.1 AA regressions.

## Running

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```
