# User Service

Node.js + Express microservice for users, authentication, profiles, and roles in the Campus Event Management System.

## Responsibility

The User Service handles:

- Student and admin registration
- Login
- JWT authentication
- User profile retrieval and updates
- User roles

Registration and login use PostgreSQL, hashed passwords, and JWT authentication.

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `POST` | `/api/users/register` | Database-backed |
| `POST` | `/api/users/login` | Database-backed JWT login |
| `GET` | `/api/users/me` | Protected |
| `PUT` | `/api/users/me` | Protected |

Protected routes require:

```text
Authorization: Bearer <token>
```

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

For normal monorepo development, put local configuration in the root `.env` file:

```bash
cp .env.example .env
```

The User Service loads the root `.env` first. A `services/user-service/.env` file is optional and only fills variables that are missing from the root `.env`.

Available variables:

- `PORT`: service port, default `4001`
- `NODE_ENV`: runtime environment
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT token lifetime

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4001/health
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Morgan","email":"alex@university.edu","password":"Password123"}'

curl -X POST http://localhost:4001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.test","password":"DevPassword123!"}'

curl http://localhost:4001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
