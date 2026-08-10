# Docker Plan

Each deployable component will receive its own Dockerfile:

- `frontend/Dockerfile`
- `services/user-service/Dockerfile`
- `services/event-service/Dockerfile`
- `services/booking-service/Dockerfile`

A root `docker-compose.yml` will be added for local development with:

- frontend
- user-service
- event-service
- booking-service
- postgres

Docker Compose will be introduced after the first runnable services exist.

