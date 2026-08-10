# User Service

Node.js + Express microservice for users, authentication, profiles, and roles in the Campus Event Management System.

## Responsibility

The User Service will eventually handle:

- Student and admin registration
- Login
- JWT authentication
- User profile retrieval and updates
- User roles

As of Phase 6, registration and development profile lookup/update use PostgreSQL through Prisma. Full JWT authentication will be added later.

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `POST` | `/api/users/register` | Database-backed |
| `POST` | `/api/users/login` | Placeholder until JWT phase |
| `GET` | `/api/users/me?id=...` or `/api/users/me?email=...` | Database-backed development lookup |
| `PUT` | `/api/users/me?id=...` or `/api/users/me?email=...` | Database-backed development update |

The `/me` routes use query parameters temporarily because protected JWT routes are intentionally deferred until Phase 7.

## Local Development

Install dependencies from the repository root:

```bash
npm install
```

Run the service:

```bash
npm run dev:user-service
```

Or run it directly as a workspace:

```bash
npm run dev -w services/user-service
```

The service defaults to:

```text
http://localhost:4001
```

## Environment Variables

Copy `.env.example` to `.env` inside this directory for local overrides:

```bash
cp services/user-service/.env.example services/user-service/.env
```

Available variables:

- `PORT`: service port, default `4001`
- `NODE_ENV`: runtime environment
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: future JWT signing secret placeholder
- `JWT_EXPIRES_IN`: future JWT token lifetime

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4001/health
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Morgan","email":"alex@university.edu","password":"Password123"}'
curl "http://localhost:4001/api/users/me?email=alex@university.edu"
```
