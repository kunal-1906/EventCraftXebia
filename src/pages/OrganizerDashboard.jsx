import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotification } from '../components/NotificationContext';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState('events');

  // Mock data for dashboard
  const mockStats = {
    totalEvents: 5,
    upcoming: 2,
    past: 3,
    totalAttendees: 425,
    revenue: '₹84,500',
    pendingRequests: 3
  };

  const upcomingEvents = [
    {
      id: '1',
      title: 'Tech Conference 2025',
      date: '2025-08-15',
      time: '9:00 AM - 5:00 PM',
      location: 'Bangalore Tech Center',
      attendees: 120,
      capacity: 150,
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: '2',
      title: 'Product Management Workshop',
      date: '2025-09-22',
      time: '10:00 AM - 3:00 PM',
      location: 'Mumbai Innovation Hub',
      attendees: 45,
      capacity: 50,
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  const pastEvents = [
    {
      id: '3',
      title: 'Design Thinking Bootcamp',
      date: '2025-05-10',
      time: '9:00 AM - 4:00 PM',
      location: 'Delhi Design School',
      attendees: 85,
      capacity: 100,
      revenue: '₹42,500',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: '4',
      title: 'AI for Business Summit',
      date: '2025-04-18',
      time: '10:00 AM - 5:00 PM',
      location: 'Hyderabad Convention Center',
      attendees: 210,
      capacity: 200,
      revenue: '₹105,000',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  const draftEvents = [
    {
      id: '5',
      title: 'Future of Web Development',
      lastEdited: '2025-06-12',
      status: 'Draft',
      completeness: 75,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  const pendingRequests = [
    {
      id: '6',
      title: 'Sponsorship Request - Tech Conference',
      from: 'TechCorp',
      date: '2025-07-01',
      type: 'Sponsorship',
      amount: '₹25,000'
    },
    {
      id: '7',
      title: 'Speaker Application - John Smith',
      from: 'John Smith',
      date: '2025-07-03',
      type: 'Speaker',
      topic: 'Blockchain Applications'
    },
    {
      id: '8',
      title: 'Vendor Application - FoodTruck Co.',
      from: 'FoodTruck Co.',
      date: '2025-07-05',
      type: 'Vendor',
      category: 'Food & Beverage'
    }
  ];

  const handleAction = (action, id) => {
    success(`Action "${action}" performed successfully`, { duration: 3000 });
  };

  const renderTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex -mb-px">
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'events' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('events')}
        >
          My Events
        </button>
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'drafts' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('drafts')}
        >
          Draft Events
        </button>
        <button 
          className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ${
            activeTab === 'requests' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Pending Requests
          {mockStats.pendingRequests > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {mockStats.pendingRequests}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderEventCard = (event, isPast = false) => (
    <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:translate-y-[-4px]">
      <div className="relative h-48 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            event.status === 'Published' 
              ? 'bg-green-100 text-green-800'
              : event.status === 'Draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {event.status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
        
        {event.date && (
          <div className="text-sm text-gray-600 mb-3">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {event.date}
            </div>
            
            {event.time && (
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {event.time}
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {event.location}
              </div>
            )}
            
            {event.attendees && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {event.attendees} / {event.capacity} attendees
              </div>
            )}
            
            {event.revenue && (
              <div className="mt-2 flex items-center text-green-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Revenue: {event.revenue}
              </div>
            )}
          </div>
        )}
        
        {event.completeness !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Completion</span>
              <span className="text-sm font-medium text-gray-900">{event.completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${event.completeness}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Last edited: {event.lastEdited}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/organizer/edit-event/${event.id}`} className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
            {event.status === 'Draft' ? 'Continue Editing' : 'Edit Event'}
          </Link>
          
          {event.status === 'Published' && !isPast && (
            <button 
              onClick={() => handleAction('view-attendees', event.id)} 
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              Attendees
            </button>
          )}
          
          {isPast && (
            <button 
              onClick={() => handleAction('view-analytics', event.id)} 
              className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
            >
              Analytics
            </button>
          )}
          
          {event.status === 'Draft' && (
            <button 
              onClick={() => handleAction('publish', event.id)} 
              className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderRequestCard = (request) => (
    <div key={request.id} className="bg-white rounded-lg shadow-md overflow-hidden p-4 transition-transform duration-300 hover:shadow-lg">
      <div className="flex justify-between">
        <div>
          <h3 className="text-md font-medium text-gray-900">{request.title}</h3>
          <p className="text-sm text-gray-500">From: {request.from}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {request.date}
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {request.type}
            </span>
            {request.amount && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {request.amount}
              </span>
            )}
            {request.topic && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {request.topic}
              </span>
            )}
            {request.category && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {request.category}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => handleAction('approve', request.id)} 
          className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
        >
          Approve
        </button>
        <button 
          onClick={() => handleAction('reject', request.id)} 
          className="flex-1 text-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
        >
          Reject
        </button>
        <button 
          onClick={() => handleAction('view-details', request.id)} 
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300"
        >
          Details
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
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Organizer'}</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your events and organization</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link to="/organizer/create-event" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Event
              </Link>
              <Link to="/organizer/vendors" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manage Vendors
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Events</h2>
                <p className="text-2xl font-semibold text-gray-900">{mockStats.totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Upcoming Events</h2>
                <p className="text-2xl font-semibold text-gray-900">{mockStats.upcoming}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Attendees</h2>
                <p className="text-2xl font-semibold text-gray-900">{mockStats.totalAttendees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Revenue</h2>
                <p className="text-2xl font-semibold text-gray-900">{mockStats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'events' && (
            <>
              {upcomingEvents.map(event => renderEventCard(event))}
              {pastEvents.map(event => renderEventCard(event, true))}
            </>
          )}

          {activeTab === 'drafts' && draftEvents.map(event => renderEventCard(event))}
          
          {activeTab === 'requests' && pendingRequests.map(request => renderRequestCard(request))}
        </div>

        {/* Empty State */}
        {activeTab === 'events' && upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
            <div className="mt-6">
              <Link to="/organizer/create-event" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Create Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
