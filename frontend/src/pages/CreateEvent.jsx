import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createEvent } from '../api/eventApi.js';
import Button from '../components/Button.jsx';
import EventForm from '../components/EventForm.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setError('');
    setIsSubmitting(true);
    try {
      await createEvent(token, payload);
      navigate('/admin');
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      eyebrow="Admin"
      title="Create event"
      description="Create an event through the Event Service."
    >
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
      <EventForm submitLabel="Create event" onSubmit={handleSubmit} error={error} isSubmitting={isSubmitting} />
    </PageShell>
  );
}
