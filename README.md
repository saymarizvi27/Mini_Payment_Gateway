
# Mini Payment Gateway Proxy (TypeScript)

## Project Overview
This project is a lightweight backend API that simulates routing payment requests to Stripe or PayPal based on a configurable fraud risk score. It uses a Large Language Model (LLM) to generate human-readable explanations for each risk decision. The API is designed for clarity, modularity, and modern TypeScript practices.

**Key Features:**
- Fraud risk scoring using configurable heuristics (amount, email domain, TLD)
- LLM-generated risk explanations (mocked by default)
- In-memory transaction logging
- Provider routing (mock Stripe/PayPal)
- Configurable fraud rules (runtime update supported)
- Dockerized for easy setup
- Unit tests with Jest


## Fraud Logic & LLM Usage
Fraud risk is calculated using a set of heuristics defined in `src/config/fraudRules.json`. The rules include:
- **Amount thresholds:** Large and medium amounts increase risk.
- **Suspicious domains/TLDs:** Emails from certain domains or TLDs increase risk.
- **Rule weights:** Each rule contributes a weighted score.

The total risk score is a float between 0 and 1. If the score is below 0.5, the payment is routed to a provider (mock Stripe/PayPal). If 0.5 or above, the payment is blocked.

An LLM (mocked by default) generates a natural-language explanation for each risk decision. Frequent prompts are cached in-memory for performance.

## Example: Fraud Rule Config
See `src/config/fraudRules.json` for the schema. Example:
```json
{
  "thresholds": { "largeAmount": 8000, "mediumAmount": 1500 },
  "suspiciousDomains": ["mailinator.com", "tempmail.com"],
  "suspiciousTlds": ["ru", "cn"],
  "weights": { "largeAmount": 0.5, "mediumAmount": 0.25, "suspiciousDomain": 0.35 },
  "rulesEnabled": { "amountCheck": true, "domainCheck": true, "tldCheck": true }
}
```


## Getting Started
1. **Install Node.js 18+**
2. **Install dependencies:**
  ```bash
  npm install
  ```
3. **Create env file:**
  ```bash
  copy .env.example .env  # Windows
  # or: cp .env.example .env
  ```
4. **Run in dev mode:**
  ```bash
  npm run dev
  ```
5. **Health check:**
  ```
  GET http://localhost:3000/health
  ```
6. **API docs:** See `public/openapi.yaml` for OpenAPI spec.


## Environment Variables
See `.env.example` for all options. Key variables:
- `PORT`: API port (default 3000)
- `ALLOWED_ORIGINS`: CSV of allowed origins for CORS
- `PAYMENT_PROVIDER`: `mock` | `stripe` (currently mock/placeholder)
- `LLM_PROVIDER`: `mock` | `openai` (currently mock/placeholder)
- `CACHE_TTL_SECONDS`: TTL in seconds for LLM risk cache (default 300)
- `ADMIN_TOKEN`: bearer token required for protected config endpoints


## API Endpoints

### `POST /api/charge`
**Request:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "source": "tok_test",
  "email": "donor@example.com"
}
```
**Response:**
```json
{
  "transactionId": "txn_abc123",
  "provider": "paypal",
  "status": "success",
  "riskScore": 0.32,
  "explanation": "This payment was routed to PayPal due to a moderately low score based on a large amount and a suspicious email domain."
}
```

### `GET /api/transactions`
Returns a paginated list of all transactions (in-memory log).

### `PUT /api/config/fraud-rules` (protected)
- Header: `Authorization: Bearer <ADMIN_TOKEN>`
- Payload: see [Fraud Rule Config](#example-fraud-rule-config)


## Docker
Build and run image directly:
```bash
docker build -t mini-payment-gateway-proxy .
docker run -it --rm -p 3000:3000 --env-file .env mini-payment-gateway-proxy
```

### docker-compose
Start API:
```bash
docker compose up --build
```
- API: `http://localhost:3000`

If you prefer to run the compiled server instead of dev mode and you are not using compose for the API:
```bash
# Build and start the server
npm start
```


## Scripts
- `npm run dev` hot reload with tsx
- `npm run build` compile to `dist/`
- `npm start` run compiled build
- `npm run lint` / `lint:fix` / `format` / `typecheck`
- `npm test` run Jest tests with coverage


## Assumptions & Tradeoffs
- LLM and payment providers are mocked for simplicity; swap in real APIs as needed.
- All transaction logs are in-memory (not persistent).
- Fraud rules are hot-reloadable but not persisted across restarts.
- Caching for LLM explanations is in-memory (LRU-like, TTL-based).
- No external DB or queue required for this exercise.

## Testing
Run all unit tests:
```bash
npm test
```

## Contact
For questions or feedback, open an issue or contact the maintainer.
