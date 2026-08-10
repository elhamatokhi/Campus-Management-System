# Frontend

React + Vite + Tailwind CSS application for the Campus Event Management System.

## Implemented in Phase 2

- React + Vite project setup
- Tailwind CSS setup
- React Router setup
- Responsive application layout
- Mock event data for UI demonstration
- Reusable UI components

## Routes

- `/` - Home
- `/events` - Events
- `/events/:id` - Event Details
- `/login` - Login
- `/register` - Register
- `/bookings` - My Bookings
- `/profile` - Profile
- `/admin` - Admin Dashboard
- `/admin/events/new` - Create Event
- `/admin/events/:id/edit` - Edit Event

## Commands

From the repository root:

```bash
npm run dev
npm run build
npm run lint
npm run test
```

Or directly in this workspace:

```bash
npm run dev -w frontend
```

The frontend uses the User, Event, and Booking REST services. Configure service URLs with:

```text
VITE_USER_SERVICE_URL=http://localhost:4001
VITE_EVENT_SERVICE_URL=http://localhost:4002
VITE_BOOKING_SERVICE_URL=http://localhost:4003
```

Login with seeded development accounts:

```text
admin@campus.test / DevPassword123!
student@campus.test / DevPassword123!
```
