import React from 'react';

const mockFeedback = [
  {
    id: 1,
    type: 'Report',
    user: 'ankita@email.com',
    message: 'Inappropriate content in AI Summit event.',
    date: '2025-06-15',
  },
  {
    id: 2,
    type: 'Feedback',
    user: 'raj@organize.com',
    message: 'Great platform, but ticket editing needs improvement.',
    date: '2025-06-17',
  },
  {
    id: 3,
    type: 'Report',
    user: 'sanjay@attend.in',
    message: 'Spam event link in Web3 Workshop.',
    date: '2025-06-18',
  },
];

const ReportsFeedback = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">📝 Reports & Feedback</h2>

        {mockFeedback.length === 0 ? (
          <p className="text-gray-500">No feedback or reports submitted yet.</p>
        ) : (
          <ul className="space-y-4">
            {mockFeedback.map((item) => (
              <li
                key={item.id}
                className="bg-white p-4 rounded shadow flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">
                    {item.type === 'Report' ? '🚨 Report' : '💬 Feedback'}
                  </p>
                  <p className="text-sm text-gray-600">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    From: {item.user} • 📅 {item.date}
                  </p>
                </div>
                {item.type === 'Report' && (
                  <button
                    onClick={() => alert('Marked as Resolved')}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReportsFeedback;

