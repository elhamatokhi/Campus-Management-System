import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EventForm from '../components/EventForm.jsx';
import PageShell from '../components/PageShell.jsx';
import { getEventById } from '../data/mockEvents.js';

export default function EditEvent() {
  const { id } = useParams();
  const event = getEventById(id);

  if (!event) {
    return (
      <PageShell title="Edit event">
        <ErrorState
          title="Event not found"
          message="The selected event does not exist in the placeholder data."
        />
        <Link to="/admin" className="mt-6 inline-block">
          <Button>Back to admin</Button>
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Admin"
      title={`Edit ${event.title}`}
      description="Admin edit view using mock data until the Event Service exists."
    >
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
      <EventForm event={event} submitLabel="Save changes" />
    </PageShell>
  );
}
