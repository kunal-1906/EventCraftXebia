import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-700 mb-4">Welcome to EventCraft</h1>
      <p className="text-lg text-gray-700 max-w-xl mb-8">
        Seamless planning. Flawless execution. Join, create, and manage events effortlessly.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Login</Link>
        <Link to="/register" className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">Sign Up</Link>
        <Link to="/events" className="px-6 py-2 text-blue-600 underline">Explore Events</Link>
      </div>
    </div>
  );
};

export default Landing;
