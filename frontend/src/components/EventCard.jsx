import { Link } from 'react-router-dom';
import { availablePlaces, formatEventDate } from '../data/mockEvents.js';

export default function EventCard({ event }) {
  return (
    <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/events/${event.id}`} aria-label={`View ${event.title}`}>
        <img className="h-48 w-full object-cover" src={event.imageUrl} alt="" />
      </Link>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-campus-mist px-3 py-1 text-campus-teal">
            {event.category}
          </span>
          <span className="text-slate-500">{formatEventDate(event.date)}</span>
        </div>
        <h2 className="text-xl font-bold text-campus-navy">
          <Link className="hover:text-campus-teal" to={`/events/${event.id}`}>
            {event.title}
          </Link>
        </h2>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{event.description}</p>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
          <span className="font-medium text-slate-600">{event.location}</span>
          <span className="shrink-0 font-semibold text-campus-navy">
            {availablePlaces(event)} places
          </span>
        </div>
      </div>
    </article>
  );
}

