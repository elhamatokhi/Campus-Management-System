import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import EventForm from '../components/EventForm.jsx';
import PageShell from '../components/PageShell.jsx';

export default function CreateEvent() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Create event"
      description="This admin form is a UI placeholder. It will submit to the Event Service in a later phase."
    >
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
      <EventForm submitLabel="Create event" />
    </PageShell>
  );
}
