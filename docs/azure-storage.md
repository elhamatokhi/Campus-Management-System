# Azure Blob Storage

Phase 9 adds Azure Blob Storage support for event images.

## Flow

```text
Admin frontend
  -> Event Service upload endpoint
  -> Azure Blob Storage
  -> image URL
  -> PostgreSQL Event.imageUrl
```

Image binary data is not stored in PostgreSQL.

## Manual Azure Setup

Create these Azure resources manually:

- Azure Storage Account
- Blob container, for example `event-images`

For the current frontend to display uploaded images directly, configure the container or uploaded blobs so they are readable by the browser. A simple university-project option is a container with public blob read access. A production system would normally use private containers with generated SAS URLs.

## Environment Variables

Set these for the Event Service:

```text
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
AZURE_STORAGE_CONTAINER_NAME=event-images
MAX_IMAGE_UPLOAD_BYTES=5242880
```

Do not commit real Azure credentials.

## Upload Endpoint

Admin-only endpoint:

```text
POST /api/events/upload-image
```

Request:

```text
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>
field name: image
```

Allowed file types:

- jpg/jpeg
- png
- webp

Default size limit:

```text
5 MB
```

If Azure credentials are missing, the Event Service still starts normally. The upload endpoint returns a clear configuration error only when an upload is attempted.

