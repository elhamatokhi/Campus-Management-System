# Azure Database for PostgreSQL

Azure Database for PostgreSQL Flexible Server provides the managed relational database for the deployed Campus Management System. The same PostgreSQL and Prisma data model used during local development is used by the application in Azure.

The database layer follows this flow:

```text
User Service ──────┐
Event Service ─────┼──→ Prisma ORM ──→ Azure Database for PostgreSQL
Booking Service ───┘
```

## Role in the Project

PostgreSQL provides persistent storage for the application's core data, including users, events, bookings, roles, booking statuses, and relationships between these entities.

Prisma ORM is used by the backend services to interact with PostgreSQL. The project maintains a shared Prisma schema and migration history, allowing the same database structure to be used locally and in Azure.

This keeps the application code independent of the database location:

```text
Local Development → PostgreSQL in Docker
Cloud Deployment  → Azure Database for PostgreSQL
```

The backend services connect to the appropriate database through runtime configuration rather than changing application code.

## Database Configuration

The main database connection variable used by the backend services is:

```text
DATABASE_URL
```

In Azure, the connection follows the PostgreSQL Flexible Server format:

```text
postgresql://<user>:<password>@<server>.postgres.database.azure.com:5432/<database>?sslmode=require
```

The real connection string is stored as a runtime secret and is not committed to the repository.

For local Docker development, `LOCAL_DATABASE_URL` provides the Prisma connection URL for the PostgreSQL container.

## Prisma and Migrations

Prisma manages the application's database schema and migration history.

During development, schema changes are created as Prisma migrations and committed to the repository. The same committed migrations are then applied to the Azure database using:

```bash
npm run db:deploy
```

This uses `prisma migrate deploy`, allowing the cloud database to reproduce the schema defined and tested during development without creating new migration files during deployment.

## Secure Connections

Connections to Azure Database for PostgreSQL use TLS encryption through:

```text
sslmode=require
```

Database credentials are not stored in Docker images or committed source files. In the Azure deployment, the database connection string is supplied to the backend Container Apps through runtime secret configuration.

This separates application images from environment-specific credentials.

## Integration with Azure Container Apps

The three backend services deployed through Azure Container Apps connect to the same managed PostgreSQL database:

```text
Azure Container Apps
        │
        ├── User Service ──────┐
        ├── Event Service ─────┼──→ Azure PostgreSQL
        └── Booking Service ───┘
```

The frontend does not connect directly to the database. Database access remains behind the backend service APIs.

## Local and Cloud Compatibility

The same backend application images can work with either local PostgreSQL or Azure PostgreSQL because the database location is provided through environment configuration.

```text
Local:
Backend Services
      ↓
PostgreSQL Docker Container

Azure:
Backend Services
      ↓
Azure Database for PostgreSQL
```

This allows the application to maintain the same Prisma schema, migrations, and service logic across local development and cloud deployment.