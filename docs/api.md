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
- `GET /api/users/me`
- `PUT /api/users/me`

## Event Service

- `GET /health`
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

## Booking Service

- `GET /health`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `DELETE /api/bookings/:id`

