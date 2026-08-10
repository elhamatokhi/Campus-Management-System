const serviceUrls = {
  user: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4001',
  event: import.meta.env.VITE_EVENT_SERVICE_URL || 'http://localhost:4002',
  booking: import.meta.env.VITE_BOOKING_SERVICE_URL || 'http://localhost:4003',
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(service, path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${serviceUrls[service]}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', response.status, data);
  }

  return data;
}

