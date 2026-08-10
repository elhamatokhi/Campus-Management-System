import Button from './Button.jsx';
import Input from './Input.jsx';
import Notice from './Notice.jsx';
import { buildIsoDateTime, toDateInputValue, toTimeInputValue } from '../utils/eventFormat.js';

export default function EventForm({ event, submitLabel, onSubmit, error, message, isSubmitting = false }) {
  const startDate = toDateInputValue(event?.startDate);
  const startTime = toTimeInputValue(event?.startDate);
  const endTime = toTimeInputValue(event?.endDate);

  return (
    <form
      className="max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(formEvent) => {
        formEvent.preventDefault();
        const formData = new FormData(formEvent.currentTarget);
        const date = formData.get('date');
        const start = formData.get('startTime');
        const end = formData.get('endTime');

        onSubmit({
          title: formData.get('title'),
          description: formData.get('description'),
          category: formData.get('category'),
          location: formData.get('location'),
          startDate: buildIsoDateTime(date, start),
          endDate: buildIsoDateTime(date, end),
          capacity: Number(formData.get('capacity')),
          imageUrl: formData.get('imageUrl') || null,
          imageFile: formData.get('imageFile'),
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input name="title" label="Title" id="event-title" defaultValue={event?.title ?? ''} placeholder="Event title" />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-campus-navy">Category</span>
          <select
            id="event-category"
            name="category"
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
        <Input name="date" label="Date" id="event-date" type="date" defaultValue={startDate || '2026-09-30'} />
        <Input name="startTime" label="Start time" id="event-time" type="time" defaultValue={startTime || '14:00'} />
        <Input name="endTime" label="End time" id="event-end-time" type="time" defaultValue={endTime || '16:00'} />
        <Input name="capacity" label="Capacity" id="event-capacity" type="number" defaultValue={event?.capacity ?? 100} />
        <Input
          name="location"
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
          name="description"
          rows="5"
          defaultValue={event?.description ?? ''}
          placeholder="Describe the event for students"
          className="focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400"
        />
      </label>

      <Input
        name="imageUrl"
        label="Image URL"
        id="event-image"
        defaultValue={event?.imageUrl ?? ''}
        placeholder="Uploaded image URL from Blob Storage"
        containerClassName="mt-5"
      />

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-campus-navy">Upload image</span>
        <input
          className="focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-campus-mist file:px-3 file:py-2 file:text-sm file:font-semibold file:text-campus-teal"
          id="event-image-file"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>

      {error && (
        <div className="mt-5">
          <Notice tone="warning">{error}</Notice>
        </div>
      )}
      {message && (
        <div className="mt-5">
          <Notice>{message}</Notice>
        </div>
      )}
    </form>
  );
}
