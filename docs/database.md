# Database Setup

The project uses PostgreSQL with Prisma ORM.

## Local PostgreSQL

Start only the local database:

```bash
docker compose up -d postgres
```

The local database defaults are:

```text
POSTGRES_USER=campus_user
POSTGRES_PASSWORD=campus_password
POSTGRES_DB=campus_events
```

Use this connection string for local development:

```text
DATABASE_URL=postgresql://campus_user:campus_password@localhost:5432/campus_events
```

## Prisma Commands

Generate Prisma Client:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate
```

Seed development data:

```bash
npm run db:seed
```

Reset the development database:

```bash
npm run db:reset
```

## Seeded Development Users

The seed script creates development-only users with hashed passwords:

```text
admin@campus.test
student@campus.test
```

Both use this development-only password:

```text
DevPassword123!
```

These credentials are for local development only.

## Schema Location

The shared Prisma schema lives at:

```text
prisma/schema.prisma
```

The three microservices use Prisma Client while keeping separate route, controller, and service layers.

