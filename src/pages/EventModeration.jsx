import React, { useState } from 'react';

const mockPendingEvents = [
  {
    id: 'e101',
    title: 'AI Ethics Summit',
    organizer: 'Neha Joshi',
    date: '2025-08-12',
    status: 'Pending',
  },
  {
    id: 'e102',
    title: 'Web3 & Blockchain Conf',
    organizer: 'Rahul Dev',
    date: '2025-09-01',
    status: 'Flagged',
  },
];

const EventModeration = () => {
  const [events, setEvents] = useState(mockPendingEvents);

  const updateStatus = (id, newStatus) => {
    const updated = events.map((event) =>
      event.id === id ? { ...event, status: newStatus } : event
    );
    setEvents(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">🧐 Event Moderation</h2>

        {events.length === 0 ? (
          <p className="text-gray-600">No events pending moderation.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-5 rounded shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p className="text-gray-500 text-sm">
                    By {event.organizer} • 📅 {event.date} • 🏷 Status:{" "}
                    <span
                      className={`font-medium ${
                        event.status === 'Pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {event.status}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="bg-green-500 text-white px-4 py-1 text-sm rounded hover:bg-green-600"
                    onClick={() => updateStatus(event.id, 'Approved')}
                  >
                    Approve ✅
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-1 text-sm rounded hover:bg-red-600"
                    onClick={() => updateStatus(event.id, 'Rejected')}
                  >
                    Reject ❌
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-1 text-sm rounded hover:bg-yellow-600"
                    onClick={() => updateStatus(event.id, 'Flagged')}
                  >
                    Flag ⚠️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModeration;
