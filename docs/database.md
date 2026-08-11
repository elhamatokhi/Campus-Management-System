# Database Setup

The project uses PostgreSQL with Prisma ORM. The same Prisma schema and migrations support both local development and the later Azure deployment.

## Local Database

Local development uses PostgreSQL from `docker-compose.yml`.

```bash
docker compose up -d postgres
```

Local defaults:

```text
POSTGRES_USER=campus_user
POSTGRES_PASSWORD=campus_password
POSTGRES_DB=campus_events
DATABASE_URL=postgresql://campus_user:campus_password@localhost:5432/campus_events
```

When backend services run inside Docker Compose, Compose overrides `DATABASE_URL` to use the internal service name:

```text
DATABASE_URL=postgresql://campus_user:campus_password@postgres:5432/campus_events
```

## Cloud Database

The final Azure deployment will use Azure Database for PostgreSQL Flexible Server.

The application does not need a different Prisma schema for Azure. It switches database targets by receiving a different runtime `DATABASE_URL`.

Conceptual Azure format:

```text
DATABASE_URL=postgresql://<admin_user>:<password>@<server-name>.postgres.database.azure.com:5432/<database_name>?sslmode=require
```

Use placeholders in documentation and examples only. Keep the real Azure URL outside Git.

## TLS / SSL

Azure Database for PostgreSQL Flexible Server requires encrypted TLS connections. For Prisma, configure this through connection string parameters.

For this project, use:

```text
?sslmode=require
```

Do not disable TLS. Do not hardcode certificates or credentials in source code. If a later deployment requires stricter certificate validation, add the relevant TLS parameters or certificate file path through deployment configuration, not through committed source.

## Prisma Commands

Generate Prisma Client:

```bash
npm run db:generate
```

Validate the Prisma schema:

```bash
npm run db:validate
```

Check migration status:

```bash
npm run db:status
```

Run local development migrations:

```bash
npm run db:migrate
```

Apply existing migrations to a deployed database:

```bash
npm run db:deploy
```

`prisma migrate dev` is for local development. It can create migrations and may use development-only workflows.

`prisma migrate deploy` is for deployment. It applies already committed migrations to the target database and does not create new migration files.

## Azure Migration Workflow

After creating an empty Azure PostgreSQL database and configuring `DATABASE_URL` locally or in deployment secrets:

```bash
npm run db:generate
npm run db:deploy
npm run db:status
```

Seed only when intentional:

```bash
npm run db:seed
```

The seed script creates demo users and demo events for this university project. Do not run it automatically on container startup.

## Seeded Demo Users

The seed script creates development/demo users with hashed passwords:

```text
admin@campus.test
student@campus.test
```

Both use this demo-only password:

```text
DevPassword123!
```

These credentials are not production credentials.

## Connectivity Verification

Use the same checks whether `DATABASE_URL` points to local PostgreSQL or Azure PostgreSQL:

```bash
npm run db:validate
npm run db:generate
npm run db:status
```

Then verify the API surface:

User Service:

```text
POST /api/users/register
POST /api/users/login
GET /api/users/me
PUT /api/users/me
```

Event Service:

```text
GET /api/events
GET /api/events/:id
POST /api/events
PUT /api/events/:id
DELETE /api/events/:id
```

Booking Service:

```text
POST /api/bookings
GET /api/bookings
DELETE /api/bookings/:id
```

If these routes work with the same application images and a different `DATABASE_URL`, the database switch is functioning correctly.

## Schema Location

The shared Prisma schema lives at:

```text
prisma/schema.prisma
```

Migration files live in:

```text
prisma/migrations
```

The three microservices use Prisma Client while keeping separate route, controller, and service layers.
