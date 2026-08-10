# Event Service

Node.js + Express microservice for campus event management and event image references.

## Responsibility

The Event Service will eventually handle:

- Listing campus events
- Searching and filtering events
- Reading event details
- Creating, updating, and deleting events for admins
- Storing event image references
- Integrating with Azure Blob Storage for event image uploads

As of Phase 9, event reads are public, event write operations require an admin JWT, and event image uploads use Azure Blob Storage.

## Planned Event Fields

- `id`
- `title`
- `description`
- `category`
- `location`
- `startDate`
- `endDate`
- `capacity`
- `imageUrl`
- `createdAt`
- `updatedAt`

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `GET` | `/api/events` | Database-backed |
| `GET` | `/api/events/:id` | Database-backed |
| `POST` | `/api/events` | Database-backed |
| `POST` | `/api/events/upload-image` | Admin-only Azure Blob upload |
| `PUT` | `/api/events/:id` | Database-backed |
| `DELETE` | `/api/events/:id` | Database-backed |

Admin-only routes require:

```text
Authorization: Bearer <admin-token>
```

Students receive `403 Forbidden` for create, update, and delete routes.
Deleting an event that still has booking records returns `409 Conflict`; a soft-delete/archive policy can be added later if needed.

## Local Development

Install dependencies from the repository root:

```bash
npm install
```

Run the service:

```bash
npm run dev:event-service
```

Or run it directly as a workspace:

```bash
npm run dev -w services/event-service
```

The service defaults to:

```text
http://localhost:4002
```

## Environment Variables

Copy `.env.example` to `.env` inside this directory for local overrides:

```bash
cp services/event-service/.env.example services/event-service/.env
```

Available variables:

- `PORT`: service port, default `4002`
- `NODE_ENV`: runtime environment
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS
- `DATABASE_URL`: future PostgreSQL connection string
- `AZURE_STORAGE_CONNECTION_STRING`: Azure Blob Storage connection string
- `AZURE_STORAGE_CONTAINER_NAME`: Blob Storage container name for event images
- `MAX_IMAGE_UPLOAD_BYTES`: image upload size limit, default `5242880`

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4002/health
curl http://localhost:4002/api/events
curl http://localhost:4002/api/events/example-event-id
curl -X POST http://localhost:4002/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud Engineering Lab","description":"Practical cloud workshop","category":"Academic","location":"Computing Lab B","startDate":"2026-10-14T15:30:00.000Z","endDate":"2026-10-14T17:30:00.000Z","capacity":60}'

curl -X POST http://localhost:4002/api/events/upload-image \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "image=@/path/to/event-image.png"
```
