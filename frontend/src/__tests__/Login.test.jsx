import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBookings } from '../api/bookingApi.js';
import { getEvents } from '../api/eventApi.js';
import { getProfile, loginUser } from '../api/userApi.js';
import { adminUser, mockEvents, studentUser } from '../test/mockData.js';
import { renderApp } from '../test/renderApp.jsx';

vi.mock('../api/eventApi.js', () => ({
  getEvent: vi.fn(),
  getEvents: vi.fn(),
}));

vi.mock('../api/bookingApi.js', () => ({
  cancelBooking: vi.fn(),
  createBooking: vi.fn(),
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

async function submitLogin() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/email address/i), 'person@campus.test');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /login/i }));
}

describe('Login redirects', () => {
  beforeEach(() => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });
    getBookings.mockResolvedValue({ success: true, data: [] });
    mockStoredProfile();
  });

  it('redirects admin users to the role-specific homepage after login', async () => {
    loginUser.mockResolvedValue({ success: true, data: { token: 'admin-token', user: adminUser } });

    renderApp({ route: '/login' });
    await submitLogin();

    expect(await screen.findByText(/welcome back, avery admin/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /admin dashboard/i }).length).toBeGreaterThan(0);
  });

  it('keeps the existing student login redirect to Events', async () => {
    loginUser.mockResolvedValue({ success: true, data: { token: 'student-token', user: studentUser } });

    renderApp({ route: '/login' });
    await submitLogin();

    expect(await screen.findByRole('heading', { name: /find your next campus activity/i })).toBeInTheDocument();
  });
});
