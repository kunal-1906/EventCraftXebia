import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotification } from '../components/NotificationContext';
import ticketService from '../services/ticketService';
import calendarService from '../services/calendarService';

const TicketDetail = () => {
  const { eventId, ticketId } = useParams();
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  
  // Mock event data (in a real app, this would come from an API)
  const mockEvents = [
    {
      id: 'e001',
      title: 'Tech Conference 2024',
      description: 'Annual tech conference with industry leaders',
      date: '2024-11-15T09:00:00',
      endDate: '2024-11-17T18:00:00',
      location: 'Convention Center, New York',
      price: 299.99,
      organizer: 'u002',
      status: 'approved',
      capacity: 500,
      attendees: ['u001'],
      categories: ['technology', 'networking'],
      image: 'https://picsum.photos/800/400',
    },
    {
      id: 'e002',
      title: 'Music Festival',
      description: 'Three-day music festival featuring top artists',
      date: '2024-08-20T14:00:00',
      endDate: '2024-08-22T23:00:00',
      location: 'Central Park, New York',
      price: 150,
      organizer: 'u002',
      status: 'approved',
      capacity: 10000,
      attendees: [],
      categories: ['music', 'entertainment'],
      image: 'https://picsum.photos/800/401',
    }
  ];
  
  // Load ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch ticket data
        const ticketResponse = await ticketService.getTicket(ticketId);
        setTicket(ticketResponse.data);
        
        // In a real app, fetch event data
        // const eventResponse = await eventService.getEvent(eventId);
        const eventData = mockEvents.find(e => e.id === eventId);
        
        if (!eventData) {
          throw new Error('Event not found');
        }
        
        setEvent(eventData);
        
        // Fetch QR code
        if (ticketResponse.data.status === 'confirmed') {
          const qrResponse = await ticketService.generateTicketQR(ticketId);
          setQrCode(qrResponse.data);
        }
      } catch (err) {
        showError(err.message || 'Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketDetails();
  }, [ticketId, eventId, showError]);
  
  // Handle adding to calendar
  const handleAddToCalendar = async () => {
    try {
      const response = await calendarService.addToCalendar(eventId);
      
      // Create a download link for the ICS file
      const element = document.createElement('a');
      const file = new Blob([response.data.icsFile], {type: 'text/calendar'});
      element.href = URL.createObjectURL(file);
      element.download = `${event.title.replace(/\s+/g, '-')}.ics`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      success('Event added to calendar');
    } catch (err) {
      showError(err.message || 'Failed to add event to calendar');
    }
  };
  
  // Handle ticket cancellation
  const handleCancelTicket = async () => {
    if (!window.confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
      return;
    }
    
    try {
      await ticketService.cancelTicket(ticketId);
      
      // Update ticket status locally
      setTicket(prev => ({
        ...prev,
        status: 'canceled'
      }));
      
      success('Ticket canceled successfully');
    } catch (err) {
      showError(err.message || 'Failed to cancel ticket');
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Handle sharing ticket
  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${event.title}`,
        text: `Check out my ticket for ${event.title}!`,
        url: window.location.href
      }).catch((error) => {
        showError('Error sharing ticket');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      success('Ticket link copied to clipboard');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="bg-white w-full max-w-xl p-6 rounded shadow text-center">
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }
  
  // No ticket found
  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="bg-white w-full max-w-xl p-6 rounded shadow text-center">
          <p className="text-red-500">Ticket not found</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleBack}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-xl rounded-lg shadow overflow-hidden">
        {/* Event Banner */}
        <div className="relative">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm opacity-90">
              {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        
        {/* Ticket Status */}
        <div className={`px-4 py-2 text-sm font-medium text-center text-white ${
          ticket.status === 'confirmed' 
            ? 'bg-green-600' 
            : ticket.status === 'used' 
              ? 'bg-gray-600' 
              : 'bg-red-600'
        }`}>
          {ticket.status === 'confirmed' 
            ? 'Valid Ticket' 
            : ticket.status === 'used' 
              ? 'This ticket has been used' 
              : 'This ticket has been canceled'}
        </div>
        
        {/* Ticket Content */}
        <div className="p-6">
          {/* QR Code (if ticket is valid) */}
          {ticket.status === 'confirmed' && qrCode && (
            <div className="flex flex-col items-center mb-6">
              <img 
                src={qrCode.qrCodeUrl} 
                alt="Ticket QR Code" 
                className="w-48 h-48"
              />
              <p className="mt-2 text-sm text-gray-500">Ticket #{ticket.ticketNumber}</p>
            </div>
          )}
          
          {/* Ticket Info */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">Ticket Information</h2>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="text-gray-500">Ticket Type</div>
                <div className="text-gray-900">{ticket.ticketType}</div>
                
                <div className="text-gray-500">Price</div>
                <div className="text-gray-900">${ticket.price.toFixed(2)}</div>
                
                <div className="text-gray-500">Purchase Date</div>
                <div className="text-gray-900">{new Date(ticket.purchaseDate).toLocaleDateString()}</div>
                
                <div className="text-gray-500">Status</div>
                <div className={`${
                  ticket.status === 'confirmed' 
                    ? 'text-green-600' 
                    : ticket.status === 'used' 
                      ? 'text-gray-600' 
                      : 'text-red-600'
                } font-medium`}>
                  {ticket.status === 'confirmed' 
                    ? 'Active' 
                    : ticket.status === 'used' 
                      ? 'Used' 
                      : 'Canceled'}
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">Event Information</h2>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Date & Time: </span>
                  <span className="text-gray-900">
                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500">Location: </span>
                  <span className="text-gray-900">{event.location}</span>
                </div>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">Attendee Information</h2>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name: </span>
                  <span className="text-gray-900">{user.name}</span>
                </div>
                
                <div>
                  <span className="text-gray-500">Email: </span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 space-y-3">
            {ticket.status === 'confirmed' && (
              <>
                <button
                  onClick={handleAddToCalendar}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Add to Calendar
                </button>
                
                <button
                  onClick={handleShareTicket}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  Share Ticket
                </button>
                
                <button
                  onClick={handleCancelTicket}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel Ticket
                </button>
              </>
            )}
            
            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;