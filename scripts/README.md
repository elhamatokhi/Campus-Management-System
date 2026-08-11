# Scripts

Project helper scripts will live here as the application grows.

Examples may include:

- Database setup helpers
- Docker build helpers
- Deployment helpers

## Azure Container Apps

`deploy-container-apps.sh` prepares the Azure Container Apps deployment using the existing ACR images and Azure PostgreSQL.

It expects secrets to be supplied as shell environment variables at runtime:

```bash
export RESOURCE_GROUP=<your-resource-group>
export LOCATION=<azure-region>
export DATABASE_URL='<azure-postgresql-connection-string>'
export JWT_SECRET='<strong-jwt-secret>'
export AZURE_STORAGE_CONNECTION_STRING='<azure-storage-connection-string>'
./scripts/deploy-container-apps.sh
```

The script does not store secrets in source control. It rebuilds only the frontend image with the Container Apps nginx proxy because Vite API URLs are build-time values.
