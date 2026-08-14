# Booking Service

Node.js + Express microservice for event bookings and availability checks.

## Responsibility

The Booking Service handles:

- Creating event bookings
- Listing bookings for the authenticated student or admin
- Reading booking details
- Cancelling bookings
- Preventing duplicate bookings
- Checking event capacity before confirming a booking
- Publishing booking notification messages to Azure Storage Queue for the Azure Function

Booking creation, listing, reading, and cancellation require JWT authentication and use PostgreSQL through Prisma.

## Booking Fields

- `id`
- `userId`
- `eventId`
- `status`
- `createdAt`

## Service Interactions

The Booking Service communicates with:

- Prisma/PostgreSQL: read users, events, and bookings for persistence and authorization decisions.
- Azure Storage Queue: publish booking notification messages for the queue-triggered Azure Function.

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `POST` | `/api/bookings` | Database-backed |
| `GET` | `/api/bookings` | Database-backed |
| `GET` | `/api/bookings/:id` | Database-backed |
| `DELETE` | `/api/bookings/:id` | Database-backed cancellation |

Protected routes require:

```text
Authorization: Bearer <token>
```

Student rules:

- Students create bookings for themselves. The service uses the JWT user id and does not trust `userId` from the request body.
- Students can list, view, and cancel only their own bookings.
- Duplicate active bookings for the same user/event return `409 Conflict`.
- Full events return `409 Conflict`.

Admin rules:

- Admin users can list and view all bookings.
- Admin users may cancel bookings.
- Admin users cannot create event bookings; booking creation is reserved for students.

## Local Development

Install dependencies from the repository root:

```bash
npm install
```

Run the service:

```bash
npm run dev:booking-service
```

Or run it directly as a workspace:

```bash
npm run dev -w services/booking-service
```

The service defaults to:

```text
http://localhost:4003
```

## Environment Variables

For normal monorepo development, put local configuration in the root `.env` file:

```bash
cp .env.example .env
```

The Booking Service loads the root `.env` first. A `services/booking-service/.env` file is optional and only fills variables that are missing from the root `.env`.

Available variables:

- `PORT`: service port, default `4003`
- `NODE_ENV`: runtime environment
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS
- `DATABASE_URL`: PostgreSQL connection string
- `USER_SERVICE_URL`: User Service base URL, retained for service-to-service configuration compatibility
- `EVENT_SERVICE_URL`: Event Service base URL, retained for service-to-service configuration compatibility
- `BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING`: Azure Storage connection string used to publish booking notification queue messages. Leave empty locally to skip notification publishing.
- `BOOKING_NOTIFICATION_QUEUE`: queue name for booking notifications, default `booking-notifications`

Do not commit real secrets.

## Booking Notification Queue

After a booking is created successfully, the service attempts to publish this message shape:

```json
{
  "bookingId": "booking-id",
  "eventId": "event-id",
  "eventTitle": "Cybersecurity Workshop",
  "userEmail": "student@example.com",
  "userName": "Alex Student",
  "status": "CONFIRMED",
  "createdAt": "2026-08-12T15:59:00.000Z"
}
```

Queue publishing is intentionally best-effort. If the queue is not configured or Azure Storage is temporarily unavailable, the booking response still succeeds and the service logs a safe diagnostic.

## Quick Checks

```bash
curl http://localhost:4003/health
curl http://localhost:4003/api/bookings
curl http://localhost:4003/api/bookings/example-booking-id
curl -X POST http://localhost:4003/api/bookings \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"ai-research-showcase"}'
curl -X DELETE http://localhost:4003/api/bookings/example-booking-id \
  -H "Authorization: Bearer STUDENT_TOKEN"
```
