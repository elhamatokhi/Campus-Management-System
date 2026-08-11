# Azure Container Registry

Azure Container Registry stores Docker images in Azure so AKS can pull them later.

Flow:

```text
local Docker image
-> tag with <registry>.azurecr.io/<image>:<tag>
-> push to Azure Container Registry
-> later AKS pulls the image
```

Do not commit registry credentials. Do not bake Azure credentials or application secrets into Docker images.

## Images

Keep these logical image names:

```text
campus-frontend
campus-user-service
campus-event-service
campus-booking-service
```

ACR image names use the registry login server:

```text
<registry>.azurecr.io/campus-frontend:latest
<registry>.azurecr.io/campus-user-service:latest
<registry>.azurecr.io/campus-event-service:latest
<registry>.azurecr.io/campus-booking-service:latest
```

Use `latest` for the simple project workflow. Also push a stable version tag such as `v1.0.0` when you want a repeatable deployment reference.

## Manual Azure Portal Setup

Create an Azure Container Registry manually:

- Subscription: choose your Azure for Students subscription.
- Resource group: create or reuse the project resource group.
- Registry name: choose a globally unique lowercase name, for example `campusregistry<initials>`.
- Region: choose a region allowed by your subscription.
- SKU: `Basic`.
- Public network access: enabled for this phase so your local machine can push images.
- Admin user: disabled. Use Azure CLI / Microsoft Entra authentication instead.

Use `Basic` because this project only needs a small private registry for development and AKS image pulls. Do not choose Standard or Premium unless project requirements change.

## Azure CLI Login

Set placeholders in your terminal after creating the registry:

```bash
ACR_NAME=<registry-name-without.azurecr.io>
ACR_LOGIN_SERVER=$ACR_NAME.azurecr.io
IMAGE_VERSION=v1.0.0
```

Log in to Azure and ACR:

```bash
az login
az acr login --name $ACR_NAME
```

`az acr login` uses your Azure CLI identity and Docker. It does not require storing registry passwords in this repository.

## Build Local Images

If needed, rebuild the images:

```bash
npm run docker:build
```

Confirm local images exist:

```bash
docker image ls campus-frontend
docker image ls campus-user-service
docker image ls campus-event-service
docker image ls campus-booking-service
```

## Tag Images

Tag `latest`:

```bash
docker tag campus-frontend:latest $ACR_LOGIN_SERVER/campus-frontend:latest
docker tag campus-user-service:latest $ACR_LOGIN_SERVER/campus-user-service:latest
docker tag campus-event-service:latest $ACR_LOGIN_SERVER/campus-event-service:latest
docker tag campus-booking-service:latest $ACR_LOGIN_SERVER/campus-booking-service:latest
```

Tag `v1.0.0`:

```bash
docker tag campus-frontend:latest $ACR_LOGIN_SERVER/campus-frontend:$IMAGE_VERSION
docker tag campus-user-service:latest $ACR_LOGIN_SERVER/campus-user-service:$IMAGE_VERSION
docker tag campus-event-service:latest $ACR_LOGIN_SERVER/campus-event-service:$IMAGE_VERSION
docker tag campus-booking-service:latest $ACR_LOGIN_SERVER/campus-booking-service:$IMAGE_VERSION
```

## Push Images

Push `latest`:

```bash
docker push $ACR_LOGIN_SERVER/campus-frontend:latest
docker push $ACR_LOGIN_SERVER/campus-user-service:latest
docker push $ACR_LOGIN_SERVER/campus-event-service:latest
docker push $ACR_LOGIN_SERVER/campus-booking-service:latest
```

Push `v1.0.0`:

```bash
docker push $ACR_LOGIN_SERVER/campus-frontend:$IMAGE_VERSION
docker push $ACR_LOGIN_SERVER/campus-user-service:$IMAGE_VERSION
docker push $ACR_LOGIN_SERVER/campus-event-service:$IMAGE_VERSION
docker push $ACR_LOGIN_SERVER/campus-booking-service:$IMAGE_VERSION
```

## Verify In ACR

List repositories:

```bash
az acr repository list --name $ACR_NAME --output table
```

Confirm tags:

```bash
az acr repository show-tags --name $ACR_NAME --repository campus-frontend --output table
az acr repository show-tags --name $ACR_NAME --repository campus-user-service --output table
az acr repository show-tags --name $ACR_NAME --repository campus-event-service --output table
az acr repository show-tags --name $ACR_NAME --repository campus-booking-service --output table
```

Inspect one image:

```bash
az acr repository show --name $ACR_NAME --image campus-frontend:latest
```

## Security Notes

- Keep ACR admin user disabled unless a later tool has no Microsoft Entra authentication option.
- Do not commit Azure credentials.
- Do not put ACR credentials in `.env.example`.
- Do not bake `DATABASE_URL`, `JWT_SECRET`, Azure Blob Storage connection strings, or registry credentials into images.
- Later AKS should pull from ACR using managed identity or an explicit pull role assignment.
