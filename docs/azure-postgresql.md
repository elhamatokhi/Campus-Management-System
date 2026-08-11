# Azure Database For PostgreSQL

This project is prepared to use Azure Database for PostgreSQL Flexible Server for the final cloud deployment.

Do not create Azure resources automatically from this repository. Create the server manually in the Azure Portal to control cost.

## Why Azure PostgreSQL

The application already uses PostgreSQL locally through Docker and Prisma. Azure Database for PostgreSQL Flexible Server provides a managed PostgreSQL database for the deployed application while keeping the same Prisma schema, migrations, and `DATABASE_URL` configuration pattern.

## Application Configuration

The only database connection mechanism is:

```text
DATABASE_URL
```

Local development:

```text
DATABASE_URL=postgresql://campus_user:campus_password@localhost:5432/campus_events
```

Docker Compose internal networking:

```text
DATABASE_URL=postgresql://campus_user:campus_password@postgres:5432/campus_events
```

Azure PostgreSQL:

```text
DATABASE_URL=postgresql://<admin_user>:<password>@<server-name>.postgres.database.azure.com:5432/<database_name>?sslmode=require
```

Keep the real Azure value in local `.env`, deployment secrets, or future Kubernetes Secret configuration. Do not commit it.

## TLS / SSL

Azure Database for PostgreSQL Flexible Server requires encrypted TLS connections. Add `sslmode=require` to the Azure `DATABASE_URL`.

Do not use `sslmode=disable`.

If a future deployment requires stricter certificate verification, configure the needed TLS certificate parameters through runtime configuration and deployment files that do not contain secrets.

## Prisma Workflow

The same migration history applies to local and Azure databases.

Local development:

```bash
npm run db:migrate
```

Azure or deployment database:

```bash
npm run db:generate
npm run db:deploy
npm run db:status
```

Use `db:deploy` for Azure because it runs `prisma migrate deploy`, which applies existing committed migrations without creating new migration files.

## Optional Demo Seed

Seed only when intentional:

```bash
npm run db:seed
```

The seed creates demo accounts:

```text
admin@campus.test / DevPassword123!
student@campus.test / DevPassword123!
```

These are development/demo credentials for the university project. Do not treat them as production credentials.

## Manual Azure Portal Setup

Create:

```text
Azure Database for PostgreSQL Flexible Server
```

Inspect these portal choices:

- Subscription: choose your Azure for Students subscription.
- Resource group: create or reuse a project resource group.
- Server name: choose a globally unique, project-specific name.
- Region: choose an allowed region for your subscription. Azure for Students may restrict available regions.
- PostgreSQL version: choose a currently supported version. PostgreSQL 16 is a reasonable match for the local Docker image if available.
- Workload / compute tier: choose the smallest sensible Burstable option available for development.
- High availability: disable for this project to reduce cost.
- Storage: choose the smallest storage size allowed by the portal for development.
- Backup retention: choose the lowest acceptable retention for the project.
- Authentication: use PostgreSQL authentication unless your course requires Microsoft Entra integration.
- Admin username/password: create a strong password and store it outside Git.
- Networking: for initial development, public access can be used with firewall rules limited to your IP. For later production hardening, prefer private networking when the deployment architecture supports it.
- Firewall: add your current client IP if you need to run Prisma migrations from your machine.

Do not enable read replicas, geo-redundancy, high availability, paid monitoring extras, General Purpose compute, or Memory Optimized compute unless the project requirements change.

## After Creation

1. Create or confirm the database name, for example:

   ```text
   campus_events
   ```

2. Build the Azure `DATABASE_URL` with placeholders replaced locally:

   ```text
   postgresql://<admin_user>:<password>@<server-name>.postgres.database.azure.com:5432/campus_events?sslmode=require
   ```

3. Run:

   ```bash
   npm run db:generate
   npm run db:deploy
   npm run db:status
   ```

4. Optionally seed:

   ```bash
   npm run db:seed
   ```

5. Start services with that `DATABASE_URL` and verify the normal APIs:

   - user registration/login/profile
   - event create/read/update/delete
   - booking create/list/cancel

## Docker Compatibility

The Docker images do not contain database credentials. The same backend images can connect to local PostgreSQL or Azure PostgreSQL by changing runtime `DATABASE_URL`.
