# Scripts

Project helper scripts will live here as the application grows.

Examples may include:

- Database setup helpers
- Docker build helpers
- Deployment helpers

## Azure Container Apps

`build-push-aca-images.sh` builds and pushes Azure Container Apps-compatible `linux/amd64` images.

```bash
./scripts/build-push-aca-images.sh user
./scripts/build-push-aca-images.sh event
./scripts/build-push-aca-images.sh booking
./scripts/build-push-aca-images.sh frontend
./scripts/build-push-aca-images.sh all
```

Set `IMAGE_TAG` to publish a unique tag:

```bash
IMAGE_TAG=frontend-fix-1 ./scripts/build-push-aca-images.sh frontend
```

`deploy-container-apps.sh` prepares or updates Azure Container Apps using the existing ACR images and Azure PostgreSQL.

It expects secrets to be supplied as shell environment variables at runtime:

```bash
export RESOURCE_GROUP=<your-resource-group>
export LOCATION=<azure-region>
export DATABASE_URL='<azure-postgresql-connection-string>'
export JWT_SECRET='<strong-jwt-secret>'
export AZURE_STORAGE_CONNECTION_STRING='<azure-storage-connection-string>'
./scripts/deploy-container-apps.sh all
```

Deploy one target at a time when needed:

```bash
./scripts/deploy-container-apps.sh user
./scripts/deploy-container-apps.sh event
./scripts/deploy-container-apps.sh booking
./scripts/deploy-container-apps.sh frontend
```

The deployment script does not build or push images. It does not store secrets in source control.
