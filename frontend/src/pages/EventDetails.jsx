import React from 'react';
import { useParams } from 'react-router-dom';

const mockEvent = {
  id: 'ev123',
  title: 'Tech Innovators Conference 2025',
  date: '2025-08-10',
  time: '10:00 AM',
  location: 'Convention Center, New Delhi',
  description: 'A premier event for showcasing innovations in AI, IoT, and cloud computing.',
  banner: 'https://source.unsplash.com/1200x400/?conference,technology',
};

const EventDetails = () => {
  const { id } = useParams(); 

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow overflow-hidden">
        <img
          src={mockEvent.banner}
          alt={mockEvent.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">{mockEvent.title}</h1>
          <p className="text-gray-600 mb-4">
            📅 {mockEvent.date} at 🕒 {mockEvent.time}
          </p>
          <p className="text-gray-700 font-medium mb-2">📍 {mockEvent.location}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{mockEvent.description}</p>

          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

