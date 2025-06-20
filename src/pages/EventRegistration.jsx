import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockEvent = {
  id: 'ev123',
  title: 'Tech Innovators Conference 2025',
  date: '2025-08-10',
  time: '10:00 AM',
  location: 'Convention Center, New Delhi',
  price: 199,
};

const EventRegistration = () => {
  const [tickets, setTickets] = useState(1);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
   
    setRegistered(true);

    setTimeout(() => {
      navigate('/dashboard'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-xl p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">{mockEvent.title}</h2>
        <p className="text-gray-600 mb-4">
          📅 {mockEvent.date} at 🕒 {mockEvent.time} • 📍 {mockEvent.location}
        </p>

        {!registered ? (
          <form onSubmit={handleRegister}>
            <label className="block mb-4">
              <span className="text-gray-700">Number of Tickets</span>
              <input
                type="number"
                min={1}
                value={tickets}
                onChange={(e) => setTickets(parseInt(e.target.value))}
                className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <p className="text-md mb-4">
              💰 Total: <strong>₹{tickets * mockEvent.price}</strong>
            </p>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Confirm Registration
            </button>
          </form>
        ) : (
          <div className="text-center text-green-600 font-medium">
             You are successfully registered! Redirecting to dashboard...
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
