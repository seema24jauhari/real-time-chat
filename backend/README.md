# JWT Auth Service

Production-grade authentication microservice built with NestJS, MongoDB, and Redis. Designed as a standalone auth layer for SaaS applications — handles token lifecycle, session revocation, MFA, and role-based access control.

> **Live Demo:** https://jwt-auth-service-fw9g.onrender.com  
---

## Features

- JWT access token (15 min) + refresh token rotation (7 days)
- Redis-backed token revocation — instant logout across all devices
- Argon2id password hashing
- Role-based access control (RBAC) — `staff`, `student`
- TOTP-based MFA (Google Authenticator compatible)
- Google & GitHub OAuth2 social login
- Rate limiting on login endpoint (5 attempts / 15 min per IP)
- Global exception filter — structured JSON error responses
- Request correlation IDs for distributed tracing
- Swagger/OpenAPI documentation
- Docker + Docker Compose setup
- GitHub Actions CI/CD → Render manual-deploy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Sessions | Redis |
| Password Hashing | Argon2id |
| Auth | JWT (access + refresh), OAuth2 |
| Docs | Swagger / OpenAPI 3.0 |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions → Render|

---

## Architecture

```
Client
  │
  ▼
NestJS API (Auth Service)
  ├── POST /auth/register       → Hash password → Save user → MongoDB
  ├── POST /auth/login          → Verify credentials → Issue JWT pair → Redis (refresh token)
  ├── POST /auth/refresh        → Validate refresh token → Rotate → New JWT pair
  ├── DELETE /auth/logout       → Blacklist token → Redis
  ├── POST /auth/mfa/enable     → Generate TOTP secret → Return QR code
  └── GET /users/me             → JWT Guard → Return profile
  │
  ├── MongoDB   → User store (credentials, roles, MFA secret)
  └── Redis     → Token blacklist + rate limit counters
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Run Locally

```bash
git clone https://github.com/seema24jauhari/jwt-auth-service.git
cd jwt-auth-service
cp .env.example .env
docker-compose up -d
npm install
npm run start:dev
```

API available at: `http://localhost:3000`  
Swagger docs at: `http://localhost:3000/api/docs`

### Environment Variables

```env
# App
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/jwt-auth

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# App URL
APP_URL=http://localhost:3000
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create account | Public |
| POST | `/auth/login` | Login → returns token pair | Public |
| POST | `/auth/refresh` | Rotate refresh token | Refresh token |
| DELETE | `/auth/logout` | Revoke session | Access token |
| POST | `/auth/mfa/enable` | Enable TOTP MFA | Access token |
| POST | `/auth/mfa/verify` | Verify TOTP code | Access token |
| GET | `/auth/google` | Google OAuth2 login | Public |
| GET | `/auth/github` | GitHub OAuth2 login | Public |

### User Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Get own profile | Access token |

### Example: Login

```bash
curl -X POST https://jwt-auth-service-fw9g.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "expires_in": 900
}
```

### Example: Access Protected Route

```bash
curl https://your-railway-url.railway.app/users/me \
  -H "Authorization: Bearer eyJhbGci..."
```

---

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts       # Login, register, refresh, logout
│   ├── auth.service.ts          # Business logic
│   ├── strategies/              # JWT, Google, GitHub Passport strategies
│   └── guards/                  # JwtAuthGuard, RolesGuard
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── schemas/user.schema.ts   # MongoDB schema
├── mfa/
│   └── mfa.service.ts           # TOTP generation + verification
├── common/
│   ├── filters/                 # Global exception filter
│   ├── interceptors/            # Logging, correlation ID
│   └── decorators/              # @Roles(), @CurrentUser()
└── config/
    └── configuration.ts         # Env config with validation
```

---

## Security

- **Passwords** hashed with Argon2id (memory-hard, resistant to GPU attacks)
- **Refresh tokens** stored as SHA-256 hash in Redis, never raw
- **Token revocation** via Redis blacklist — logout is instant, no waiting for expiry
- **Rate limiting** on `/auth/login` — 5 requests per 15 minutes per IP
- **HttpOnly cookies** option for refresh token (XSS protection)
- **Helmet.js** — security headers on all responses
- **Input validation** — class-validator DTOs on all endpoints
- **CORS** — whitelist-only origins

---

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

```

---

## CI/CD Pipeline

```
Push to main
  → GitHub Actions
      → Lint (ESLint)
      → Unit Tests
      → e2e Tests (Docker Compose)
      → Docker Build
      → Push to Git
      → Deploy to Render
```

---

## Docker

```bash
# Development
docker-compose up -d

# Production build
docker build -t jwt-auth-service .
docker run -p 3000:3000 --env-file .env jwt-auth-service
```

---

## What I Built This For

This project is part of my transition from 12+ years of PHP backend engineering to the Node.js / TypeScript / NestJS ecosystem. The goal was to build something production-grade — not a tutorial clone — with real security considerations, CI/CD, and deployment.

Next steps on this service: load testing with k6, OpenTelemetry distributed tracing, and Kubernetes deployment on AWS EKS.

---

## License

MIT