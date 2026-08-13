# Project Journey
A reflection on the thought process.
## Initial Goal

The goal was to build a project that demonstrates a realistic campus event management system using modern full-stack and cloud concepts. The application needed to demonstrate real deployment, persistence, authentication, containerization, and serverless processing.

## Application Development

The project started with a React + Vite frontend and a clear campus-event workflow. Students can browse events, view details, register, log in, book events, cancel bookings, view cancelled booking history, and manage their profile. Admin users have a separate experience focused on event operations, including a role-specific homepage, Admin Dashboard, and event create/edit/delete flows.

The frontend moved from placeholder UI data to real REST API integration. This required adding auth state, protected routes, role-aware navigation, API helpers, loading states, empty states, and user-friendly error messages.

## Microservices and Database

The backend was split into three Express services:

- User Service: registration, login, profile, JWT authentication, and roles.
- Event Service: event CRUD and Azure Blob Storage image upload.
- Booking Service: booking creation, listing, cancellation, duplicate booking prevention, capacity checks, and queue notification publishing.

PostgreSQL and Prisma provide the shared data model. The schema includes users, events, bookings, role/status enums, relationships, indexes, and migration history. Keeping the services separate made each business responsibility easier to test and explain.
## Containerization

Each frontend/backend application was containerized with Docker. Docker Compose provides the local full-stack environment with PostgreSQL, the three backend services, and the production frontend nginx container.

## Moving to Azure

The cloud deployment uses:

- Azure Container Registry for Docker images.
- Azure Container Apps for the frontend and backend services.
- Azure Database for PostgreSQL for managed persistence.
- Azure Blob Storage for event images.
- Azure Storage Queue and Azure Functions for asynchronous booking notification processing.

Runtime secrets are supplied through Azure configuration rather than Docker images or source control.

## Kubernetes / AKS Attempt

Kubernetes manifests were prepared under `k8s/` and `kubernetes/` because AKS was the original orchestration plan. The manifests demonstrate Deployments, Services, ConfigMaps, Secrets, probes, resource requests, and same-origin frontend API proxying.

During deployment, Azure for Students vCPU/quota restrictions blocked provisioning a usable AKS environment. This was treated as a deployment constraint rather than a project failure.

## Why Azure Container Apps Was Chosen

Azure Container Apps was selected as the final orchestration solution because it fit the project constraints better:

- It runs containerized applications without managing AKS nodes.
- It supports external frontend ingress and internal backend services.
- It works with managed identity and `AcrPull` for image pulls.
- It keeps the operational model simpler and more cost-conscious for a student subscription.

The trade-off is that ACA hides some Kubernetes-level mechanics, but it still demonstrates container orchestration, service deployment, runtime configuration, revisions, managed identity, and cloud networking.

## ARM64 vs AMD64 Challenge

Development happened on macOS, so local Docker images were initially built as `linux/arm64`. Azure Container Apps requires compatible Linux container images for its runtime, so the build workflow was updated to use Docker Buildx:

```bash
docker buildx build --platform linux/amd64 --provenance=false --push
```

The project now separates image build/push from Azure deployment through:

```bash
./scripts/build-push-aca-images.sh
./scripts/deploy-container-apps.sh
```

This made deployment faster, safer, and easier to debug one service at a time.

## Azure Container Apps Deployment Challenges

Several deployment issues shaped the final workflow:

- ACR required clear separation between the registry resource name and login server.
- Container Apps image pulls were configured through managed identity and `AcrPull`, avoiding registry passwords.
- Mutable `latest` tags made revision debugging unreliable, so the workflow supports explicit unique image tags.
- The frontend had to use HTTPS same-origin API calls to avoid browser mixed-content blocking.
- Azure PostgreSQL required correct connection strings, TLS, firewall/network access, and committed Prisma migrations.

These issues reinforced the difference between local Docker networking and cloud runtime networking.

## Azure Functions

Azure Functions was introduced for serverless, asynchronous booking notification processing. A direct microservice endpoint would have duplicated backend responsibilities, while a queue-triggered Function demonstrates event-driven cloud processing cleanly.

## Testing and Validation

Testing was added at several levels, including frontend tests, service-level tests, booking queue integration tests, and Azure Function tests. The final serverless workflow was also validated in Azure by creating real bookings and verifying queue publication and Function execution.

## Key Lessons Learned

- Cloud runtime behavior can differ significantly from local development behavior.
- Observability and safe logging are essential when debugging serverless and container deployments.
- Build and deployment should be separate steps.
- Unique image tags are more reliable than mutable `latest` tags for cloud revisions.
- Asynchronous queue processing keeps the user-facing booking flow simpler and more resilient.

## Reflection

The project evolved from a planned AKS deployment to a working Azure Container Apps deployment. This adjustment proved to be a better fit for the project context: the final system remains cloud-native, containerized, and service-oriented while being easier to operate within the constraints of a student Azure environment.

If I were starting the project again, I would define the deployment workflow, image-tagging strategy, and runtime configuration conventions earlier. I would also introduce diagnostic logging sooner, particularly around queue publishing and cloud startup behavior. One of the most important lessons from the project was that application architecture and cloud deployment architecture need to be designed and validated together rather than treated as separate concerns.

I would also plan the notification feature as an end-to-end workflow from the beginning rather than primarily as a backend serverless process. The current implementation demonstrates asynchronous notification processing through Azure Storage Queue and Azure Functions, but the result is not visible to users in the frontend. With earlier planning, the Azure Function could also persist notification records that could later be retrieved and displayed in the application. This would allow the required database model, API endpoints, serverless processing, and frontend notification components to be designed together as one complete workflow.
