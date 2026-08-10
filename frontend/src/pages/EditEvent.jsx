import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteEvent, getEvent, updateEvent } from '../api/eventApi.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EventForm from '../components/EventForm.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getEvent(id)
      .then((response) => setEvent(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const response = await updateEvent(token, id, payload);
      setEvent(response.data);
      setMessage('Event updated.');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setError('');
    try {
      await deleteEvent(token, id);
      navigate('/admin');
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Edit event">
        <LoadingState message="Loading event..." />
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell title="Edit event">
        <ErrorState
          title="Event not found"
          message={error || 'The selected event does not exist.'}
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
      description="Edit event details through the Event Service."
    >
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
      <EventForm
        event={event}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        error={error}
        message={message}
        isSubmitting={isSubmitting}
      />
      <div className="mt-6 max-w-3xl rounded-md border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-900">Delete event</h2>
        <p className="mt-2 text-sm text-red-700">
          Events with existing booking records may be blocked by the backend to preserve booking history.
        </p>
        <Button variant="danger" className="mt-4" onClick={handleDelete}>
          Delete event
        </Button>
        {error && <div className="mt-4"><Notice tone="warning">{error}</Notice></div>}
      </div>
    </PageShell>
  );
}
