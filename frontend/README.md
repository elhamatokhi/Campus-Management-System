# Frontend

React + Vite + Tailwind CSS frontend for the Campus Management System.

## Responsibilities

- Public home page and event discovery.
- Event search, filtering, and detail pages.
- Login and registration flows.
- Student bookings, cancellation history, and profile screens.
- Role-aware admin homepage and Admin Dashboard access.
- Admin event create/edit forms with Azure Blob image upload through the Event Service.

## Routes

- `/` - role-aware Home
- `/events` - Events
- `/events/:id` - Event Details
- `/login` - Login
- `/register` - Register
- `/bookings` - My Bookings
- `/profile` - Profile
- `/admin` - Admin Dashboard
- `/admin/events/new` - Create Event
- `/admin/events/:id/edit` - Edit Event

## API Configuration

The frontend reads API base URLs from Vite environment variables:

```text
VITE_USER_SERVICE_URL
VITE_EVENT_SERVICE_URL
VITE_BOOKING_SERVICE_URL
```

For local Vite development, use localhost service URLs. For Azure Container Apps, these values are built as empty strings so the browser calls same-origin `/api/...` paths and the frontend nginx container proxies requests to internal backend Container Apps.

## Commands

From the repository root:

```bash
npm run dev -w frontend
npm run build -w frontend
npm run lint -w frontend
npm test -w frontend
```

Seeded demo accounts:

```text
admin@campus.test / DevPassword123!
student@campus.test / DevPassword123!
```

These are development/demo credentials only.
