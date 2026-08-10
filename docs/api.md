# API Plan

All backend services will expose REST APIs and a health endpoint.

## Standard Error Format

```json
{
  "success": false,
  "message": "Event not found"
}
```

## Frontend API Configuration

The React app reads service URLs from:

```text
VITE_USER_SERVICE_URL
VITE_EVENT_SERVICE_URL
VITE_BOOKING_SERVICE_URL
```

Authenticated frontend requests send:

```text
Authorization: Bearer <token>
```

## User Service

- `GET /health`
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me` - requires Bearer token
- `PUT /api/users/me` - requires Bearer token

## Event Service

- `GET /health`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events` - requires admin Bearer token
- `POST /api/events/upload-image` - requires admin Bearer token and multipart `image`
- `PUT /api/events/:id` - requires admin Bearer token
- `DELETE /api/events/:id` - requires admin Bearer token

## Booking Service

- `GET /health`
- `POST /api/bookings` - requires Bearer token
- `GET /api/bookings` - requires Bearer token
- `GET /api/bookings/:id` - requires Bearer token
- `DELETE /api/bookings/:id` - requires Bearer token
