#!/usr/bin/env bash
set -euo pipefail

# Deploy the Campus Management System to Azure Container Apps.
# This script creates/updates Azure resources only when you run it manually.
# It intentionally does not print secret values.

required_vars=(
  RESOURCE_GROUP
  LOCATION
  DATABASE_URL
  JWT_SECRET
  AZURE_STORAGE_CONNECTION_STRING
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
done

ACR_NAME="${ACR_NAME:-campusmngmntacr}"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-campusmngmntacr-hedvhmc7e6ccdret.azurecr.io}"
CONTAINERAPPS_ENVIRONMENT="${CONTAINERAPPS_ENVIRONMENT:-campus-containerapps-env}"
MANAGED_IDENTITY_NAME="${MANAGED_IDENTITY_NAME:-campus-containerapps-acr-pull}"

FRONTEND_APP_NAME="${FRONTEND_APP_NAME:-campus-frontend}"
USER_APP_NAME="${USER_APP_NAME:-campus-user-service}"
EVENT_APP_NAME="${EVENT_APP_NAME:-campus-event-service}"
BOOKING_APP_NAME="${BOOKING_APP_NAME:-campus-booking-service}"

IMAGE_TAG="${IMAGE_TAG:-latest}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-1d}"
AZURE_STORAGE_CONTAINER_NAME="${AZURE_STORAGE_CONTAINER_NAME:-event-images}"
MAX_IMAGE_UPLOAD_BYTES="${MAX_IMAGE_UPLOAD_BYTES:-5242880}"
BOOKING_NOTIFICATION_FUNCTION_URL="${BOOKING_NOTIFICATION_FUNCTION_URL:-}"
REBUILD_FRONTEND_FOR_ACA="${REBUILD_FRONTEND_FOR_ACA:-true}"

MIN_REPLICAS="${MIN_REPLICAS:-1}"
MAX_REPLICAS="${MAX_REPLICAS:-3}"
BACKEND_CPU="${BACKEND_CPU:-0.25}"
BACKEND_MEMORY="${BACKEND_MEMORY:-0.5Gi}"
FRONTEND_CPU="${FRONTEND_CPU:-0.25}"
FRONTEND_MEMORY="${FRONTEND_MEMORY:-0.5Gi}"

placeholder_frontend_origin="https://placeholder.invalid"

echo "Stage 1: verify Azure CLI login and target subscription"
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId}" --output table

echo "Stage 2: verify Azure Container Registry"
ACR_ID="$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query id --output tsv)"
echo "Using ACR login server: ${ACR_LOGIN_SERVER}"

echo "Stage 3: create or verify Container Apps environment"
if az containerapp env show --name "$CONTAINERAPPS_ENVIRONMENT" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "Container Apps environment already exists: ${CONTAINERAPPS_ENVIRONMENT}"
else
  az containerapp env create \
    --name "$CONTAINERAPPS_ENVIRONMENT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --logs-destination none \
    --output none
fi

echo "Stage 4: create or verify managed identity for ACR pulls"
if az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "Managed identity already exists: ${MANAGED_IDENTITY_NAME}"
else
  az identity create \
    --name "$MANAGED_IDENTITY_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output none
fi

IDENTITY_ID="$(az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" --query id --output tsv)"
PRINCIPAL_ID="$(az identity show --name "$MANAGED_IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" --query principalId --output tsv)"

echo "Stage 5: grant AcrPull to the managed identity"
if [[ "$(az role assignment list --assignee "$PRINCIPAL_ID" --role AcrPull --scope "$ACR_ID" --query 'length(@)' --output tsv)" == "0" ]]; then
  az role assignment create \
    --assignee-object-id "$PRINCIPAL_ID" \
    --assignee-principal-type ServicePrincipal \
    --role AcrPull \
    --scope "$ACR_ID" \
    --output none
else
  echo "AcrPull role assignment already exists for the managed identity."
fi

if [[ "$REBUILD_FRONTEND_FOR_ACA" == "true" ]]; then
  echo "Stage 6: rebuild and push the frontend image for Container Apps"
  echo "The backend images are reused from ACR; only the frontend image needs the Container Apps nginx proxy."
  az acr login --name "$ACR_NAME"
  docker build \
    -f infra/container-apps/frontend.Dockerfile \
    -t "$ACR_LOGIN_SERVER/campus-frontend:$IMAGE_TAG" \
    .
  docker push "$ACR_LOGIN_SERVER/campus-frontend:$IMAGE_TAG"
else
  echo "Stage 6: skipping frontend rebuild because REBUILD_FRONTEND_FOR_ACA is not true"
fi

echo "Stage 7: deploy internal User Service"
for app_name in "$USER_APP_NAME" "$EVENT_APP_NAME" "$BOOKING_APP_NAME" "$FRONTEND_APP_NAME"; do
  if az containerapp show --name "$app_name" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
    echo "Container App already exists: ${app_name}" >&2
    echo "This script is intended for the first Container Apps deployment. Delete or update existing apps deliberately before rerunning." >&2
    exit 1
  fi
done

az containerapp create \
  --name "$USER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENVIRONMENT" \
  --image "$ACR_LOGIN_SERVER/campus-user-service:$IMAGE_TAG" \
  --user-assigned "$IDENTITY_ID" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity "$IDENTITY_ID" \
  --ingress internal \
  --target-port 4001 \
  --min-replicas "$MIN_REPLICAS" \
  --max-replicas "$MAX_REPLICAS" \
  --cpu "$BACKEND_CPU" \
  --memory "$BACKEND_MEMORY" \
  --secrets database-url="$DATABASE_URL" jwt-secret="$JWT_SECRET" \
  --env-vars \
    NODE_ENV=production \
    PORT=4001 \
    FRONTEND_ORIGIN="$placeholder_frontend_origin" \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
  --output none

echo "Stage 8: deploy internal Event Service"
az containerapp create \
  --name "$EVENT_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENVIRONMENT" \
  --image "$ACR_LOGIN_SERVER/campus-event-service:$IMAGE_TAG" \
  --user-assigned "$IDENTITY_ID" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity "$IDENTITY_ID" \
  --ingress internal \
  --target-port 4002 \
  --min-replicas "$MIN_REPLICAS" \
  --max-replicas "$MAX_REPLICAS" \
  --cpu "$BACKEND_CPU" \
  --memory "$BACKEND_MEMORY" \
  --secrets \
    database-url="$DATABASE_URL" \
    jwt-secret="$JWT_SECRET" \
    azure-storage-connection-string="$AZURE_STORAGE_CONNECTION_STRING" \
  --env-vars \
    NODE_ENV=production \
    PORT=4002 \
    FRONTEND_ORIGIN="$placeholder_frontend_origin" \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
    AZURE_STORAGE_CONNECTION_STRING=secretref:azure-storage-connection-string \
    AZURE_STORAGE_CONTAINER_NAME="$AZURE_STORAGE_CONTAINER_NAME" \
    MAX_IMAGE_UPLOAD_BYTES="$MAX_IMAGE_UPLOAD_BYTES" \
  --output none

echo "Stage 9: deploy internal Booking Service"
az containerapp create \
  --name "$BOOKING_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENVIRONMENT" \
  --image "$ACR_LOGIN_SERVER/campus-booking-service:$IMAGE_TAG" \
  --user-assigned "$IDENTITY_ID" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity "$IDENTITY_ID" \
  --ingress internal \
  --target-port 4003 \
  --min-replicas "$MIN_REPLICAS" \
  --max-replicas "$MAX_REPLICAS" \
  --cpu "$BACKEND_CPU" \
  --memory "$BACKEND_MEMORY" \
  --secrets database-url="$DATABASE_URL" jwt-secret="$JWT_SECRET" \
  --env-vars \
    NODE_ENV=production \
    PORT=4003 \
    FRONTEND_ORIGIN="$placeholder_frontend_origin" \
    DATABASE_URL=secretref:database-url \
    JWT_SECRET=secretref:jwt-secret \
    JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
    USER_SERVICE_URL="http://$USER_APP_NAME" \
    EVENT_SERVICE_URL="http://$EVENT_APP_NAME" \
    BOOKING_NOTIFICATION_FUNCTION_URL="$BOOKING_NOTIFICATION_FUNCTION_URL" \
  --output none

echo "Stage 10: deploy external frontend"
az containerapp create \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$CONTAINERAPPS_ENVIRONMENT" \
  --image "$ACR_LOGIN_SERVER/campus-frontend:$IMAGE_TAG" \
  --user-assigned "$IDENTITY_ID" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-identity "$IDENTITY_ID" \
  --ingress external \
  --target-port 80 \
  --min-replicas "$MIN_REPLICAS" \
  --max-replicas "$MAX_REPLICAS" \
  --cpu "$FRONTEND_CPU" \
  --memory "$FRONTEND_MEMORY" \
  --output none

echo "Stage 11: update backend CORS origin to the frontend URL"
FRONTEND_FQDN="$(az containerapp show --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn --output tsv)"
FRONTEND_ORIGIN="https://$FRONTEND_FQDN"

for app_name in "$USER_APP_NAME" "$EVENT_APP_NAME" "$BOOKING_APP_NAME"; do
  az containerapp update \
    --name "$app_name" \
    --resource-group "$RESOURCE_GROUP" \
    --set-env-vars FRONTEND_ORIGIN="$FRONTEND_ORIGIN" \
    --output none
done

echo "Deployment prepared."
echo "Frontend URL: ${FRONTEND_ORIGIN}"
echo
echo "Verify externally:"
echo "curl -I ${FRONTEND_ORIGIN}"
echo
echo "Verify internal apps from Azure CLI:"
echo "az containerapp show --name ${USER_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
echo "az containerapp show --name ${EVENT_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
echo "az containerapp show --name ${BOOKING_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
