import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { availablePlaces, events, formatEventDate } from '../data/mockEvents.js';

const totalBookings = events.reduce((sum, event) => sum + event.booked, 0);
const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0);
const availableCapacity = events.reduce((sum, event) => sum + availablePlaces(event), 0);

const metrics = [
  { label: 'Demo total events', value: events.length },
  { label: 'Demo booked seats', value: totalBookings },
  { label: 'Demo open seats', value: availableCapacity },
  { label: 'Demo capacity used', value: `${Math.round((totalBookings / totalCapacity) * 100)}%` },
];

export default function AdminDashboard() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Admin dashboard"
      description="A management overview for events and bookings. This view uses placeholder data until backend services are added."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
        <Link to="/admin/events/new">
          <Button>Create event</Button>
        </Link>
      </div>

      <div className="mb-8">
        <Notice>Demo data: admin metrics are calculated from local placeholder events and will later be replaced by API responses.</Notice>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-campus-navy">{metric.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{metric.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-campus-navy">Recent events</h2>
          <Link className="text-sm font-semibold text-campus-teal hover:text-teal-700" to="/events">
            View public list
          </Link>
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_110px] gap-4 border-b border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-campus-navy max-md:hidden">
            <span>Event</span>
            <span>Date</span>
            <span>Bookings</span>
            <span>Action</span>
          </div>
          {events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_110px] md:items-center"
            >
              <div>
                <p className="font-semibold text-campus-navy">{event.title}</p>
                <p className="mt-1 text-sm text-slate-500">{event.location}</p>
              </div>
              <p className="text-sm text-slate-600">{formatEventDate(event.date)}</p>
              <p className="text-sm text-slate-600">
                {event.booked} / {event.capacity}
              </p>
              <Link to={`/admin/events/${event.id}/edit`}>
                <Button variant="secondary" className="w-full px-3">
                  Edit
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
