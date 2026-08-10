import {
  createEventRecord,
  deleteEventRecord,
  getEventByIdRecord,
  getEventRecords,
  updateEventRecord,
} from '../services/eventService.js';
import { uploadEventImage } from '../services/blobStorageService.js';

export async function getEvents(request, response) {
  const events = await getEventRecords(request.query);
  response.status(200).json({ success: true, data: events });
}

export async function getEventById(request, response) {
  const event = await getEventByIdRecord(request.params.id);
  response.status(200).json({ success: true, data: event });
}

export async function createEvent(request, response) {
  const event = await createEventRecord(request.body);
  response.status(201).json({ success: true, data: event });
}

export async function updateEvent(request, response) {
  const event = await updateEventRecord(request.params.id, request.body);
  response.status(200).json({ success: true, data: event });
}

export async function deleteEvent(request, response) {
  await deleteEventRecord(request.params.id);
  response.status(200).json({ success: true, message: 'Event deleted' });
}

export async function uploadImage(request, response) {
  const result = await uploadEventImage(request.file);
  response.status(201).json({ success: true, data: result });
}
