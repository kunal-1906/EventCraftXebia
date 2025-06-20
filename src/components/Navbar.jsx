import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';

const Navbar = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'organizer':
        return '/organizer/dashboard';
      case 'attendee':
      default:
        return '/attendee/dashboard';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-white">EventCraft</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="text-gray-100 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {user && (
                <Link to={getDashboardLink()} className="text-gray-100 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            {!user ? (
              <div className="flex space-x-4">
                <Link to="/login" className="text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-blue-600 bg-white hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">Hi, {user.name}</span>
                <Link to="/profile" className="text-gray-100 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Home
          </Link>
          {user && (
            <Link to={getDashboardLink()} className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-blue-800">
          {!user ? (
            <div className="flex flex-col space-y-2 px-2">
              <Link to="/login" className="text-white bg-blue-600 hover:bg-blue-500 block px-3 py-2 rounded-md text-base font-medium text-center">
                Login
              </Link>
              <Link to="/register" className="text-blue-600 bg-white hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium text-center">
                Register
              </Link>
            </div>
          ) : (
            <div className="px-2 space-y-2">
              <div className="text-white font-medium px-3">Hi, {user.name}</div>
              <Link to="/profile" className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 hover:bg-red-500 w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
