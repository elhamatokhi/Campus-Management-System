import {
  createEventPlaceholder,
  deleteEventPlaceholder,
  getEventByIdPlaceholder,
  getEventsPlaceholder,
  updateEventPlaceholder,
} from '../services/eventService.js';

export function getEvents(request, response) {
  const result = getEventsPlaceholder(request.query);
  response.status(501).json(result);
}

export function getEventById(request, response) {
  const result = getEventByIdPlaceholder(request.params.id);
  response.status(501).json(result);
}

export function createEvent(request, response) {
  const result = createEventPlaceholder(request.body);
  response.status(501).json(result);
}

export function updateEvent(request, response) {
  const result = updateEventPlaceholder(request.params.id, request.body);
  response.status(501).json(result);
}

export function deleteEvent(request, response) {
  const result = deleteEventPlaceholder(request.params.id);
  response.status(501).json(result);
}

