#!/usr/bin/env bash
set -euo pipefail

# Build and push Azure Container Apps-compatible linux/amd64 images.
# This script only builds/pushes images. It does not create or update Azure resources.

target="${1:-}"

if [[ -z "$target" ]]; then
  echo "Usage: $0 {user|event|booking|frontend|all}" >&2
  exit 1
fi

ACR_NAME="${ACR_NAME:-campusmngmntacr}"
ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_PLATFORM="${IMAGE_PLATFORM:-linux/amd64}"

if ! command -v az >/dev/null 2>&1; then
  echo "Azure CLI is required. Install az and run az login first." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Start Docker Desktop before running this script." >&2
  exit 1
fi

if ! docker buildx version >/dev/null 2>&1; then
  echo "Docker Buildx is required for linux/amd64 builds." >&2
  exit 1
fi

if ! az account show >/dev/null 2>&1; then
  echo "Azure CLI is not logged in. Run: az login" >&2
  exit 1
fi

ACTUAL_ACR_LOGIN_SERVER="$(az acr show --name "$ACR_NAME" --query loginServer --output tsv 2>/dev/null || true)"

if [[ -z "$ACTUAL_ACR_LOGIN_SERVER" ]]; then
  echo "Could not read ACR login server for ACR_NAME=${ACR_NAME}." >&2
  echo "Confirm ACR_NAME is the registry resource name and your Azure CLI account has access." >&2
  exit 1
fi

ACR_LOGIN_SERVER="${ACR_LOGIN_SERVER:-$ACTUAL_ACR_LOGIN_SERVER}"

if [[ "$ACR_LOGIN_SERVER" != "$ACTUAL_ACR_LOGIN_SERVER" ]]; then
  echo "Configured ACR_LOGIN_SERVER does not match the login server for ACR_NAME=${ACR_NAME}." >&2
  echo "Expected ACR_LOGIN_SERVER: ${ACTUAL_ACR_LOGIN_SERVER}" >&2
  echo "Configured ACR_LOGIN_SERVER: ${ACR_LOGIN_SERVER}" >&2
  exit 1
fi

az acr login --name "$ACR_NAME"

build_image() {
  local image_name="$1"
  local dockerfile="$2"

  echo "Building and pushing ${ACR_LOGIN_SERVER}/${image_name}:${IMAGE_TAG} for ${IMAGE_PLATFORM}"
  docker buildx build \
    --platform "$IMAGE_PLATFORM" \
    --provenance=false \
    -f "$dockerfile" \
    -t "$ACR_LOGIN_SERVER/$image_name:$IMAGE_TAG" \
    --push \
    .
}

case "$target" in
  user)
    build_image "campus-user-service" "services/user-service/Dockerfile"
    ;;
  event)
    build_image "campus-event-service" "services/event-service/Dockerfile"
    ;;
  booking)
    build_image "campus-booking-service" "services/booking-service/Dockerfile"
    ;;
  frontend)
    build_image "campus-frontend" "infra/container-apps/frontend.Dockerfile"
    ;;
  all)
    build_image "campus-user-service" "services/user-service/Dockerfile"
    build_image "campus-event-service" "services/event-service/Dockerfile"
    build_image "campus-booking-service" "services/booking-service/Dockerfile"
    build_image "campus-frontend" "infra/container-apps/frontend.Dockerfile"
    ;;
  *)
    echo "Unknown target: ${target}" >&2
    echo "Usage: $0 {user|event|booking|frontend|all}" >&2
    exit 1
    ;;
esac
