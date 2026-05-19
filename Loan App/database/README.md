# Database

MySQL (AWS RDS, Multi-AZ in production).

## Layout

```
database/
├── schema.py                  Schema definitions / SQLAlchemy models reference
└── migrations/                Alembic migrations
```

## Rules

- All schema changes go through Alembic migrations — never `ALTER TABLE` by hand in production.
- Financial records are append-only: use `deleted_at` soft deletes, never hard `DELETE` on loans / payments / transactions.
- PII fields (SSN, bank account number) are encrypted at the field level *before* they reach the database.
- TDE enabled at the RDS layer. SSL required for all connections.
- Analytics queries never run against this database — use Snowflake. A read replica is available for any reporting that cannot wait for Snowflake sync.

## Running migrations

```bash
cd backend
alembic upgrade head
```
