# Backend — Flask API

The Python/Flask origination API. One Blueprint per domain; business logic lives in `app/services/`.

## Layout

```
backend/
├── app/
│   ├── __init__.py            Flask application factory
│   ├── api/                   Blueprints (one per domain)
│   ├── models/                SQLAlchemy models
│   ├── schemas/               Marshmallow / Pydantic request + response schemas
│   ├── services/
│   │   ├── approval.py        Underwriting decision logic
│   │   ├── storage.py         Document upload + presigned S3 URLs
│   │   └── audit.py           Append-only audit logger
│   └── loan_application.py    Loan application aggregate / entrypoint
└── tests/
```

## Conventions

- Validate every inbound request with a schema — never trust raw user input.
- Return JSON errors as `{ "error": ..., "code": ..., "message": ... }` consistently.
- Synchronous handlers for fast endpoints; defer slow work (credit-bureau calls, ML scoring) to background workers via Kafka.
- Load secrets from AWS Secrets Manager at startup. No `.env` files in production.
- Pin dependencies in `requirements.txt` and run `pip-audit` in CI.

## Running

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
flask --app app run --debug
```

## Tests

```bash
pytest
```
