import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNotification } from '../components/NotificationContext';

const AttendeeDashboard = () => {
  const user = useSelector((state) => state.user.user);
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for dashboard
  const upcomingEvents = [
    {
      id: '1',
      title: 'Startup Meetup 2025',
      date: '2025-07-05',
      time: '10:00 AM - 4:00 PM',
      location: 'Bangalore Convention Center',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rsvp: 'Yes',
      category: 'Business',
      attendees: 127
    },
    {
      id: '2',
      title: 'AI & Ethics Panel Discussion',
      date: '2025-08-12',
      time: '2:00 PM - 5:00 PM',
      location: 'Hyderabad Tech Hub',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rsvp: 'Pending',
      category: 'Technology',
      attendees: 89
    },
    {
      id: '3',
      title: 'Digital Marketing Masterclass',
      date: '2025-09-18',
      time: '9:00 AM - 1:00 PM',
      location: 'Online (Zoom)',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rsvp: 'No',
      category: 'Marketing',
      attendees: 215
    }
  ];

  const pastEvents = [
    {
      id: '4',
      title: 'Blockchain Bootcamp',
      date: '2025-05-10',
      time: '9:00 AM - 6:00 PM',
      location: 'Mumbai Innovation Center',
      image: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rsvp: 'Yes',
      category: 'Technology',
      feedback: 'Not Submitted'
    },
    {
      id: '5',
      title: 'UX Design Workshop',
      date: '2025-04-22',
      time: '10:00 AM - 3:00 PM',
      location: 'Delhi Design School',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rsvp: 'Yes',
      category: 'Design',
      feedback: 'Submitted'
    }
  ];

  const recommendedEvents = [
    {
      id: '6',
      title: 'Web3 Developer Conference',
      date: '2025-10-15',
      time: '9:00 AM - 5:00 PM',
      location: 'Bengaluru Tech Park',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Technology',
      attendees: 350,
      price: '₹2,500'
    },
    {
      id: '7',
      title: 'Green Business Summit',
      date: '2025-11-05',
      time: '10:00 AM - 4:00 PM',
      location: 'Chennai Green Convention',
      image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Business',
      attendees: 210,
      price: '₹1,800'
    }
  ];

  const updateRSVP = (eventId, status) => {
    success(`RSVP updated to ${status}`, { duration: 3000 });
    // In a real app, you would call an API to update the RSVP status
  };

  const submitFeedback = (eventId) => {
    success('Thank you for your feedback!', { duration: 3000 });
    // In a real app, you would navigate to a feedback form
  };

  const registerEvent = (eventId) => {
    success('Registration successful!', { duration: 3000 });
    // In a real app, you would navigate to the registration page
  };

  const renderEventCard = (event, isUpcoming = true, isRecommended = false) => (
    <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:translate-y-[-4px]">
      <div className="relative h-48 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          {isUpcoming && !isRecommended && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              event.rsvp === 'Yes'
                ? 'bg-green-100 text-green-800'
                : event.rsvp === 'No'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.rsvp}
            </span>
          )}
          {isRecommended && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Recommended
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
            {event.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
        <div className="text-sm text-gray-600 mb-3">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {event.date}
          </div>
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {event.time}
          </div>
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {event.location}
          </div>
          {(isUpcoming || isRecommended) && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {event.attendees} attendees
            </div>
          )}
          {isRecommended && (
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              {event.price}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          {isUpcoming && !isRecommended && (
            <div className="flex space-x-2">
              <Link to={`/event/${event.id}`} className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                View Details
              </Link>
              {event.rsvp === 'Pending' && (
                <>
                  <button onClick={() => updateRSVP(event.id, 'Yes')} className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700">
                    Accept
                  </button>
                  <button onClick={() => updateRSVP(event.id, 'No')} className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700">
                    Decline
                  </button>
                </>
              )}
            </div>
          )}
          
          {!isUpcoming && !isRecommended && (
            <div className="flex space-x-2">
              <Link to={`/event/${event.id}`} className="flex-1 text-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700">
                View Details
              </Link>
              {event.feedback === 'Not Submitted' && (
                <button onClick={() => submitFeedback(event.id)} className="px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700">
                  Give Feedback
                </button>
              )}
              <button className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
                Certificate
              </button>
            </div>
          )}
          
          {isRecommended && (
            <button onClick={() => registerEvent(event.id)} className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
              Register Now
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex -mb-px">
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'upcoming' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'past' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'recommended' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('recommended')}
        >
          Recommended For You
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Attendee'}</h1>
              <p className="mt-1 text-sm text-gray-600">Here's what's happening with your events</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link to="/attendee/calendar" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar View
              </Link>
              <Link to="/event/search" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Events
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Upcoming Events</h2>
                <p className="text-2xl font-semibold text-gray-900">{upcomingEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Events Attended</h2>
                <p className="text-2xl font-semibold text-gray-900">{pastEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Recommendations</h2>
                <p className="text-2xl font-semibold text-gray-900">{recommendedEvents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'upcoming' && upcomingEvents.map(event => renderEventCard(event))}
          {activeTab === 'past' && pastEvents.map(event => renderEventCard(event, false))}
          {activeTab === 'recommended' && recommendedEvents.map(event => renderEventCard(event, true, true))}
        </div>

        {/* Empty State */}
        {activeTab === 'upcoming' && upcomingEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming events</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by finding events that interest you.</p>
            <div className="mt-6">
              <Link to="/event/search" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Find Events
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeDashboard;

