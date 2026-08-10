const phaseMessage =
  'Event Service route is available, but database persistence and Azure Blob Storage integration will be implemented in a later phase.';

export const plannedEventFields = [
  'id',
  'title',
  'description',
  'category',
  'location',
  'startDate',
  'endDate',
  'capacity',
  'imageUrl',
  'createdAt',
  'updatedAt',
];

export function getEventsPlaceholder(query = {}) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'GET /api/events',
    plannedFields: plannedEventFields,
    receivedQuery: query,
  };
}

export function getEventByIdPlaceholder(id) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'GET /api/events/:id',
    id,
    plannedFields: plannedEventFields,
  };
}

export function createEventPlaceholder(payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'POST /api/events',
    plannedFields: plannedEventFields,
    receivedFields: Object.keys(payload || {}),
  };
}

export function updateEventPlaceholder(id, payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'PUT /api/events/:id',
    id,
    plannedFields: plannedEventFields,
    receivedFields: Object.keys(payload || {}),
  };
}

export function deleteEventPlaceholder(id) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'DELETE /api/events/:id',
    id,
  };
}

