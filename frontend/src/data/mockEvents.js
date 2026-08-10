export const eventCategories = ['All', 'Academic', 'Career', 'Culture', 'Sports', 'Wellbeing'];

export const events = [
  {
    id: 'ai-research-showcase',
    title: 'AI Research Showcase',
    category: 'Academic',
    description:
      'Meet student researchers and faculty teams presenting practical AI projects in healthcare, education, and campus operations.',
    longDescription:
      'The AI Research Showcase brings together final-year students, postgraduate researchers, and faculty mentors for an evening of demos and short talks. Attendees can explore applied machine learning projects, ask questions, and learn how research ideas become useful products.',
    date: '2026-09-12',
    time: '16:00',
    endTime: '18:30',
    location: 'Innovation Hall, Room 204',
    capacity: 120,
    booked: 78,
    imageUrl:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'graduate-career-fair',
    title: 'Graduate Career Fair',
    category: 'Career',
    description:
      'Connect with employers offering internships, graduate schemes, and cloud technology roles.',
    longDescription:
      'Students can meet recruiters from technology, finance, public sector, and startup employers. Bring a CV, prepare a short introduction, and visit the preparation desk for quick feedback before speaking with companies.',
    date: '2026-09-18',
    time: '10:00',
    endTime: '15:00',
    location: 'Main Atrium',
    capacity: 300,
    booked: 214,
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'international-food-night',
    title: 'International Food Night',
    category: 'Culture',
    description:
      'Celebrate campus diversity with student-led food stalls, music, and cultural performances.',
    longDescription:
      'International Food Night is organized with student societies across campus. The evening includes tasting tables, short performances, and a community recipe wall where students can share food stories from home.',
    date: '2026-09-23',
    time: '18:00',
    endTime: '21:00',
    location: 'Student Union Hall',
    capacity: 180,
    booked: 145,
    imageUrl:
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'campus-5k-run',
    title: 'Campus 5K Run',
    category: 'Sports',
    description:
      'A friendly 5K route around campus for runners, walkers, and first-time participants.',
    longDescription:
      'Join the athletics club for a relaxed 5K route with warm-up support, route marshals, and refreshments at the finish. All fitness levels are welcome, and participants can run or walk.',
    date: '2026-10-02',
    time: '08:30',
    endTime: '10:00',
    location: 'Sports Centre Entrance',
    capacity: 220,
    booked: 96,
    imageUrl:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'mindful-study-workshop',
    title: 'Mindful Study Workshop',
    category: 'Wellbeing',
    description:
      'Learn practical techniques for focus, planning, and stress management during busy study periods.',
    longDescription:
      'This workshop introduces simple routines for planning study blocks, managing deadlines, and building recovery time into the week. It is designed for students who want practical habits rather than theory-heavy advice.',
    date: '2026-10-08',
    time: '13:00',
    endTime: '14:30',
    location: 'Library Seminar Room 3',
    capacity: 45,
    booked: 31,
    imageUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'cloud-engineering-lab',
    title: 'Cloud Engineering Lab',
    category: 'Academic',
    description:
      'A guided practical session introducing Docker, Kubernetes, and Azure deployment concepts.',
    longDescription:
      'Students will work through a beginner-friendly cloud lab covering container images, running containers locally, and understanding how Kubernetes schedules services. The session is suitable for anyone preparing a cloud project.',
    date: '2026-10-14',
    time: '15:30',
    endTime: '17:30',
    location: 'Computing Lab B',
    capacity: 60,
    booked: 52,
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
  },
];

export const mockBookings = events.slice(0, 3).map((event, index) => ({
  id: `booking-${index + 1}`,
  event,
  status: index === 2 ? 'Waitlist' : 'Confirmed',
}));

export function getEventById(id) {
  return events.find((event) => event.id === id);
}

export function formatEventDate(date) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export function availablePlaces(event) {
  return Math.max(event.capacity - event.booked, 0);
}

