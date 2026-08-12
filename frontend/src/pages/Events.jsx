import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getEvents } from '../api/eventApi.js';
import EventCard from '../components/EventCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { eventCategories } from '../utils/eventFormat.js';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const initialCategory = eventCategories.includes(categoryFromUrl) ? categoryFromUrl : 'All';
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then((response) => setEvents(response.data))
      .catch((apiError) => {
        console.error('Events request failed:', apiError);
        setError('Events are temporarily unavailable. Please try again in a moment.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const nextCategory = eventCategories.includes(categoryFromUrl) ? categoryFromUrl : 'All';
    setCategory(nextCategory);
  }, [categoryFromUrl]);

  const filteredEvents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory = category === 'All' || event.category === category;
      const matchesSearch =
        !searchText ||
        [event.title, event.description, event.location, event.category]
          .join(' ')
          .toLowerCase()
          .includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [category, events, search]);

  function handleCategoryChange(event) {
    const nextCategory = event.target.value;
    setCategory(nextCategory);

    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', nextCategory);
    }

    setSearchParams(nextParams);
  }

  return (
    <PageShell
      eyebrow="Events"
      title="Find your next campus activity"
      description="Search and filter academic, career, cultural, wellbeing, and sports activities."
    >
      <Link
        to="/"
        className="mb-6 inline-flex text-sm font-semibold text-campus-teal transition hover:text-teal-700"
      >
        ← Back to home
      </Link>

      <div className="mb-8 grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <label>
          <span className="mb-2 block text-sm font-semibold text-campus-navy">Search events</span>
          <input
            className="focus-ring w-full rounded-md border border-slate-300 px-4 py-3 text-sm"
            placeholder="Search by title, location, or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-campus-navy">Category</span>
          <select
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm"
            value={category}
            onChange={handleCategoryChange}
          >
            {eventCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-slate-600">
        <p>
          Showing <strong className="text-campus-navy">{filteredEvents.length}</strong> of{' '}
          <strong className="text-campus-navy">{events.length}</strong> events
        </p>
      </div>

      {isLoading && <LoadingState message="Loading events..." />}
      {!isLoading && error && (
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <Notice>{error}</Notice>
        </div>
      )}

      {!isLoading && !error && filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : null}
      {!isLoading && !error && filteredEvents.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-campus-navy">No events found</h2>
          <p className="mt-2 text-sm text-slate-600">
            Try changing your search or category filters, or check back later.
          </p>
        </div>
      )}
    </PageShell>
  );
}
