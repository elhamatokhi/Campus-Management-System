# Campus Event Management System

A university Cloud IT final project for managing campus events, registrations, bookings, and admin workflows.

## Project Overview

This repository will contain a full-stack, microservice-based application that students can use to discover and book university events. Admin users will be able to manage events and review bookings.

The project is being built incrementally so each phase remains understandable and runnable.

## Planned Features

- Student registration and login
- Event browsing, search, and filtering
- Event detail pages
- Event booking and cancellation
- Student profile management
- Admin event management
- Event image upload support
- Serverless booking notification component

## Architecture

The target architecture is:

- React + Vite frontend
- Node.js + Express backend microservices
- PostgreSQL database
- Prisma ORM
- Azure Blob Storage for images/files
- Docker containers
- Kubernetes manifests for AKS deployment
- Azure Functions for serverless processing

## Microservices

The backend will be split into three services:

- `services/user-service`: registration, login, profiles, roles, authentication
- `services/event-service`: event creation, updates, deletion, search, image references
- `services/booking-service`: booking creation, booking lists, cancellation, availability

## Current Phase

Azure Container Registry preparation.

The React frontend, three backend services, local PostgreSQL, Prisma persistence, JWT authorization, Azure Blob Storage image upload, Docker images, and Docker Compose stack are implemented. The project is prepared for manually pushing images to Azure Container Registry.

## Local Development

Requirements:

- Node.js 20 or newer
- npm
- Docker Desktop, for local PostgreSQL

Initial setup:

```bash
npm install
npm run dev
```

Start the local database and apply Prisma setup:

```bash
docker compose up -d postgres
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Run the full stack in separate terminals:

```bash
npm run dev:user-service
npm run dev:event-service
npm run dev:booking-service
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

## Docker Compose

Docker Compose runs the local container stack:

- PostgreSQL
- User Service
- Event Service
- Booking Service
- frontend nginx container

Prepare the database first:

```bash
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

Then start the full stack:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

Useful commands:

```bash
docker compose ps
docker compose logs
docker compose logs event-service
docker compose down
```

Development users after seeding:

```text
admin@campus.test / DevPassword123!
student@campus.test / DevPassword123!
```

## Environment Variables

Copy the root `.env.example` to a root `.env` before running services that need local configuration:

```bash
cp .env.example .env
```

Never commit real secrets.

The backend services load the root `.env` first when started from the monorepo scripts. Service-level `.env` files are optional and should only be used for local overrides that are not already defined in the root `.env`.

## Documentation

Additional project notes are in the `docs/` directory:

- [Architecture](docs/architecture.md)
- [API Plan](docs/api.md)
- [Database Setup](docs/database.md)
- [Azure PostgreSQL](docs/azure-postgresql.md)
- [Azure Blob Storage](docs/azure-storage.md)
- [Azure Container Registry](docs/azure-container-registry.md)
- [Docker Plan](docs/docker.md)
- [Kubernetes Plan](docs/kubernetes.md)
- [Azure Deployment Plan](docs/azure-deployment.md)

## Database

Local PostgreSQL is configured through `docker-compose.yml`. Prisma schema, migrations, and seed data live in the `prisma/` directory.

```bash
docker compose up -d postgres
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Suggested Commit Message

```text
feat: initialize project structure
```
