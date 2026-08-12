import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelBooking, createBooking, getBookings } from '../api/bookingApi.js';
import { getEvent, getEvents } from '../api/eventApi.js';
import { getProfile } from '../api/userApi.js';
import { mockEvents, studentUser } from '../test/mockData.js';
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

const bookings = [
  {
    id: 'booking-confirmed',
    status: 'CONFIRMED',
    event: {
      ...mockEvents[0],
      location: 'Library Lab',
    },
  },
  {
    id: 'booking-cancelled',
    status: 'CANCELLED',
    event: {
      ...mockEvents[1],
      location: 'Main Hall',
    },
  },
];

function mockStoredProfile() {
  getProfile.mockImplementation(() => {
    const stored = JSON.parse(window.localStorage.getItem('campusEventsAuth'));
    return Promise.resolve({ success: true, data: stored.user });
  });
}

describe('My Bookings page', () => {
  beforeEach(() => {
    getBookings.mockResolvedValue({ success: true, data: bookings });
    getEvents.mockResolvedValue({ success: true, data: mockEvents });
    getEvent.mockImplementation((id) => Promise.resolve({
      success: true,
      data: mockEvents.find((event) => event.id === id),
    }));
    createBooking.mockResolvedValue({ success: true, data: {} });
    cancelBooking.mockResolvedValue({ success: true, data: {} });
    mockStoredProfile();
  });

  it('groups confirmed and cancelled bookings with status-appropriate actions', async () => {
    renderApp({ route: '/bookings', user: studentUser });

    const activeSection = await screen.findByRole('region', { name: /confirmed bookings/i });
    const cancelledSection = screen.getByRole('region', { name: /cancelled bookings/i });

    expect(within(activeSection).getByText('Research Methods Workshop')).toBeInTheDocument();
    expect(within(activeSection).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(within(activeSection).getByRole('link', { name: /view/i })).toHaveAttribute('href', '/events/event-academic');

    expect(within(cancelledSection).getByText('Career Networking Night')).toBeInTheDocument();
    expect(within(cancelledSection).getByText('CANCELLED')).toBeInTheDocument();
    expect(within(cancelledSection).queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    expect(within(cancelledSection).getByRole('link', { name: /book again/i })).toHaveAttribute('href', '/events/event-career');
  });

  it('navigates Book Again to the corresponding event details page', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/bookings', user: studentUser });

    const cancelledSection = await screen.findByRole('region', { name: /cancelled bookings/i });
    await user.click(within(cancelledSection).getByRole('link', { name: /book again/i }));

    expect(await screen.findByRole('heading', { name: /career networking night/i })).toBeInTheDocument();
    expect(getEvent).toHaveBeenCalledWith('event-career');
  });
});
