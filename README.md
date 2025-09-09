# Mini Payment Gateway Proxy (TypeScript)

Production-ready boilerplate for a payment proxy and LLM-based risk summary.

## Features
- Express + TypeScript, strict mode
- Security: Helmet, CORS, compression
- Logging: Pino + HTTP logger
- Validation: Joi
- Provider abstractions: Payment (mock/stripe placeholder), LLM (mock/openai placeholder)
- Idempotency support via `Idempotency-Key` header (mock provider)
- OpenAPI spec at `public/openapi.yaml`
- Dockerfile (multi-stage) and docker-compose
- Linting (ESLint) and formatting (Prettier)
- Redis caching for LLM risk summaries (configurable TTL)
- In-memory LRU for hot LLM prompts (layered over Redis)
- Configurable fraud rules with secure runtime update

## Getting Started
1. Install Node.js 18+.
2. Install deps:
```bash
npm install
```
3. Create env file:
```bash
copy .env.example .env  # Windows
# or: cp .env.example .env
```
4. Start dependencies (Redis) via Docker (recommended for local):
```bash
docker compose up -d redis
```
Alternatively, set `REDIS_URL` to a running Redis or change it to `redis://localhost:6379` if you already have Redis locally.

5. Run dev:
```bash
npm run dev
```
6. Health check: `GET http://localhost:3000/health`

## Environment Variables
See `.env.example` for all options. Key variables:
- `PORT`: API port (default 3000)
- `ALLOWED_ORIGINS`: CSV of allowed origins for CORS
- `PAYMENT_PROVIDER`: `mock` | `stripe` (currently mock/placeholder)
- `LLM_PROVIDER`: `mock` | `openai` (currently mock/placeholder)
- `REDIS_URL`: Redis connection string (e.g., `redis://localhost:6379`)
- `CACHE_TTL_SECONDS`: TTL in seconds for LLM risk cache (default 300)
- `ADMIN_TOKEN`: bearer token required for protected config endpoints

## API
- `POST /api/charge` create charge with risk heuristics + LLM explanation
- `GET /api/transactions` list transaction logs (page, pageSize)
- `POST /api/payments` / `GET /api/payments/:id`
- `POST /api/risk/summary`
- `PUT /api/config/fraud-rules` (protected)

### Secure Config Update
- Endpoint: `PUT /api/config/fraud-rules`
- Header: `Authorization: Bearer <ADMIN_TOKEN>`
- Payload example:
```json
{
  "largeAmountThreshold": 8000,
  "mediumAmountThreshold": 1500,
  "suspiciousDomains": ["tempmail", "mailinator", "disposable"],
  "suspiciousTlds": ["ru", "cn"],
  "weights": { "largeAmount": 0.5, "mediumAmount": 0.25, "suspiciousDomain": 0.35 }
}
```

## Docker
Build and run image directly:
```bash
docker build -t mini-payment-gateway-proxy .
docker run -it --rm -p 3000:3000 --env-file .env mini-payment-gateway-proxy
```

### docker-compose (includes Redis)
Start API and Redis:
```bash
docker compose up --build
```
- API: `http://localhost:3000`
- Redis: `localhost:6379`

If you prefer to run the compiled server instead of dev mode and you are not using compose for the API:
```bash
# Ensure Redis is running first
docker compose up -d redis

# Build and start the server
npm start
```

## Scripts
- `npm run dev` hot reload with tsx
- `npm run build` compile to `dist/`
- `npm start` run compiled build
- `npm run lint` / `lint:fix` / `format` / `typecheck`

## Notes
- Replace mock providers with real integrations (Stripe/OpenAI) as needed.
- For production, configure `ALLOWED_ORIGINS`, secure secrets, and observability.
