import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Unauthorized = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  
  // Determine where to redirect the user based on their role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'organizer':
        return '/organizer/dashboard';
      case 'attendee':
        return '/attendee/dashboard';
      default:
        return '/';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area requires different privileges than your current role.
        </p>
        
        <div className="space-y-4">
          {user ? (
            <>
              <button 
                onClick={() => navigate(-1)} 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition"
              >
                Go Back
              </button>
              <Link 
                to={getDashboardLink()} 
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Go to Your Dashboard
              </Link>
              <Link 
                to="/" 
                className="block w-full text-indigo-600 hover:text-indigo-500 py-2 transition"
              >
                Return to Home
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block w-full bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
