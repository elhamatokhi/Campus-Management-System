# Docker And Compose

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

For Azure deployment, images are built and pushed with an ACR login server:

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

## Azure Container Apps Images

Local Compose images are built for local Docker networking. Azure Container Apps images are built separately as `linux/amd64` images:

```bash
IMAGE_TAG=<unique-tag> ./scripts/build-push-aca-images.sh all
```

The Container Apps frontend image builds Vite with same-origin API paths and uses nginx to proxy:

```text
/api/users -> http://campus-user-service
/api/events -> http://campus-event-service
/api/bookings -> http://campus-booking-service
```

Explicit image tags are uesd for deployment updates instead of relying only on mutable `latest`.

## Environment

Local development uses the root `.env` file.

Backend containers receive runtime configuration from `.env`, with Compose overrides for container networking:

```text
LOCAL_DATABASE_URL=postgresql://<postgres_user>:<url_encoded_postgres_password>@postgres:5432/<postgres_db>
DATABASE_URL=${LOCAL_DATABASE_URL}
FRONTEND_ORIGIN=http://localhost:8080
```

For Azure deployment, supply an Azure PostgreSQL `DATABASE_URL` at runtime instead of the Compose-local `postgres` URL.

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