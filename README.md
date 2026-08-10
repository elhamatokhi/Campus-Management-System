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

Phase 1: project foundation.

This phase creates the repository structure, documentation starting points, and environment examples. Application code will be added in later phases.

## Local Development

Requirements:

- Node.js 20 or newer
- npm
- Docker Desktop, for later Docker Compose phases

Initial setup:

```bash
npm install
npm run dev
```

At the end of Phase 1, `npm run dev` only confirms that the foundation is ready. Real frontend and backend development servers will be added in the next phases.

## Environment Variables

Copy `.env.example` to `.env` before running services that need local configuration:

```bash
cp .env.example .env
```

Never commit real secrets.

## Documentation

Additional project notes are in the `docs/` directory:

- [Architecture](docs/architecture.md)
- [API Plan](docs/api.md)
- [Docker Plan](docs/docker.md)
- [Kubernetes Plan](docs/kubernetes.md)
- [Azure Deployment Plan](docs/azure-deployment.md)

## Suggested Commit Message

```text
feat: initialize project structure
```

