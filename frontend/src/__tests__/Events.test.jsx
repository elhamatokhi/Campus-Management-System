import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEvents } from '../api/eventApi.js';
import Events from '../pages/Events.jsx';
import { mockEvents } from '../test/mockData.js';

vi.mock('../api/eventApi.js', () => ({
  getEvents: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current route">{`${location.pathname}${location.search}`}</output>;
}

function renderEvents(route = '/events') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/events"
          element={(
            <>
              <Events />
              <LocationProbe />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Events page', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders event cards after a successful API request', async () => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });

    renderEvents();

    expect(await screen.findByText('Research Methods Workshop')).toBeInTheDocument();
    expect(screen.getByText('Career Networking Night')).toBeInTheDocument();
    expect(screen.getByText('International Culture Meetup')).toBeInTheDocument();
  });

  it('shows a normal empty state when the API returns zero events', async () => {
    getEvents.mockResolvedValue({ success: true, data: [] });

    renderEvents();

    expect(await screen.findByRole('heading', { name: /no events found/i })).toBeInTheDocument();
    expect(screen.getByText(/try changing your search or category filters/i)).toBeInTheDocument();
  });

  it('shows a friendly unavailable state without raw technical errors when the API fails', async () => {
    getEvents.mockRejectedValue(new Error('Failed to fetch'));

    renderEvents();

    expect(await screen.findByText(/events are temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/event service/i)).not.toBeInTheDocument();
  });

  it('reads the category query parameter and filters matching events', async () => {
    getEvents.mockResolvedValue({ success: true, data: mockEvents });

    renderEvents('/events?category=Career');

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toHaveValue('Career');
    });
    expect(screen.getByText('Career Networking Night')).toBeInTheDocument();
    expect(screen.queryByText('Research Methods Workshop')).not.toBeInTheDocument();
  });

  it('updates the URL and visible events when the category is cleared', async () => {
    const user = userEvent.setup();
    getEvents.mockResolvedValue({ success: true, data: mockEvents });

    renderEvents('/events?category=Career');

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toHaveValue('Career');
    });

    await user.selectOptions(screen.getByLabelText(/category/i), 'All');

    expect(screen.getByLabelText(/current route/i)).toHaveTextContent('/events');
    expect(screen.getByText('Career Networking Night')).toBeInTheDocument();
    expect(screen.getByText('Research Methods Workshop')).toBeInTheDocument();
  });
});
