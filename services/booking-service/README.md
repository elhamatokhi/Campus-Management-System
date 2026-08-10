# Booking Service

Node.js + Express microservice for event bookings and availability checks.

## Responsibility

The Booking Service will eventually handle:

- Creating event bookings
- Listing bookings for the authenticated student or admin
- Reading booking details
- Cancelling bookings
- Preventing duplicate bookings
- Checking event capacity before confirming a booking
- Triggering a future Azure Function for booking notifications

As of Phase 6, booking creation, listing, reading, and cancellation use PostgreSQL through Prisma. Authentication and service-to-service business checks will be added later.

## Planned Booking Fields

- `id`
- `userId`
- `eventId`
- `status`
- `createdAt`

## Planned Service Interactions

The Booking Service will later communicate with:

- User Service: confirm the authenticated user and role.
- Event Service: check event details and available capacity.
- Azure Function: send or process booking notifications after booking creation.

## Endpoints

| Method | Endpoint | Status |
| --- | --- | --- |
| `GET` | `/health` | Implemented |
| `POST` | `/api/bookings` | Database-backed |
| `GET` | `/api/bookings` | Database-backed |
| `GET` | `/api/bookings/:id` | Database-backed |
| `DELETE` | `/api/bookings/:id` | Database-backed cancellation |

Duplicate bookings are prevented by a database constraint on `userId` and `eventId`.

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

Copy `.env.example` to `.env` inside this directory for local overrides:

```bash
cp services/booking-service/.env.example services/booking-service/.env
```

Available variables:

- `PORT`: service port, default `4003`
- `NODE_ENV`: runtime environment
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS
- `DATABASE_URL`: future PostgreSQL connection string
- `USER_SERVICE_URL`: future User Service base URL
- `EVENT_SERVICE_URL`: future Event Service base URL
- `BOOKING_NOTIFICATION_FUNCTION_URL`: future Azure Function URL for booking notifications

Do not commit real secrets.

## Quick Checks

```bash
curl http://localhost:4003/health
curl http://localhost:4003/api/bookings
curl http://localhost:4003/api/bookings/example-booking-id
curl -X POST http://localhost:4003/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","eventId":"event-1"}'
curl -X DELETE http://localhost:4003/api/bookings/example-booking-id
```
