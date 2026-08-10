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

In Phase 4, this service provides the Express foundation and route structure only. PostgreSQL, Prisma, Azure Blob Storage, authentication, and authorization will be added later.

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
| `GET` | `/api/events` | Placeholder |
| `GET` | `/api/events/:id` | Placeholder |
| `POST` | `/api/events` | Placeholder |
| `PUT` | `/api/events/:id` | Placeholder |
| `DELETE` | `/api/events/:id` | Placeholder |

Placeholder routes return `501 Not Implemented` with a clear JSON message.

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
- `AZURE_STORAGE_CONNECTION_STRING`: future Azure Blob Storage connection string
- `AZURE_STORAGE_CONTAINER_NAME`: future Blob Storage container name for event images

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4002/health
curl http://localhost:4002/api/events
curl http://localhost:4002/api/events/example-event-id
curl -X POST http://localhost:4002/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud Engineering Lab","capacity":60}'
```
