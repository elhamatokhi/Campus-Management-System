# Azure Deployment Summary

The final deployed application uses:

- Azure Container Registry for Docker images
- Azure Container Apps for the frontend and backend services
- Azure Database for PostgreSQL
- Azure Blob Storage for event images
- Azure Functions for serverless booking notification processing

Azure Container Apps is the active production orchestration solution for this repository. Kubernetes/AKS manifests remain as an original/alternative orchestration artifact under `k8s/` and `kubernetes/`, but AKS is not the final live deployment path.

Detailed deployment notes are in:

- [Azure Container Apps Deployment](AZURE-CONTAINER-APPS-DEPLOYMENT.md)
- [Azure Container Registry](azure-container-registry.md)
- [Azure PostgreSQL](azure-postgresql.md)
- [Azure Blob Storage](azure-storage.md)
- [Project Journey](PROJECT-JOURNEY.md)
