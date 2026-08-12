import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getBookings } from '../api/bookingApi.js';
import { getEvents } from '../api/eventApi.js';
import campusHero from '../assets/campus-hero.png';
import Button from '../components/Button.jsx';
import EventCard from '../components/EventCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { availablePlaces, formatEventDate } from '../utils/eventFormat.js';

const campusGroups = [
  'HTW Berlin',
  'Student Council',
  'International Office',
  'Career Service',
  'University Sports',
  'AStA',
];
const campusShowcaseGroups = [...campusGroups, ...campusGroups];

const interestCategories = [
  {
    category: 'Academic',
    title: 'Academic & Learning',
    description: 'Lectures, workshops, and study-focused events.',
  },
  {
    category: 'Career',
    title: 'Career & Networking',
    description: 'Employer sessions, mentoring, and professional events.',
  },
  {
    category: 'Culture',
    title: 'Culture & International',
    description: 'Global, cultural, and community exchange activities.',
  },
  {
    category: 'Sports',
    title: 'Sports',
    description: 'Campus sports events and active student programs.',
  },
  {
    category: 'Wellbeing',
    title: 'Wellbeing',
    description: 'Health, balance, and support-focused activities.',
  },
];

function sortUpcomingEvents(events) {
  const now = new Date();
  return events
    .filter((event) => new Date(event.startDate) >= now)
    .sort((first, second) => new Date(first.startDate) - new Date(second.startDate));
}

function getEventsThisWeek(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return events.filter((event) => {
    const startDate = new Date(event.startDate);
    return startDate >= today && startDate < weekEnd;
  });
}

function getAttentionItems(events) {
  const now = new Date();
  const twoDaysFromNow = new Date(now);
  twoDaysFromNow.setHours(now.getHours() + 48);

  return sortUpcomingEvents(events).flatMap((event) => {
    const items = [];
    const startDate = new Date(event.startDate);
    const remaining = availablePlaces(event);
    const booked = event._count?.bookings ?? 0;

    if (remaining === 0) {
      items.push({
        id: `${event.id}-full`,
        eventId: event.id,
        title: event.title,
        message: 'Event is full',
      });
    } else if (remaining <= 5) {
      items.push({
        id: `${event.id}-low-capacity`,
        eventId: event.id,
        title: event.title,
        message: `Only ${remaining} ${remaining === 1 ? 'place' : 'places'} remaining`,
      });
    }

    if (startDate >= now && startDate <= twoDaysFromNow) {
      items.push({
        id: `${event.id}-soon`,
        eventId: event.id,
        title: event.title,
        message: 'Event starts within 48 hours',
      });
    }

    if (booked > 0 && Number(event.capacity) > 0 && booked / Number(event.capacity) >= 0.9 && remaining > 5) {
      items.push({
        id: `${event.id}-approaching-capacity`,
        eventId: event.id,
        title: event.title,
        message: 'Event is approaching capacity',
      });
    }

    return items;
  }).slice(0, 4);
}

function AdminHome({ user, token }) {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [eventError, setEventError] = useState(false);
  const [bookingError, setBookingError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([getEvents(), getBookings(token)])
      .then(([eventResult, bookingResult]) => {
        if (!isMounted) return;

        if (eventResult.status === 'fulfilled') {
          setEvents(eventResult.value.data);
        } else {
          console.error('Admin home events request failed:', eventResult.reason);
          setEventError(true);
        }

        if (bookingResult.status === 'fulfilled') {
          setBookings(bookingResult.value.data);
        } else {
          console.error('Admin home bookings request failed:', bookingResult.reason);
          setBookingError(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const upcomingEvents = useMemo(() => sortUpcomingEvents(events), [events]);
  const eventsThisWeek = useMemo(() => getEventsThisWeek(events), [events]);
  const attentionItems = useMemo(() => getAttentionItems(events), [events]);
  const activeBookings = bookings.filter((booking) => booking.status !== 'CANCELLED').length;
  const adminName = user?.name?.trim();

  const metrics = [
    { label: 'Events this week', value: eventsThisWeek.length },
    { label: 'Upcoming events', value: upcomingEvents.length },
    { label: 'Need attention', value: attentionItems.length },
    ...(!bookingError ? [{ label: 'Active bookings', value: activeBookings }] : []),
  ];

  return (
    <>
      <section className="bg-campus-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-campus-gold">
                  Welcome back{adminName ? `, ${adminName}` : ''}
                </p>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                  Administrator
                </span>
              </div>
              <h1 className="text-4xl font-bold sm:text-5xl">Campus event command center</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                Here's what needs your attention across campus events.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/admin/events/new">
                <Button>Create event</Button>
              </Link>
              <Link to="/admin">
                <Button variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-campus-navy">
                  Admin dashboard
                </Button>
              </Link>
              <Link to="/events">
                <Button variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-campus-navy">
                  Public events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageShell
        eyebrow="Today"
        title="What needs attention"
        description="A short operational view for the next actions, not a full dashboard."
      >
        {isLoading && <LoadingState message="Loading admin home..." />}

        {!isLoading && (eventError || bookingError) && (
          <div className="mb-6">
            <Notice tone="warning">Some dashboard information is temporarily unavailable.</Notice>
          </div>
        )}

        {!isLoading && !eventError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-3xl font-bold text-campus-navy">{metric.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{metric.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
              <section className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-xl font-bold text-campus-navy">Upcoming events</h2>
                    <p className="mt-1 text-sm text-slate-600">Next events requiring management visibility.</p>
                  </div>
                  <Link className="text-sm font-semibold text-campus-teal hover:text-teal-700" to="/admin">
                    View all
                  </Link>
                </div>

                <div>
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1fr_120px_100px_100px] md:items-center"
                    >
                      <div>
                        <p className="font-semibold text-campus-navy">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{event.location}</p>
                      </div>
                      <p className="text-sm text-slate-600">{formatEventDate(event.startDate)}</p>
                      <p className="text-sm font-medium text-slate-700">
                        {event._count?.bookings ?? 0} / {event.capacity}
                      </p>
                      <Link to={`/admin/events/${event.id}/edit`}>
                        <Button variant="secondary" className="w-full px-3">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {upcomingEvents.length === 0 && (
                    <div className="px-5 py-6 text-sm text-slate-600">
                      No upcoming events are scheduled right now.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-campus-navy">Needs attention</h2>
                <div className="mt-4 space-y-3">
                  {attentionItems.length > 0 ? (
                    attentionItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/admin/events/${item.eventId}/edit`}
                        className="block rounded-md border border-amber-200 bg-amber-50 px-4 py-3 transition hover:border-amber-300"
                      >
                        <p className="text-sm font-semibold text-amber-950">{item.message}</p>
                        <p className="mt-1 text-sm text-amber-800">{item.title}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-md border border-teal-200 bg-campus-mist px-4 py-3 text-sm text-campus-navy">
                      Everything looks good. No events need attention right now.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}

export default function Home() {
  const { isAuthenticated, isAdmin, token, user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      setEvents([]);
      return;
    }

    getEvents()
      .then((response) => setEvents(response.data))
      .catch(() => setEvents([]));
  }, [isAdmin]);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const eyebrow = isAuthenticated && firstName
    ? `Welcome back, ${firstName}`
    : 'Campus Event Management';
  const headline = isAuthenticated
    ? "Discover what's happening on campus."
    : 'Discover, book, and manage university events.';
  const primaryCta = isAdmin
    ? { label: 'Manage events', to: '/admin/events/new' }
    : { label: 'Browse events', to: '/events' };
  const secondaryCta = isAdmin
    ? { label: 'Admin Dashboard', to: '/admin' }
    : isAuthenticated
      ? { label: 'My Bookings', to: '/bookings' }
      : { label: 'Create account', to: '/register' };

  if (isAdmin) {
    return <AdminHome user={user} token={token} />;
  }

  return (
    <>
      <section className="bg-campus-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-campus-gold">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">{headline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A clean student portal for finding academic sessions, career events, cultural activities,
              wellbeing workshops, and sports opportunities across campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryCta.to}>
                <Button>{primaryCta.label}</Button>
              </Link>
              <Link to={secondaryCta.to}>
                <Button variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-campus-navy">
                  {secondaryCta.label}
                </Button>
              </Link>
            </div>
          </div>
          <img
            className="h-72 w-full rounded-md object-cover shadow-soft sm:h-96"
            src={campusHero}
            alt="Students walking on a university campus"
          />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-campus-navy">Events from across our campus community</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Discover activities shared by student groups, university offices, and campus programs.
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 py-4 shadow-sm">
            <div className="campus-marquee-track flex w-max gap-3 px-4 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
              {campusShowcaseGroups.map((group, index) => {
                const initials = group
                  .split(/\s+/)
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 3);

                return (
                  <div
                    key={`${group}-${index}`}
                    className="flex min-w-max items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    aria-hidden={index >= campusGroups.length ? 'true' : undefined}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-campus-mist text-xs font-bold text-campus-teal">
                      {initials}
                    </span>
                    <span className="text-sm font-semibold text-campus-navy">{group}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PageShell
        eyebrow="Featured"
        title="Upcoming events"
        description="Explore upcoming activities and opportunities across campus."
      >
        {events.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8">
              <Link to="/events">
                <Button variant="secondary">View all events</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <h2 className="text-base font-semibold text-campus-navy">No upcoming events yet.</h2>
            <p className="mt-2">New campus activities will appear here when they are added.</p>
          </div>
        )}
      </PageShell>

      <PageShell
        eyebrow="Interests"
        title="Explore by interest"
        description="Choose an area of campus life and browse matching events."
        className="border-t border-slate-200 bg-white"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interestCategories.map((item) => (
            <Link
              key={item.category}
              to={`/events?category=${encodeURIComponent(item.category)}`}
              className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-campus-teal hover:shadow-soft"
            >
              <p className="text-base font-bold text-campus-navy group-hover:text-campus-teal">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </PageShell>
    </>
  );
}
