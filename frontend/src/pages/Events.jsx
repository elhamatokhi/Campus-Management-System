import { useMemo, useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import PageShell from '../components/PageShell.jsx';
import { eventCategories, events } from '../data/mockEvents.js';

export default function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

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
  }, [category, search]);

  return (
    <PageShell
      eyebrow="Events"
      title="Find your next campus activity"
      description="Search and filter events using local placeholder data. Later this page will read from the Event Service REST API."
    >
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
            onChange={(event) => setCategory(event.target.value)}
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

      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-campus-navy">No events found</h2>
          <p className="mt-2 text-sm text-slate-600">Try a different search term or category.</p>
        </div>
      )}
    </PageShell>
  );
}

