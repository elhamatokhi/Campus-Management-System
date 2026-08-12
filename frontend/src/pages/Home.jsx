import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getEvents } from '../api/eventApi.js';
import campusHero from '../assets/campus-hero.png';
import Button from '../components/Button.jsx';
import EventCard from '../components/EventCard.jsx';
import PageShell from '../components/PageShell.jsx';
import { availablePlaces } from '../utils/eventFormat.js';

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents()
      .then((response) => setEvents(response.data))
      .catch(() => setEvents([]));
  }, []);

  const bookedSeats = events.reduce((sum, event) => sum + (event._count?.bookings ?? 0), 0);
  const openSeats = events.reduce((sum, event) => sum + availablePlaces(event), 0);
  const stats = [
    { label: 'Events listed', value: events.length },
    { label: 'Booked seats', value: bookedSeats },
    { label: 'Open seats', value: openSeats },
  ];

  return (
    <>
      <section className="bg-campus-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-campus-gold">
              Campus Event Management
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">Discover, book, and manage university events.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A clean student portal for finding academic sessions, career events, cultural activities,
              wellbeing workshops, and sports opportunities across campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/events">
                <Button>Browse events</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-campus-navy">
                  Create account
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-slate-200 p-5">
                <p className="text-3xl font-bold text-campus-navy">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageShell
        eyebrow="Featured"
        title="Popular upcoming events"
        description="Explore upcoming activities and opportunities across campus."
      >
        {events.length > 0 ? <div className="grid gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div> : (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <h2 className="text-base font-semibold text-campus-navy">No upcoming events yet.</h2>
            <p className="mt-2">New campus activities will appear here when they are added.</p>
          </div>
        )}
      </PageShell>
    </>
  );
}
