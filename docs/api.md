# API Plan

All backend services will expose REST APIs and a health endpoint.

## Standard Error Format

```json
{
  "success": false,
  "message": "Event not found"
}
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
- `PUT /api/events/:id` - requires admin Bearer token
- `DELETE /api/events/:id` - requires admin Bearer token

## Booking Service

- `GET /health`
- `POST /api/bookings` - requires Bearer token
- `GET /api/bookings` - requires Bearer token
- `GET /api/bookings/:id` - requires Bearer token
- `DELETE /api/bookings/:id` - requires Bearer token
