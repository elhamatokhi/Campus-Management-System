# Architecture

## Overview

The Campus Management System uses a microservice architecture. Each backend service owns one business area, and the React frontend communicates with those services through REST APIs.

## Final Cloud Flow

```text
Browser
-> React/Vite frontend on Azure Container Apps
-> nginx same-origin /api proxy
-> internal Azure Container Apps backend services
   - User Service
   - Event Service
   - Booking Service
-> Azure Database for PostgreSQL
```

Event images are uploaded through the Event Service to Azure Blob Storage. PostgreSQL stores the resulting image URL, not the binary image data.

Booking creation also triggers asynchronous serverless processing:

```text
Booking Service
-> Azure Storage Queue booking-notifications
-> Azure Function bookingNotificationProcessor
```

## Services

- User Service handles registration, login, JWT authentication, profiles, and roles.
- Event Service handles public event reads, admin event management, and event image upload.
- Booking Service handles booking creation, booking lists, cancellation, ownership rules, duplicate booking prevention, capacity checks, and notification queue publishing.

## Deployment

The active deployment target is Azure Container Apps. Docker images are stored in Azure Container Registry and pulled by Container Apps through managed identity with `AcrPull`.

Kubernetes manifests remain under `k8s/` and `kubernetes/` as an original/alternative orchestration artifact, but they are not the live deployment path.
