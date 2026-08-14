import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventForm from '../components/EventForm.jsx';

const existingEvent = {
  id: 'event-1',
  title: 'Cybersecurity Workshop',
  description: 'Security practice lab.',
  category: 'Academic',
  location: 'Lab 1',
  startDate: '2099-08-20T10:00:00.000Z',
  endDate: '2099-08-20T12:00:00.000Z',
  capacity: 40,
  imageUrl: 'https://storage.example.net/events/event-1.png',
};

describe('EventForm image preview', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:preview-image'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the existing event image when editing an event', () => {
    render(
      <EventForm
        event={existingEvent}
        submitLabel="Save changes"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: /cybersecurity workshop event preview/i }))
      .toHaveAttribute('src', existingEvent.imageUrl);
  });

  it('previews a newly selected image instead of the existing image', async () => {
    const user = userEvent.setup();
    const file = new File(['image-bytes'], 'replacement.png', { type: 'image/png' });

    render(
      <EventForm
        event={existingEvent}
        submitLabel="Save changes"
        onSubmit={vi.fn()}
      />,
    );

    await user.upload(screen.getByLabelText(/upload image/i), file);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole('img', { name: /cybersecurity workshop event preview/i }))
      .toHaveAttribute('src', 'blob:preview-image');
  });
});
