export const eventCategories = ['All', 'Academic', 'Career', 'Culture', 'Sports', 'Wellbeing'];

export function formatEventDate(value) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatEventTime(value) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function availablePlaces(event) {
  const booked = event._count?.bookings ?? event.bookings?.length ?? 0;
  return Math.max(Number(event.capacity || 0) - booked, 0);
}

export function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function toTimeInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(11, 16);
}

export function buildIsoDateTime(date, time) {
  if (!date || !time) return '';
  return new Date(`${date}T${time}:00`).toISOString();
}

