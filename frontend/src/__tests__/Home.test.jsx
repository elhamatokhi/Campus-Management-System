import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBookings } from '../api/bookingApi.js';
import { getEvents } from '../api/eventApi.js';
import { getProfile } from '../api/userApi.js';
import { adminUser, mockEvents, studentUser } from '../test/mockData.js';
import { renderApp } from '../test/renderApp.jsx';

vi.mock('../api/eventApi.js', () => ({
  getEvents: vi.fn(),
}));

vi.mock('../api/bookingApi.js', () => ({
  getBookings: vi.fn(),
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

describe('Home page role-aware behavior', () => {
  beforeEach(() => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });
    getBookings.mockResolvedValue({ success: true, data: [] });
    mockStoredProfile();
  });

  it('shows guest actions and student discovery sections', async () => {
    renderApp();

    expect(screen.getByRole('link', { name: /browse events/i })).toHaveAttribute('href', '/events');
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: /my bookings/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();

    expect(await screen.findByText('Research Methods Workshop')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /events from across our campus community/i })).toBeInTheDocument();
    expect(screen.getAllByText('HTW Berlin').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /upcoming events/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /explore by interest/i })).toBeInTheDocument();
  });

  it('shows student actions without account creation or admin links', async () => {
    renderApp({ user: studentUser });

    expect(screen.getByRole('link', { name: /browse events/i })).toHaveAttribute('href', '/events');
    expect(screen.getAllByRole('link', { name: /my bookings/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /create account/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /admin dashboard/i })).not.toBeInTheDocument();

    expect(await screen.findByText('Research Methods Workshop')).toBeInTheDocument();
  });

  it('shows an admin command center instead of student discovery content', async () => {
    renderApp({ user: adminUser });

    expect(screen.getByText(/welcome back, avery admin/i)).toBeInTheDocument();
    expect(screen.getByText(/administrator/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create event/i })).toHaveAttribute('href', '/admin/events/new');
    expect(screen.getAllByRole('link', { name: /admin dashboard/i })[0]).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /public events/i })).toHaveAttribute('href', '/events');

    expect(screen.queryByRole('heading', { name: /events from across our campus community/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /explore by interest/i })).not.toBeInTheDocument();

    expect(await screen.findByText(/events this week/i)).toBeInTheDocument();
  });

  it('navigates from Explore by interest to Events with the category selected', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: /academic & learning/i }));

    expect(await screen.findByRole('heading', { name: /find your next campus activity/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toHaveValue('Academic');
    });
    expect(screen.getByText('Research Methods Workshop')).toBeInTheDocument();
    expect(screen.queryByText('Career Networking Night')).not.toBeInTheDocument();
  });
});
