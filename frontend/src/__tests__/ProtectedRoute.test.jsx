import { screen } from '@testing-library/react';
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

describe('protected route behavior', () => {
  beforeEach(() => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });
    getBookings.mockResolvedValue({ success: true, data: [] });
    mockStoredProfile();
  });

  it('redirects guests from My Bookings to Login', async () => {
    renderApp({ route: '/bookings' });

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('allows an authenticated student to access My Bookings', async () => {
    renderApp({ route: '/bookings', user: studentUser });

    expect(await screen.findByRole('heading', { name: /your upcoming reservations/i })).toBeInTheDocument();
    expect(await screen.findByText(/no bookings yet/i)).toBeInTheDocument();
  });

  it('blocks an authenticated student from admin-only routes', async () => {
    renderApp({ route: '/admin', user: studentUser });

    expect(await screen.findByRole('heading', { name: /unauthorized/i })).toBeInTheDocument();
    expect(screen.getByText(/admin access required/i)).toBeInTheDocument();
  });

  it('allows an authenticated admin to access the Admin Dashboard', async () => {
    renderApp({ route: '/admin', user: adminUser });

    expect(await screen.findByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
    expect(await screen.findByText(/total events/i)).toBeInTheDocument();
  });
});
