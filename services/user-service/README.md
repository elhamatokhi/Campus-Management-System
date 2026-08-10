# User Service

Node.js + Express microservice for users, authentication, profiles, and roles in the Campus Event Management System.

## Responsibility

The User Service will eventually handle:

- Student and admin registration
- Login
- JWT authentication
- User profile retrieval and updates
- User roles

In Phase 3, this service provides the Express foundation and route structure only. PostgreSQL, Prisma, password hashing, and real JWT authentication will be added later.

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `POST` | `/api/users/register` | Placeholder |
| `POST` | `/api/users/login` | Placeholder |
| `GET` | `/api/users/me` | Placeholder |
| `PUT` | `/api/users/me` | Placeholder |

Placeholder routes return `501 Not Implemented` with a clear JSON message.

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
- `JWT_SECRET`: future JWT signing secret placeholder
- `JWT_EXPIRES_IN`: future JWT token lifetime

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4001/health
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Morgan","email":"alex@university.edu","password":"Password123"}'
```
