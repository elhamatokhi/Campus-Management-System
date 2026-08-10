import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { availablePlaces, formatEventDate, getEventById } from '../data/mockEvents.js';

export default function EventDetails() {
  const { id } = useParams();
  const event = getEventById(id);
  const handleBook = () => {
    window.alert('Backend integration coming in Phase 3+. This demo button does not create a booking yet.');
  };

  if (!event) {
    return (
      <PageShell title="Event not found">
        <ErrorState
          title="Event not found"
          message="The event could not be found in the current placeholder data."
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
          src={event.imageUrl}
          alt=""
        />

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-5 text-sm">
            <div>
              <dt className="font-semibold text-campus-navy">Date and time</dt>
              <dd className="mt-1 text-slate-600">
                {formatEventDate(event.date)} from {event.time} to {event.endTime}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-campus-navy">Location</dt>
              <dd className="mt-1 text-slate-600">{event.location}</dd>
            </div>
            <div>
              <dt className="font-semibold text-campus-navy">Capacity</dt>
              <dd className="mt-1 text-slate-600">
                {event.booked} booked out of {event.capacity}. {availablePlaces(event)} places available.
              </dd>
            </div>
          </dl>

          <p className="mt-6 border-t border-slate-100 pt-6 text-sm leading-7 text-slate-600">
            {event.longDescription}
          </p>

          <div className="mt-6">
            <Notice>Demo UI only: booking will be connected after the backend and authentication phases.</Notice>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleBook}>Book event</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
