import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { formatEventDate, mockBookings } from '../data/mockEvents.js';

export default function MyBookings() {
  // TODO: Replace this development-only page access with a protected route after authentication is implemented.
  const handleCancel = () => {
    window.alert('Backend integration coming in Phase 3+. This demo button does not cancel a real booking yet.');
  };

  return (
    <PageShell
      eyebrow="My Bookings"
      title="Your upcoming reservations"
      description="These booking records use local placeholder data until the Booking Service is available."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/events">
          <Button variant="secondary">Back to events</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4">
        <Notice>
          Development preview: these sample bookings represent what the logged-in student will see after authentication and the Booking Service are connected.
        </Notice>
      </div>

      <div className="grid gap-4">
        {mockBookings.map((booking) => (
          <article
            key={booking.id}
            className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[120px_1fr_auto] md:items-center"
          >
            <img
              className="h-24 w-full rounded-md object-cover md:w-28"
              src={booking.event.imageUrl}
              alt=""
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-campus-teal">
                {booking.status}
              </p>
              <h2 className="mt-1 text-xl font-bold text-campus-navy">{booking.event.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {formatEventDate(booking.event.date)} at {booking.event.time} - {booking.event.location}
              </p>
            </div>
            <div className="flex gap-2 md:flex-col">
              <Link to={`/events/${booking.event.id}`}>
                <Button variant="secondary" className="w-full">
                  View
                </Button>
              </Link>
              <Button variant="danger" className="w-full" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
