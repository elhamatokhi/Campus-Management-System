# Azure Container Apps Deployment

This phase prepares deployment to Azure Container Apps without using AKS.

The deployment model is:

```text
Browser
-> external Azure Container App: campus-frontend
-> nginx /api proxy
-> internal Azure Container Apps:
   - campus-user-service
   - campus-event-service
   - campus-booking-service
-> Azure Database for PostgreSQL
-> Azure Blob Storage for event images
```

No Azure resources are created by this repository until you run the deployment script manually.

## Expected Azure Resources

Use your existing Azure resources where possible:

- Azure Container Registry: `campusmngmntacr`
- ACR login server: `campusmngmntacr-hedvhmc7e6ccdret.azurecr.io`
- Azure Database for PostgreSQL
- Azure Blob Storage container: `event-images`

The deployment script creates these Container Apps resources when you run it:

- Container Apps environment: `campus-containerapps-env`
- User-assigned managed identity: `campus-containerapps-acr-pull`
- Container App: `campus-frontend`
- Container App: `campus-user-service`
- Container App: `campus-event-service`
- Container App: `campus-booking-service`

The script grants the managed identity `AcrPull` on the existing ACR. It does not use registry passwords and does not require the ACR admin user.

## Why The Frontend Image Must Be Rebuilt

Vite reads `VITE_*` API URLs at build time. The existing local Docker Compose frontend image is built for browser calls to:

```text
http://localhost:4001
http://localhost:4002
http://localhost:4003
```

Those URLs are not valid from an Azure-hosted browser session.

For Container Apps, the frontend is rebuilt with empty `VITE_*` values so the React app calls same-origin paths such as:

```text
/api/users/login
/api/events
/api/bookings
```

The Container Apps-specific nginx config then proxies those paths to internal Container App names:

```text
http://campus-user-service
http://campus-event-service
http://campus-booking-service
```

Only the frontend image needs this deployment-specific rebuild. The backend images can be reused from ACR.

## Required Local Tools

- Azure CLI
- Docker Desktop
- Logged-in Azure CLI session

Install or update the Container Apps extension if needed:

```bash
az extension add --name containerapp --upgrade
```

Log in:

```bash
az login
az acr login --name campusmngmntacr
```

## Required Environment Variables

Set these in your shell before running the script. Do not commit these values.

```bash
export RESOURCE_GROUP=<your-resource-group>
export LOCATION=<azure-region>
export DATABASE_URL='<azure-postgresql-connection-string>'
export JWT_SECRET='<strong-jwt-secret>'
export AZURE_STORAGE_CONNECTION_STRING='<azure-storage-connection-string>'
```

Recommended optional values:

```bash
export ACR_NAME=campusmngmntacr
export ACR_LOGIN_SERVER=campusmngmntacr-hedvhmc7e6ccdret.azurecr.io
export IMAGE_TAG=latest
export AZURE_STORAGE_CONTAINER_NAME=event-images
export MAX_IMAGE_UPLOAD_BYTES=5242880
export JWT_EXPIRES_IN=1d
```

Scaling defaults:

```bash
export MIN_REPLICAS=1
export MAX_REPLICAS=3
```

## Deploy

Run from the repository root:

```bash
./scripts/deploy-container-apps.sh
```

The script stages are:

1. Verify Azure CLI login.
2. Verify the existing ACR.
3. Create or verify the Container Apps environment.
4. Create or verify a user-assigned managed identity.
5. Grant `AcrPull` on ACR to that identity.
6. Rebuild and push the frontend image for Container Apps.
7. Deploy internal User Service.
8. Deploy internal Event Service.
9. Deploy internal Booking Service.
10. Deploy external frontend.
11. Update backend CORS origins to the final frontend URL.

The script is intended for the first Container Apps deployment. It will stop if any of the four Container Apps already exist, so it does not accidentally replace an existing deployment. Use explicit `az containerapp update` commands for later revisions.

## Health Checks

The services already expose:

```text
GET /health
```

Azure Container Apps adds default TCP startup, liveness, and readiness probes when ingress is enabled and explicit probes are not supplied. Microsoft documents custom HTTP probes as YAML configuration. If explicit `/health` HTTP probes are required later, add them through an ACA YAML or Bicep deployment. This script keeps the first deployment simple and verifies health through the running app.

## Test After Deployment

Get the frontend URL:

```bash
az containerapp show \
  --name campus-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

Open:

```text
https://<frontend-fqdn>
```

Check app status:

```bash
az containerapp show --name campus-user-service --resource-group $RESOURCE_GROUP --query properties.runningStatus
az containerapp show --name campus-event-service --resource-group $RESOURCE_GROUP --query properties.runningStatus
az containerapp show --name campus-booking-service --resource-group $RESOURCE_GROUP --query properties.runningStatus
az containerapp show --name campus-frontend --resource-group $RESOURCE_GROUP --query properties.runningStatus
```

Check recent revisions:

```bash
az containerapp revision list --name campus-frontend --resource-group $RESOURCE_GROUP --output table
az containerapp revision list --name campus-user-service --resource-group $RESOURCE_GROUP --output table
az containerapp revision list --name campus-event-service --resource-group $RESOURCE_GROUP --output table
az containerapp revision list --name campus-booking-service --resource-group $RESOURCE_GROUP --output table
```

Basic browser flow:

1. Register or log in.
2. Load Events.
3. Open Event Details.
4. Book an event as a student.
5. Log in as admin.
6. Create or edit an event with image upload.

## Cost Notes

The script uses:

- Consumption Container Apps environment.
- Minimum 1 replica per app.
- Maximum 3 replicas per app.
- Small CPU and memory allocations by default.
- `--logs-destination none` to avoid creating a Log Analytics workspace automatically.

For lower idle cost after testing, set `MIN_REPLICAS=0`. For a demo where the app should stay warm, keep `MIN_REPLICAS=1`.

## Security Notes

- Do not commit `.env`.
- Do not place secrets in Dockerfiles.
- Do not enable ACR admin user for this workflow.
- Use Azure CLI authentication and a managed identity with `AcrPull`.
- Store `DATABASE_URL`, `JWT_SECRET`, and `AZURE_STORAGE_CONNECTION_STRING` as Container Apps secrets.
- Keep non-secret values as normal environment variables.

## Troubleshooting

If images cannot be pulled:

```bash
az role assignment list \
  --assignee $(az identity show --name campus-containerapps-acr-pull --resource-group $RESOURCE_GROUP --query principalId --output tsv) \
  --scope $(az acr show --name campusmngmntacr --resource-group $RESOURCE_GROUP --query id --output tsv) \
  --output table
```

If frontend API calls fail:

- Confirm the frontend image was rebuilt using `infra/container-apps/frontend.Dockerfile`.
- Confirm the backend apps are in the same Container Apps environment as the frontend.
- Confirm backend `FRONTEND_ORIGIN` equals the frontend HTTPS origin.
- Check browser network requests. They should call `/api/...` on the frontend host, not `localhost`.

If database calls fail:

- Confirm `DATABASE_URL` points to Azure PostgreSQL.
- Confirm Azure PostgreSQL firewall/networking allows Container Apps outbound traffic for this phase.
- Confirm Prisma migrations were already applied to the Azure PostgreSQL database.
