# Docker

Docker packages an application with its runtime dependencies into an image. A container is a running instance of that image.

This project builds one image for each deployable application component:

- `campus-frontend`: nginx serving the production React/Vite build
- `campus-user-service`: Express User Service on port `4001`
- `campus-event-service`: Express Event Service on port `4002`
- `campus-booking-service`: Express Booking Service on port `4003`

PostgreSQL remains available through the existing local `docker-compose.yml`.

## Build Images

Run from the repository root:

```bash
npm run docker:build
```

Or build one image:

```bash
npm run docker:build:frontend
npm run docker:build:user-service
npm run docker:build:event-service
npm run docker:build:booking-service
```

The Docker build context is the repository root so backend images can include the shared Prisma schema and generated Prisma Client.

## Runtime Environment

Do not bake secrets into images. Pass runtime configuration with `--env-file .env` or individual `-e` flags.

Backend containers require:

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_ORIGIN
```

Event Service also requires these for image upload:

```text
AZURE_STORAGE_CONNECTION_STRING
AZURE_STORAGE_CONTAINER_NAME
MAX_IMAGE_UPLOAD_BYTES
```

Booking Service also uses:

```text
USER_SERVICE_URL
EVENT_SERVICE_URL
```

For containers running on Docker Desktop and connecting to PostgreSQL published on the host, use a container-friendly database URL such as:

```text
DATABASE_URL=postgresql://campus_user:campus_password@host.docker.internal:5432/campus_events
```

## Run Containers Locally

Start PostgreSQL first:

```bash
docker compose up -d postgres
```

Run database migrations from the host. Application containers do not run destructive migrations on startup:

```bash
npm run db:migrate
```

Run the backend containers:

```bash
docker run --rm --name campus-user-service \
  --env-file .env \
  -e DATABASE_URL=postgresql://campus_user:campus_password@host.docker.internal:5432/campus_events \
  -p 4001:4001 \
  campus-user-service

docker run --rm --name campus-event-service \
  --env-file .env \
  -e DATABASE_URL=postgresql://campus_user:campus_password@host.docker.internal:5432/campus_events \
  -p 4002:4002 \
  campus-event-service

docker run --rm --name campus-booking-service \
  --env-file .env \
  -e DATABASE_URL=postgresql://campus_user:campus_password@host.docker.internal:5432/campus_events \
  -p 4003:4003 \
  campus-booking-service
```

Run the frontend container:

```bash
docker run --rm --name campus-frontend -p 8080:80 campus-frontend
```

Open:

```text
http://localhost:8080
```

## Health Checks

```bash
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:8080
```

## Security Notes

- `.dockerignore` excludes `.env`, `node_modules`, git metadata, and local build outputs.
- Secrets must be passed at container runtime.
- Prisma Client is generated during image build, but migrations are run manually from the host or a controlled release job.
