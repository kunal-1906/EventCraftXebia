import React from 'react';

const mockEvents = [
  {
    id: '1',
    title: 'Startup Meetup 2025',
    date: '2025-07-05',
    location: 'Bangalore',
  },
  {
    id: '2',
    title: 'AI & Ethics Panel',
    date: '2025-08-12',
    location: 'Hyderabad',
  },
  {
    id: '3',
    title: 'Cloud Conference',
    date: '2025-09-20',
    location: 'Pune',
  },
];

const CalendarView = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">📆 My Event Calendar</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white p-4 rounded shadow border-l-4 border-blue-600"
            >
              <h3 className="text-lg font-semibold text-blue-800">{event.title}</h3>
              <p className="text-sm text-gray-600">
                📅 {event.date} <br /> 📍 {event.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
