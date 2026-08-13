# Kubernetes / AKS Preparation

Kubernetes was the original container orchestration approach prepared for the Campus Management System before the final Azure deployment moved to Azure Container Apps.

The Kubernetes manifests remain in the repository as an orchestration artifact, but they are not used by the currently deployed application.

## Original Architecture

The prepared deployment model was:

```text
Docker Images
      ↓
Azure Container Registry
      ↓
Azure Kubernetes Service (AKS)
      ↓
Kubernetes Deployments
      ↓
Pods
      ↓
Kubernetes Services
      ↓
Frontend / APIs
```

The manifests are located in:

```text
kubernetes/
```

They include Deployments and Services for the frontend and three backend microservices, together with configuration, secret templates, health probes, resource limits, and nginx routing configuration.

## Service Architecture

The backend services were designed to run internally through Kubernetes `ClusterIP` services:

```text
Frontend / NGINX
      │
      ├── /api/users     → User Service
      ├── /api/events    → Event Service
      └── /api/bookings  → Booking Service
```

NGINX provides same-origin API routing because Kubernetes service names are available inside the cluster but cannot be resolved directly by the user's browser.

Health probes were also prepared for the services using `/health` for the backend services and `/` for the frontend.

## Azure Container Registry Integration

The Kubernetes manifests reference the same application images stored in Azure Container Registry:

- `campus-frontend`
- `campus-user-service`
- `campus-event-service`
- `campus-booking-service`

The intended AKS architecture used managed identity and the Azure `AcrPull` role rather than storing registry credentials in Kubernetes.

## Why AKS Was Not Used for the Final Deployment

During deployment, the Azure for Students subscription did not provide sufficient available vCPU quota to provision a usable AKS node pool.

Several allowed regions and VM configurations were investigated, but the subscription quota remained the limiting factor.

Rather than changing the application architecture or abandoning container orchestration, Azure Container Apps was selected as the final deployment solution.

The final production architecture therefore uses:

```text
Docker Images
      ↓
Azure Container Registry
      ↓
Azure Container Apps
      ↓
Frontend + Backend Microservices
```

Azure Container Apps provides the container orchestration required by the project without requiring the project to manage Kubernetes worker nodes directly.

## Current Status

The Kubernetes manifests are retained to document the original orchestration design and the Kubernetes preparation completed during development.

They demonstrate concepts including:

- Kubernetes Deployments and Pods
- Services and internal service discovery
- ConfigMaps and Secret templates
- Health probes
- CPU and memory resource configuration
- NGINX reverse-proxy routing
- Azure Container Registry integration

They are not part of the active production deployment.

For the final cloud implementation, see [Azure Container Apps Deployment](AZURE-CONTAINER-APPS-DEPLOYMENT.md).