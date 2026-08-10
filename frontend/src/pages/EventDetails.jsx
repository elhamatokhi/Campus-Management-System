import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createBooking } from '../api/bookingApi.js';
import { getEvent } from '../api/eventApi.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { availablePlaces, formatEventDate, formatEventTime } from '../utils/eventFormat.js';
import { eventImageUrl } from '../utils/imageUrl.js';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    getEvent(id)
      .then((response) => setEvent(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setError('');
    setMessage('');
    setIsBooking(true);
    try {
      await createBooking(token, event.id);
      setMessage('Booking confirmed.');
      const refreshed = await getEvent(id);
      setEvent(refreshed.data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Event details">
        <LoadingState message="Loading event details..." />
      </PageShell>
    );
  }

  if (error && !event) {
    return (
      <PageShell title="Event not found">
        <ErrorState
          title="Event not found"
          message={error}
        />
        <Link to="/events" className="mt-6 inline-block">
          <Button>Back to events</Button>
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={event.category} title={event.title} description={event.description}>
      <Link to="/events" className="mb-6 inline-block">
        <Button variant="secondary">Back to events</Button>
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <img
          className="h-80 w-full rounded-md object-cover shadow-soft lg:h-full"
          src={eventImageUrl(event.imageUrl)}
          alt=""
        />

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-5 text-sm">
            <div>
              <dt className="font-semibold text-campus-navy">Date and time</dt>
              <dd className="mt-1 text-slate-600">
                {formatEventDate(event.startDate)} from {formatEventTime(event.startDate)} to {formatEventTime(event.endDate)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-campus-navy">Location</dt>
              <dd className="mt-1 text-slate-600">{event.location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-campus-navy">Capacity</dt>
              <dd className="mt-1 text-slate-600">
                {event._count?.bookings ?? 0} booked out of {event.capacity}. {availablePlaces(event)} places available.
              </dd>
            </div>
          </dl>

          <p className="mt-6 border-t border-slate-100 pt-6 text-sm leading-7 text-slate-600">
            {event.description}
          </p>

          {message && <div className="mt-6"><Notice>{message}</Notice></div>}
          {error && <div className="mt-6"><Notice tone="warning">{error}</Notice></div>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleBook} disabled={isBooking}>
              {isBooking ? 'Booking...' : 'Book event'}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
