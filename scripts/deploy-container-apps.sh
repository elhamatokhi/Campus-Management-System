#!/usr/bin/env bash
set -euo pipefail

# Deploy the Campus Management System to Azure Container Apps.
# This script creates/updates Azure resources only when you run it manually.
# It intentionally does not print secret values.

target="${1:-}"

if [[ -z "$target" ]]; then
  echo "Usage: $0 {user|event|booking|frontend|all}" >&2
  exit 1
fi

case "$target" in
  user|event|booking|frontend|all)
    ;;
  *)
    echo "Unknown target: ${target}" >&2
    echo "Usage: $0 {user|event|booking|frontend|all}" >&2
    exit 1
    ;;
esac

require_vars() {
  local var_name

  for var_name in "$@"; do
    if [[ -z "${!var_name:-}" ]]; then
      echo "Missing required environment variable: ${var_name}" >&2
      exit 1
    fi
  done
}

required_vars=(RESOURCE_GROUP LOCATION)

case "$target" in
  user)
    required_vars+=(DATABASE_URL JWT_SECRET)
    ;;
  event)
    required_vars+=(DATABASE_URL JWT_SECRET AZURE_STORAGE_CONNECTION_STRING)
    ;;
  booking)
    required_vars+=(DATABASE_URL JWT_SECRET BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING)
    ;;
  all)
    required_vars+=(DATABASE_URL JWT_SECRET AZURE_STORAGE_CONNECTION_STRING BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING)
    ;;
  frontend)
    ;;
esac

require_vars "${required_vars[@]}"

ACR_NAME="${ACR_NAME:-campusmngmntacr}"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-}"
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
BOOKING_NOTIFICATION_QUEUE="${BOOKING_NOTIFICATION_QUEUE:-booking-notifications}"

MIN_REPLICAS="${MIN_REPLICAS:-1}"
MAX_REPLICAS="${MAX_REPLICAS:-3}"
BACKEND_CPU="${BACKEND_CPU:-0.25}"
BACKEND_MEMORY="${BACKEND_MEMORY:-0.5Gi}"
FRONTEND_CPU="${FRONTEND_CPU:-0.25}"
FRONTEND_MEMORY="${FRONTEND_MEMORY:-0.5Gi}"

placeholder_frontend_origin="https://placeholder.invalid"
backend_frontend_origin="$placeholder_frontend_origin"
config_refresh="${CONFIG_REFRESH:-$(date +%s)}"

echo "Stage 1: verify Azure CLI login and target subscription"
az account show --query "{subscriptionId:id, name:name, tenantId:tenantId}" --output table

echo "Stage 2: verify Azure Container Registry"
ACR_ID="$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query id --output tsv)"
ACTUAL_ACR_LOGIN_SERVER="$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer --output tsv)"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-$ACTUAL_ACR_LOGIN_SERVER}"

if [[ "$ACR_LOGIN_SERVER" != "$ACTUAL_ACR_LOGIN_SERVER" ]]; then
  echo "Configured ACR_LOGIN_SERVER does not match the login server for ACR_NAME=${ACR_NAME}." >&2
  echo "ACR_NAME must be the Azure registry resource name. ACR_LOGIN_SERVER must be the registry hostname." >&2
  echo "Expected ACR_LOGIN_SERVER: ${ACTUAL_ACR_LOGIN_SERVER}" >&2
  echo "Configured ACR_LOGIN_SERVER: ${ACR_LOGIN_SERVER}" >&2
  exit 1
fi

echo "Using ACR resource name: ${ACR_NAME}"
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

echo "Stage 6: use existing images from ACR"
echo "Images are not built or pushed by this script."
echo "Build images first with: ./scripts/build-push-aca-images.sh {user|event|booking|frontend|all}"

container_app_exists() {
  local app_name="$1"

  az containerapp show --name "$app_name" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1
}

set_backend_frontend_origin_from_existing_frontend() {
  local frontend_fqdn

  if ! container_app_exists "$FRONTEND_APP_NAME"; then
    echo "Using placeholder CORS origin because ${FRONTEND_APP_NAME} does not exist yet."
    return
  fi

  frontend_fqdn="$(az containerapp show --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn --output tsv)"

  if [[ -z "$frontend_fqdn" ]]; then
    echo "Using placeholder CORS origin because ${FRONTEND_APP_NAME} does not have an ingress FQDN yet."
    return
  fi

  backend_frontend_origin="https://$frontend_fqdn"
}

configure_existing_app_common() {
  local app_name="$1"
  local ingress_type="$2"
  local target_port="$3"

  echo "Updating existing Container App: ${app_name}"
  az containerapp identity assign \
    --name "$app_name" \
    --resource-group "$RESOURCE_GROUP" \
    --user-assigned "$IDENTITY_ID" \
    --output none

  az containerapp registry set \
    --name "$app_name" \
    --resource-group "$RESOURCE_GROUP" \
    --server "$ACR_LOGIN_SERVER" \
    --identity "$IDENTITY_ID" \
    --output none

  az containerapp ingress enable \
    --name "$app_name" \
    --resource-group "$RESOURCE_GROUP" \
    --type "$ingress_type" \
    --target-port "$target_port" \
    --transport auto \
    --allow-insecure false \
    --output none
}

deploy_user_service() {
  local image="$ACR_LOGIN_SERVER/campus-user-service:$IMAGE_TAG"

  echo "Deploying image: ${image}"

  if container_app_exists "$USER_APP_NAME"; then
    configure_existing_app_common "$USER_APP_NAME" internal 4001
    az containerapp secret set \
      --name "$USER_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --secrets database-url="$DATABASE_URL" jwt-secret="$JWT_SECRET" \
      --output none
    az containerapp update \
      --name "$USER_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --image "$image" \
      --min-replicas "$MIN_REPLICAS" \
      --max-replicas "$MAX_REPLICAS" \
      --cpu "$BACKEND_CPU" \
      --memory "$BACKEND_MEMORY" \
      --set-env-vars \
        NODE_ENV=production \
        PORT=4001 \
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  else
    echo "Creating Container App: ${USER_APP_NAME}"
    az containerapp create \
      --name "$USER_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$CONTAINERAPPS_ENVIRONMENT" \
      --image "$image" \
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
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  fi
}

deploy_event_service() {
  local image="$ACR_LOGIN_SERVER/campus-event-service:$IMAGE_TAG"

  echo "Deploying image: ${image}"

  if container_app_exists "$EVENT_APP_NAME"; then
    configure_existing_app_common "$EVENT_APP_NAME" internal 4002
    az containerapp secret set \
      --name "$EVENT_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --secrets \
        database-url="$DATABASE_URL" \
        jwt-secret="$JWT_SECRET" \
        azure-storage="$AZURE_STORAGE_CONNECTION_STRING" \
      --output none
    az containerapp update \
      --name "$EVENT_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --image "$image" \
      --min-replicas "$MIN_REPLICAS" \
      --max-replicas "$MAX_REPLICAS" \
      --cpu "$BACKEND_CPU" \
      --memory "$BACKEND_MEMORY" \
      --set-env-vars \
        NODE_ENV=production \
        PORT=4002 \
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        AZURE_STORAGE_CONNECTION_STRING=secretref:azure-storage \
        AZURE_STORAGE_CONTAINER_NAME="$AZURE_STORAGE_CONTAINER_NAME" \
        MAX_IMAGE_UPLOAD_BYTES="$MAX_IMAGE_UPLOAD_BYTES" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  else
    echo "Creating Container App: ${EVENT_APP_NAME}"
    az containerapp create \
      --name "$EVENT_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$CONTAINERAPPS_ENVIRONMENT" \
      --image "$image" \
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
        azure-storage="$AZURE_STORAGE_CONNECTION_STRING" \
      --env-vars \
        NODE_ENV=production \
        PORT=4002 \
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        AZURE_STORAGE_CONNECTION_STRING=secretref:azure-storage \
        AZURE_STORAGE_CONTAINER_NAME="$AZURE_STORAGE_CONTAINER_NAME" \
        MAX_IMAGE_UPLOAD_BYTES="$MAX_IMAGE_UPLOAD_BYTES" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  fi
}

deploy_booking_service() {
  local image="$ACR_LOGIN_SERVER/campus-booking-service:$IMAGE_TAG"

  echo "Deploying image: ${image}"

  if container_app_exists "$BOOKING_APP_NAME"; then
    configure_existing_app_common "$BOOKING_APP_NAME" internal 4003
    az containerapp secret set \
      --name "$BOOKING_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --secrets \
        database-url="$DATABASE_URL" \
        jwt-secret="$JWT_SECRET" \
        booking-notification-storage="$BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING" \
      --output none
    az containerapp update \
      --name "$BOOKING_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --image "$image" \
      --min-replicas "$MIN_REPLICAS" \
      --max-replicas "$MAX_REPLICAS" \
      --cpu "$BACKEND_CPU" \
      --memory "$BACKEND_MEMORY" \
      --set-env-vars \
        NODE_ENV=production \
        PORT=4003 \
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        USER_SERVICE_URL="http://$USER_APP_NAME" \
        EVENT_SERVICE_URL="http://$EVENT_APP_NAME" \
        BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING=secretref:booking-notification-storage \
        BOOKING_NOTIFICATION_QUEUE="$BOOKING_NOTIFICATION_QUEUE" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  else
    echo "Creating Container App: ${BOOKING_APP_NAME}"
    az containerapp create \
      --name "$BOOKING_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$CONTAINERAPPS_ENVIRONMENT" \
      --image "$image" \
      --user-assigned "$IDENTITY_ID" \
      --registry-server "$ACR_LOGIN_SERVER" \
      --registry-identity "$IDENTITY_ID" \
      --ingress internal \
      --target-port 4003 \
      --min-replicas "$MIN_REPLICAS" \
      --max-replicas "$MAX_REPLICAS" \
      --cpu "$BACKEND_CPU" \
      --memory "$BACKEND_MEMORY" \
      --secrets \
        database-url="$DATABASE_URL" \
        jwt-secret="$JWT_SECRET" \
        booking-notification-storage="$BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING" \
      --env-vars \
        NODE_ENV=production \
        PORT=4003 \
        FRONTEND_ORIGIN="$backend_frontend_origin" \
        DATABASE_URL=secretref:database-url \
        JWT_SECRET=secretref:jwt-secret \
        JWT_EXPIRES_IN="$JWT_EXPIRES_IN" \
        USER_SERVICE_URL="http://$USER_APP_NAME" \
        EVENT_SERVICE_URL="http://$EVENT_APP_NAME" \
        BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING=secretref:booking-notification-storage \
        BOOKING_NOTIFICATION_QUEUE="$BOOKING_NOTIFICATION_QUEUE" \
        CONFIG_REFRESH="$config_refresh" \
      --output none
  fi
}

deploy_frontend() {
  local image="$ACR_LOGIN_SERVER/campus-frontend:$IMAGE_TAG"

  echo "Deploying image: ${image}"

  if container_app_exists "$FRONTEND_APP_NAME"; then
    configure_existing_app_common "$FRONTEND_APP_NAME" external 80
    az containerapp update \
      --name "$FRONTEND_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --image "$image" \
      --min-replicas "$MIN_REPLICAS" \
      --max-replicas "$MAX_REPLICAS" \
      --cpu "$FRONTEND_CPU" \
      --memory "$FRONTEND_MEMORY" \
      --output none
  else
    echo "Creating Container App: ${FRONTEND_APP_NAME}"
    az containerapp create \
      --name "$FRONTEND_APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --environment "$CONTAINERAPPS_ENVIRONMENT" \
      --image "$image" \
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
  fi
}

update_backend_cors_from_frontend() {
  if ! container_app_exists "$FRONTEND_APP_NAME"; then
    echo "Skipping backend CORS update because ${FRONTEND_APP_NAME} does not exist yet."
    echo "Deploy the frontend later, then rerun this script with 'frontend' or 'all'."
    return
  fi

  echo "Update backend CORS origin to the frontend URL"
  FRONTEND_FQDN="$(az containerapp show --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn --output tsv)"

  if [[ -z "$FRONTEND_FQDN" ]]; then
    echo "Skipping backend CORS update because ${FRONTEND_APP_NAME} does not have an ingress FQDN yet."
    return
  fi

  FRONTEND_ORIGIN="https://$FRONTEND_FQDN"

  for app_name in "$USER_APP_NAME" "$EVENT_APP_NAME" "$BOOKING_APP_NAME"; do
    if container_app_exists "$app_name"; then
      az containerapp update \
        --name "$app_name" \
        --resource-group "$RESOURCE_GROUP" \
        --set-env-vars FRONTEND_ORIGIN="$FRONTEND_ORIGIN" \
        --output none
    fi
  done

  echo "Frontend URL: ${FRONTEND_ORIGIN}"
}

case "$target" in
  user)
    echo "Stage 7: deploy internal User Service"
    set_backend_frontend_origin_from_existing_frontend
    deploy_user_service
    ;;
  event)
    echo "Stage 7: deploy internal Event Service"
    set_backend_frontend_origin_from_existing_frontend
    deploy_event_service
    ;;
  booking)
    echo "Stage 7: deploy internal Booking Service"
    set_backend_frontend_origin_from_existing_frontend
    deploy_booking_service
    ;;
  frontend)
    echo "Stage 7: deploy external frontend"
    deploy_frontend
    update_backend_cors_from_frontend
    ;;
  all)
    echo "Stage 7: deploy internal User Service"
    deploy_user_service

    echo "Stage 8: deploy internal Event Service"
    deploy_event_service

    echo "Stage 9: deploy internal Booking Service"
    deploy_booking_service

    echo "Stage 10: deploy external frontend"
    deploy_frontend

    echo "Stage 11: update backend CORS origin to the frontend URL"
    update_backend_cors_from_frontend
    ;;
esac

echo "Deployment prepared."
echo
echo "Verify externally:"
echo "az containerapp show --name ${FRONTEND_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.configuration.ingress.fqdn"
echo
echo "Verify internal apps from Azure CLI:"
echo "az containerapp show --name ${USER_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
echo "az containerapp show --name ${EVENT_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
echo "az containerapp show --name ${BOOKING_APP_NAME} --resource-group ${RESOURCE_GROUP} --query properties.runningStatus"
