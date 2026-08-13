# Azure Container Apps Deployment

Azure Container Apps (ACA) is the active container orchestration platform for the Campus Management System. It hosts the React frontend and the three backend microservices while integrating with the other Azure services used by the application.

## Deployment Architecture

The deployed application follows this structure:

```text
Browser
   ↓
Azure Container Apps
   ↓
Frontend (React + NGINX)
   │
   ├── /api/users     → User Service
   ├── /api/events    → Event Service
   └── /api/bookings  → Booking Service
                           │
       ┌───────────────────┼────────────────────┐
       ↓                   ↓                    ↓
Azure PostgreSQL    Azure Blob Storage    Azure Storage Queue
                                              ↓
                                        Azure Function
```

The frontend is externally accessible, while the backend services use internal Container Apps ingress and are reached through the frontend NGINX reverse proxy.

## Container Apps

Four application containers are deployed:

- `campus-frontend`
- `campus-user-service`
- `campus-event-service`
- `campus-booking-service`

They run inside the `campus-containerapps-env` Container Apps environment.

The frontend provides the public entry point to the application. The backend services remain internal and expose the application APIs to the frontend through same-origin routing.

## Frontend and API Routing

During local development, the frontend communicates with backend services through local ports.

In Azure, the frontend instead uses same-origin API paths:

```text
/api/users
/api/events
/api/bookings
```

The production NGINX container routes these requests to the corresponding internal Container Apps:

```text
/api/users     → campus-user-service
/api/events    → campus-event-service
/api/bookings  → campus-booking-service
```

This avoids exposing each backend service publicly and prevents browser mixed-content and internal DNS issues.

## Container Images

Application images are stored in Azure Container Registry and built for:

```text
linux/amd64
```

Docker Buildx is used because development was performed on Apple Silicon (`arm64`) while the Azure deployment requires compatible AMD64 images.

Image building and deployment are intentionally separated:

```text
Source Code
    ↓
Docker Buildx
    ↓
Azure Container Registry
    ↓
Azure Container Apps
```

The project provides:

```bash
./scripts/build-push-aca-images.sh
./scripts/deploy-container-apps.sh
```

Both scripts support `user`, `event`, `booking`, `frontend`, and `all` targets, allowing individual services to be rebuilt or redeployed without affecting the entire application.

Unique image tags can be used to identify exactly which build is associated with a Container Apps revision.

## Managed Identity and ACR

Azure Container Apps retrieves private application images from Azure Container Registry using a user-assigned managed identity.

The identity:

```text
campus-containerapps-acr-pull
```

is granted the Azure `AcrPull` role on the registry.

The relationship is:

```text
Azure Container Registry
        ↓
Managed Identity + AcrPull
        ↓
Azure Container Apps
```

This avoids storing registry usernames or passwords in the application configuration.

## Runtime Configuration and Secrets

Environment-specific configuration is supplied when the containers are deployed rather than being included in the Docker images.

Sensitive values include:

```text
DATABASE_URL
JWT_SECRET
AZURE_STORAGE_CONNECTION_STRING
BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING
```

These values are stored as Container Apps secrets and referenced through environment variables.

Other configuration includes the event-image container name, booking notification queue name, JWT expiration, frontend origin, and internal service URLs.

This allows the same application images to be used with different runtime environments without embedding credentials in the images.

## Scaling and Resources

The project uses a Consumption-based Container Apps environment with small CPU and memory allocations appropriate for a university demonstration application.

The deployment is configured with:

```text
Minimum replicas: 1
Maximum replicas: 3
```

A minimum of one replica keeps each application available for the live demo, while Azure can create additional replicas when required.

The maximum of three limits resource usage for the student environment.

After demonstration and evaluation, the minimum replica count can be reduced to `0` if lower idle resource usage is preferred.

## Health and Availability

The backend services expose:

```text
GET /health
```

These endpoints provide a lightweight way to confirm that each service is running and responding.

Azure Container Apps also manages container startup, readiness, revisions, ingress, and replica lifecycle as part of the orchestration environment.

## Deployment Workflow

The deployment script manages the Container Apps-specific parts of the cloud deployment.

Its main responsibilities are:

1. Verify the Azure environment and existing Container Registry.
2. Create or reuse the Container Apps environment.
3. Create or reuse the managed identity.
4. Ensure the identity has `AcrPull` access.
5. Deploy the requested image from ACR.
6. Configure secrets and environment variables.
7. Configure internal or external ingress.
8. Create a new Container Apps revision when application configuration or images change.

The workflow is designed to be safely rerunnable and supports deploying individual application components.

## Revisions

Azure Container Apps creates revisions when application images or revision-scoped configuration change.

This was useful during development because individual deployments could be identified by both their image tag and revision.

For example:

```text
Source change
    ↓
New image tag
    ↓
Image pushed to ACR
    ↓
Container App updated
    ↓
New revision
```

Using unique image tags made deployment verification and troubleshooting more reliable than relying only on the mutable `latest` tag.

## Integration with Other Azure Services

The Container Apps deployment forms the application layer of the larger Azure architecture:

```text
Azure Container Registry
        ↓
Azure Container Apps
        │
        ├── Azure Database for PostgreSQL
        ├── Azure Blob Storage
        └── Azure Storage Queue
                    ↓
              Azure Function
```

PostgreSQL provides persistent application data, Blob Storage stores event images, and the Booking Service publishes notification messages to Azure Storage Queue for asynchronous processing by the Azure Function.

## Final Deployment

The deployed frontend provides the public entry point to the complete application:

```text
https://campus-frontend.icyglacier-9ccad18f.francecentral.azurecontainerapps.io
```

The backend Container Apps remain internal and are accessed through the frontend's NGINX proxy.

Azure Container Apps therefore provides the final orchestration layer connecting the project's containerized frontend and microservices with the managed Azure database, storage, and serverless components.