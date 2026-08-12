export const mockEvents = [
  {
    id: 'event-academic',
    title: 'Research Methods Workshop',
    description: 'Learn practical research techniques with faculty mentors.',
    category: 'Academic',
    location: 'Library Lab',
    startDate: '2099-08-18T10:00:00.000Z',
    endDate: '2099-08-18T12:00:00.000Z',
    capacity: 30,
    imageUrl: '',
    _count: { bookings: 12 },
  },
  {
    id: 'event-career',
    title: 'Career Networking Night',
    description: 'Meet alumni and employers from regional companies.',
    category: 'Career',
    location: 'Main Hall',
    startDate: '2099-08-20T17:00:00.000Z',
    endDate: '2099-08-20T19:00:00.000Z',
    capacity: 80,
    imageUrl: '',
    _count: { bookings: 40 },
  },
  {
    id: 'event-culture',
    title: 'International Culture Meetup',
    description: 'Student-led exchange evening with music and food.',
    category: 'Culture',
    location: 'Student Center',
    startDate: '2099-08-22T16:00:00.000Z',
    endDate: '2099-08-22T18:00:00.000Z',
    capacity: 50,
    imageUrl: '',
    _count: { bookings: 49 },
  },
];

export const studentUser = {
  id: 'student-1',
  name: 'Alex Student',
  email: 'alex.student@campus.test',
  role: 'STUDENT',
};

export const adminUser = {
  id: 'admin-1',
  name: 'Avery Admin',
  email: 'avery.admin@campus.test',
  role: 'ADMIN',
};
