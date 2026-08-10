import { apiRequest } from './apiClient.js';

export function getEvents() {
  return apiRequest('event', '/api/events');
}

export function getEvent(id) {
  return apiRequest('event', `/api/events/${id}`);
}

export function createEvent(token, payload) {
  return apiRequest('event', '/api/events', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateEvent(token, id, payload) {
  return apiRequest('event', `/api/events/${id}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function deleteEvent(token, id) {
  return apiRequest('event', `/api/events/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function uploadEventImage(token, file) {
  const formData = new FormData();
  formData.append('image', file);

  return apiRequest('event', '/api/events/upload-image', {
    method: 'POST',
    token,
    body: formData,
  });
}
