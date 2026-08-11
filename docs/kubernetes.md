# Kubernetes / AKS Preparation

Kubernetes runs container images as Pods, keeps them alive through Deployments, and exposes them through Services.

Project flow:

```text
Docker images
-> Azure Container Registry
-> AKS
-> Kubernetes Deployments
-> Pods
-> Kubernetes Services
-> frontend/API
```

## Manifests

The AKS preparation manifests live in:

```text
kubernetes/
```

Files:

- `configmap.yaml`: non-secret runtime configuration
- `secret.example.yaml`: placeholder template for required secrets
- `frontend-nginx-configmap.yaml`: nginx same-origin API reverse proxy
- `*-deployment.yaml`: application Deployments
- `*-service.yaml`: Kubernetes Services
- `kustomization.yaml`: groups the non-secret deployable manifests

The committed manifests use ACR images:

```text
campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-frontend:latest
campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-user-service:latest
campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-event-service:latest
campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-booking-service:latest
```

Use explicit tags such as `v1.0.0` later after confirming those tags exist in ACR.

## Frontend/API Routing

Kubernetes DNS names such as `user-service` only resolve inside the cluster. The React app runs in the user's browser, so browser-side API URLs cannot use Kubernetes DNS names.

The prepared AKS approach is same-origin routing:

```text
browser
-> frontend nginx
-> /api/users/*    -> user-service:4001
-> /api/events/*   -> event-service:4002
-> /api/bookings/* -> booking-service:4003
```

The frontend image must be built for same-origin API requests by setting Vite service URL build args to empty strings:

```bash
docker build -f frontend/Dockerfile \
  --build-arg VITE_USER_SERVICE_URL= \
  --build-arg VITE_EVENT_SERVICE_URL= \
  --build-arg VITE_BOOKING_SERVICE_URL= \
  -t campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-frontend:latest .
```

Then push the updated frontend image:

```bash
docker push campusmngmntacr-hedvhmc7e6ccdret.azurecr.io/campus-frontend:latest
```

Docker Compose remains unchanged because it still passes explicit `localhost` API URLs at build time.

## Services

Backend Services use `ClusterIP`:

```text
user-service:4001
event-service:4002
booking-service:4003
```

The frontend Service also uses `ClusterIP` for this preparation phase. This avoids provisioning an Azure Load Balancer before you intentionally deploy.

Initial testing after AKS creation can use:

```bash
kubectl port-forward service/frontend 8080:80
```

A later phase can add either:

- a frontend `LoadBalancer` Service, which creates a billable Azure Load Balancer/Public IP, or
- an Ingress Controller, which is cleaner for production-style routing but adds more components.

## Configuration

Non-secret values are in `configmap.yaml`.

Secrets must be created manually from `secret.example.yaml`:

```text
DATABASE_URL
JWT_SECRET
AZURE_STORAGE_CONNECTION_STRING
```

Do not commit real secret values.

`DATABASE_URL` must point to Azure Database for PostgreSQL Flexible Server:

```text
postgresql://<admin_user>:<password>@<server-name>.postgres.database.azure.com:5432/<database_name>?sslmode=require
```

Do not deploy PostgreSQL inside AKS.

## Health Probes

Backend probes use:

```text
/health
```

Frontend probes use:

```text
/
```

The probes are intentionally simple for this student project.

## Resource Requests And Limits

The manifests use conservative resource values:

- frontend nginx: `50m` CPU / `64Mi` request, `150m` CPU / `128Mi` limit
- User Service: `100m` CPU / `128Mi` request, `250m` CPU / `256Mi` limit
- Event Service: `100m` CPU / `128Mi` request, `300m` CPU / `384Mi` limit
- Booking Service: `100m` CPU / `128Mi` request, `250m` CPU / `256Mi` limit

These values are sized for low-traffic demo usage and help keep a small AKS node pool schedulable.

## ACR Access

Keep ACR admin user disabled.

Grant AKS pull access through managed identity / AcrPull role. The simplest manual option when creating AKS is to attach the existing ACR:

```bash
az aks create \
  --resource-group <resource-group> \
  --name <aks-cluster-name> \
  --node-count 1 \
  --attach-acr campusmngmntacr \
  --generate-ssh-keys
```

For an existing AKS cluster:

```bash
az aks update \
  --resource-group <resource-group> \
  --name <aks-cluster-name> \
  --attach-acr campusmngmntacr
```

Do not create image pull secrets with registry passwords unless managed identity access is unavailable.

## Manual Low-Cost AKS Setup

Create AKS manually in the Azure Portal.

Recommended settings to inspect:

- Subscription: Azure for Students
- Resource group: reuse the project resource group
- Cluster preset: development/test if available
- Region: select an allowed region in your subscription
- Availability zones: disabled
- Node count: `1`
- Autoscaling: disabled
- VM size: choose the smallest available general-purpose/Burstable VM that can run four small pods; inspect available B-series options in your allowed region
- Authentication/authorization: managed identity
- Container registry: attach `campusmngmntacr`
- Networking: default/basic networking is sufficient for this project phase
- Monitoring/Container Insights: disable unless your course requires it, because it can add cost
- Azure Policy: disable unless required

Charges can come from:

- AKS worker node VM
- managed disks for nodes
- public IP / load balancer if later created
- Azure Monitor / Container Insights if enabled
- outbound bandwidth
- Azure PostgreSQL
- Azure Container Registry storage

## Deployment Workflow Later

After manually creating AKS and creating a real secret manifest locally:

```bash
az aks get-credentials --resource-group <resource-group> --name <aks-cluster-name>
kubectl apply -f kubernetes/secret.yaml
kubectl apply -k kubernetes
kubectl get pods
kubectl get services
kubectl port-forward service/frontend 8080:80
```

Open:

```text
http://localhost:8080
```

Do not run this until you intentionally create AKS.

## Local Validation

Without an AKS cluster, validate rendered YAML locally:

```bash
kubectl kustomize kubernetes
```

If you have a cluster context later, use server-side validation intentionally:

```bash
kubectl apply --dry-run=server -k kubernetes
```
