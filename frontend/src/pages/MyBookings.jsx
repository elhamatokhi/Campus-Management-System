import { Link } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { cancelBooking, getBookings } from '../api/bookingApi.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import PageShell from '../components/PageShell.jsx';
import Notice from '../components/Notice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatEventDate, formatEventTime } from '../utils/eventFormat.js';
import { eventImageUrl } from '../utils/imageUrl.js';

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(() => {
    setIsLoading(true);
    getBookings(token)
      .then((response) => setBookings(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    setError('');
    setMessage('');
    try {
      await cancelBooking(token, bookingId);
      setMessage('Booking cancelled.');
      loadBookings();
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  return (
    <PageShell
      eyebrow="My Bookings"
      title="Your upcoming reservations"
      description="View and manage reservations for your account."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/events">
          <Button variant="secondary">Back to events</Button>
        </Link>
      </div>

      {message && <div className="mb-6"><Notice>{message}</Notice></div>}
      {error && <div className="mb-6"><ErrorState title="Booking error" message={error} /></div>}
      {isLoading && <LoadingState message="Loading bookings..." />}

      {!isLoading && bookings.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-campus-navy">No bookings yet</h2>
          <p className="mt-2 text-sm text-slate-600">Book an event to see it here.</p>
        </div>
      )}

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[120px_1fr_auto] md:items-center"
          >
            <img
              className="h-24 w-full rounded-md object-cover md:w-28"
              src={eventImageUrl(booking.event.imageUrl)}
              alt=""
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-campus-teal">
                {booking.status}
              </p>
              <h2 className="mt-1 text-xl font-bold text-campus-navy">{booking.event.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {formatEventDate(booking.event.startDate)} at {formatEventTime(booking.event.startDate)} - {booking.event.location}
              </p>
            </div>
            <div className="flex gap-2 md:flex-col">
              <Link to={`/events/${booking.event.id}`}>
                <Button variant="secondary" className="w-full">
                  View
                </Button>
              </Link>
              <Button variant="danger" className="w-full" onClick={() => handleCancel(booking.id)}>
                Cancel
              </Button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
