import { useState } from 'react';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Notice from './Notice.jsx';

export default function EventForm({ event, submitLabel }) {
  const [message, setMessage] = useState('');
  const showPendingMessage = () => {
    setMessage('Backend integration coming in Phase 3+. This form does not save event data yet.');
  };

  return (
    <form
      className="max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(formEvent) => {
        formEvent.preventDefault();
        showPendingMessage();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Title" id="event-title" defaultValue={event?.title ?? ''} placeholder="Event title" />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-campus-navy">Category</span>
          <select
            id="event-category"
            defaultValue={event?.category ?? 'Academic'}
            className="focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option>Academic</option>
            <option>Career</option>
            <option>Culture</option>
            <option>Sports</option>
            <option>Wellbeing</option>
          </select>
        </label>
        <Input label="Date" id="event-date" type="date" defaultValue={event?.date ?? '2026-09-30'} />
        <Input label="Start time" id="event-time" type="time" defaultValue={event?.time ?? '14:00'} />
        <Input label="End time" id="event-end-time" type="time" defaultValue={event?.endTime ?? '16:00'} />
        <Input label="Capacity" id="event-capacity" type="number" defaultValue={event?.capacity ?? 100} />
        <Input
          label="Location"
          id="event-location"
          defaultValue={event?.location ?? ''}
          placeholder="Campus venue"
          containerClassName="sm:col-span-2"
        />
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-campus-navy">Description</span>
        <textarea
          id="event-description"
          rows="5"
          defaultValue={event?.longDescription ?? ''}
          placeholder="Describe the event for students"
          className="focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400"
        />
      </label>

      <Input
        label="Image URL"
        id="event-image"
        defaultValue={event?.imageUrl ?? ''}
        placeholder="Image reference will later come from Blob Storage"
        containerClassName="mt-5"
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit">{submitLabel}</Button>
        <Button variant="secondary" onClick={showPendingMessage}>
          Save draft
        </Button>
      </div>

      {message && (
        <div className="mt-5">
          <Notice>{message}</Notice>
        </div>
      )}
    </form>
  );
}
