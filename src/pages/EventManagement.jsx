import React from 'react';
import { useNavigate } from 'react-router-dom';

const mockEvents = [
  {
    id: 'ev001',
    title: 'Startup Meetup 2025',
    date: '2025-07-05',
    attendees: 84,
    status: 'Upcoming',
  },
  {
    id: 'ev002',
    title: 'Cloud Conference',
    date: '2025-06-10',
    attendees: 132,
    status: 'Past',
  },
];

const ManageEvents = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">🛠 Manage My Events</h2>

        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white p-5 mb-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-500 text-sm">
                📅 {event.date} • 👥 {event.attendees} Attendees • 🟢 {event.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-gray-100 px-4 py-1 text-sm rounded hover:bg-gray-200"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                View Details
              </button>
              <button
                className="bg-gray-100 px-4 py-1 text-sm rounded hover:bg-gray-200"
                onClick={() => navigate(`/edit-event/${event.id}`)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-1 text-sm rounded hover:bg-red-600"
                onClick={() => alert('Delete functionality coming soon')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {mockEvents.length === 0 && (
          <p className="text-gray-600">You haven't created any events yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
