import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getBookings } from '../api/bookingApi.js';
import { getEvents } from '../api/eventApi.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { availablePlaces, formatEventDate } from '../utils/eventFormat.js';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventError, setEventError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([getEvents(), getBookings(token)])
      .then(([eventResult, bookingResult]) => {
        if (!isMounted) return;

        if (eventResult.status === 'fulfilled') {
          const eventResponse = eventResult.value;
        setEvents(eventResponse.data);
        } else {
          setEventError(eventResult.reason.message);
        }

        if (bookingResult.status === 'fulfilled') {
          const bookingResponse = bookingResult.value;
          setBookings(bookingResponse.data);
        } else {
          setBookingError(bookingResult.reason.message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const metrics = useMemo(() => {
    const totalCapacity = events.reduce((sum, event) => sum + Number(event.capacity || 0), 0);
    const availableCapacity = events.reduce((sum, event) => sum + availablePlaces(event), 0);
    const usedCapacity = totalCapacity > 0 ? Math.round(((totalCapacity - availableCapacity) / totalCapacity) * 100) : 0;

    const baseMetrics = [
      { label: 'Total events', value: events.length },
      { label: 'Open seats', value: availableCapacity },
      { label: 'Capacity used', value: `${usedCapacity}%` },
    ];

    if (!bookingError) {
      baseMetrics.splice(1, 0, { label: 'Total bookings', value: bookings.length });
    }

    return baseMetrics;
  }, [bookingError, bookings.length, events]);

  return (
    <PageShell
      eyebrow="Admin"
      title="Admin dashboard"
      description="A management overview using live Event Service and Booking Service data."
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
        <Notice>Live admin data from Event Service and Booking Service.</Notice>
      </div>

      {isLoading && <LoadingState message="Loading dashboard..." />}
      {!isLoading && eventError && (
        <ErrorState title="Could not load events" message={eventError} />
      )}
      {!isLoading && !eventError && bookingError && (
        <div className="mb-6">
          <Notice tone="warning">
            Booking totals are unavailable right now: {bookingError}
          </Notice>
        </div>
      )}

      {!isLoading && !eventError && <>
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
              <p className="text-sm text-slate-600">{formatEventDate(event.startDate)}</p>
              <p className="text-sm text-slate-600">
                {event._count?.bookings ?? 0} / {event.capacity}
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
      </>}
    </PageShell>
  );
}
