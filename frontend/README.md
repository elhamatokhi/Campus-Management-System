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

The frontend currently uses local placeholder data only. REST API integration will be added in a later phase.
