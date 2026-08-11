# Docker And Compose

Docker packages an application and its runtime dependencies into an image. A container is a running instance of an image. Docker Compose runs several containers together on one local network.

This project has five local Compose services:

- `postgres`: PostgreSQL database
- `user-service`: Express User Service on port `4001`
- `event-service`: Express Event Service on port `4002`
- `booking-service`: Express Booking Service on port `4003`
- `frontend`: nginx serving the production React/Vite build on port `8080`

## Images

Application image names:

```text
campus-frontend
campus-user-service
campus-event-service
campus-booking-service
```

Build all application images:

```bash
npm run docker:build
```

Compose can also build them:

```bash
docker compose build
```

## Azure Container Registry

For Azure deployment preparation, tag these same images with an ACR login server and push them:

```text
<registry>.azurecr.io/campus-frontend:latest
<registry>.azurecr.io/campus-user-service:latest
<registry>.azurecr.io/campus-event-service:latest
<registry>.azurecr.io/campus-booking-service:latest
```

Use Azure CLI authentication:

```bash
az login
az acr login --name <registry-name>
```

The complete tag, push, and verification workflow is documented in [Azure Container Registry](azure-container-registry.md).

## Environment

Local development uses the root `.env` file. Do not commit real secrets.

Backend containers receive runtime configuration from `.env`, with Compose overrides for container networking:

```text
DATABASE_URL=postgresql://campus_user:campus_password@postgres:5432/campus_events
FRONTEND_ORIGIN=http://localhost:8080
```

For Azure deployment later, use the same backend images and supply an Azure PostgreSQL `DATABASE_URL` at runtime instead of the Compose-local `postgres` URL.

The Event Service also receives Azure Blob Storage configuration at runtime:

```text
AZURE_STORAGE_CONNECTION_STRING
AZURE_STORAGE_CONTAINER_NAME
MAX_IMAGE_UPLOAD_BYTES
```

Secrets are not baked into images. `.dockerignore` excludes `.env` files, `node_modules`, git metadata, and local build outputs.

## Service Networking

Inside Docker Compose, services communicate by service name:

```text
postgres:5432
user-service:4001
event-service:4002
booking-service:4003
```

Do not use `localhost` for container-to-container traffic. Inside a container, `localhost` means that same container.

The production frontend is different because API calls are made by the user's browser, not by the nginx container. Browser-facing API URLs must use host ports:

```text
http://localhost:4001
http://localhost:4002
http://localhost:4003
```

Vite injects these values at build time. The Compose frontend build passes them as Docker build args.

## Database Migrations

Application containers do not run migrations on startup. Run Prisma migrations deliberately from the host:

```bash
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

For a reset of local development data:

```bash
npm run db:reset
```

## Run Full Stack

Build and start everything:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:8080
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove the local PostgreSQL volume:

```bash
docker compose down -v
```

## Inspect

Check status:

```bash
docker compose ps
```

Read all logs:

```bash
docker compose logs
```

Read one service log:

```bash
docker compose logs event-service
```

Health endpoints:

```bash
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:8080
```

## Non-Docker Development

The original local workflow still works:

```bash
npm run dev:user-service
npm run dev:event-service
npm run dev:booking-service
npm run dev:frontend
```
