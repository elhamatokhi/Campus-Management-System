import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBooking } from '../api/bookingApi.js';
import { getEvent, getEvents } from '../api/eventApi.js';
import { getProfile } from '../api/userApi.js';
import { adminUser, mockEvents, studentUser } from '../test/mockData.js';
import { renderApp } from '../test/renderApp.jsx';

vi.mock('../api/bookingApi.js', () => ({
  cancelBooking: vi.fn(),
  createBooking: vi.fn(),
  getBookings: vi.fn(),
}));

vi.mock('../api/eventApi.js', () => ({
  getEvent: vi.fn(),
  getEvents: vi.fn(),
}));

vi.mock('../api/userApi.js', () => ({
  getProfile: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

function mockStoredProfile() {
  getProfile.mockImplementation(() => {
    const stored = JSON.parse(window.localStorage.getItem('campusEventsAuth'));
    return Promise.resolve({ success: true, data: stored.user });
  });
}

describe('Event details booking actions', () => {
  beforeEach(() => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });
    getEvent.mockImplementation((id) => Promise.resolve({
      success: true,
      data: mockEvents.find((event) => event.id === id),
    }));
    createBooking.mockResolvedValue({ success: true, data: {} });
    mockStoredProfile();
  });

  it('allows a student to book an event', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/events/event-academic', user: studentUser });

    await user.click(await screen.findByRole('button', { name: /book event/i }));

    expect(createBooking).toHaveBeenCalledWith('test-token', 'event-academic');
    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument();
  });

  it('does not show the booking CTA to admins', async () => {
    renderApp({ route: '/events/event-academic', user: adminUser });

    expect(await screen.findByRole('link', { name: /manage event/i }))
      .toHaveAttribute('href', '/admin/events/event-academic/edit');
    expect(screen.queryByRole('button', { name: /book event/i })).not.toBeInTheDocument();
  });
});
