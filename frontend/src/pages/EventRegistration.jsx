import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotification } from '../components/NotificationContext';
import ticketService from '../services/ticketService';
import paymentService from '../services/paymentService';
import calendarService from '../services/calendarService';

const EventRegistration = () => {
  const { eventId } = useParams();
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [paymentStep, setPaymentStep] = useState(1); // 1: select tickets, 2: payment, 3: confirmation
  
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
  
  // Load event and ticket types
  useEffect(() => {
    const fetchEventAndTickets = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch from the API
        // const eventResponse = await eventService.getEvent(eventId);
        const event = mockEvents.find(e => e.id === eventId);
        
        if (!event) {
          showError('Event not found');
          navigate('/attendee/dashboard');
          return;
        }
        
        setEvent(event);
        
        // Fetch ticket types
        const ticketTypesResponse = await ticketService.getTicketTypes(eventId);
        
        if (ticketTypesResponse.data.length === 0) {
          showError('No tickets available for this event');
          return;
        }
        
        setTicketTypes(ticketTypesResponse.data);
        setSelectedTicketType(ticketTypesResponse.data[0].id);
      } catch (err) {
        showError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndTickets();
  }, [eventId, navigate, showError]);
  
  // Get selected ticket type details
  const getSelectedTicketTypeDetails = () => {
    return ticketTypes.find(tt => tt.id === selectedTicketType) || null;
  };
  
  // Calculate total price
  const calculateTotal = () => {
    const ticketType = getSelectedTicketTypeDetails();
    return ticketType ? ticketType.price * quantity : 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (paymentStep === 1) {
      // Validate ticket selection
      if (!selectedTicketType) {
        showError('Please select a ticket type');
        return;
      }
      
      if (quantity < 1) {
        showError('Please select at least one ticket');
        return;
      }
      
      const ticketType = getSelectedTicketTypeDetails();
      if (quantity > (ticketType.available - ticketType.sold)) {
        showError(`Only ${ticketType.available - ticketType.sold} tickets available`);
        return;
      }
      
      setPaymentStep(2);
    }
  };
  
  // Handle payment and ticket purchase
  const handlePurchase = async (e) => {
    e.preventDefault();
    
    try {
      setProcessing(true);
      
      // Process payment
      const paymentResponse = await paymentService.processPayment({
        amount: calculateTotal(),
        currency: 'USD',
        description: `Tickets for ${event.title}`,
        paymentMethod: 'card'
      });
      
      if (!paymentResponse.data.success) {
        throw new Error('Payment processing failed');
      }
      
      // Purchase tickets
      const ticketResponse = await ticketService.purchaseTickets(
        eventId,
        selectedTicketType,
        quantity
      );
      
      setPurchasedTickets(ticketResponse.data.tickets);
      
      // Add to calendar if selected
      if (addToCalendar) {
        try {
          await calendarService.addToCalendar(eventId);
        } catch (calendarErr) {
          // Don't fail the purchase if calendar fails
          console.error('Failed to add to calendar:', calendarErr);
        }
      }
      
      success('Tickets purchased successfully!');
      setPurchaseComplete(true);
      setPaymentStep(3);
    } catch (err) {
      showError(err.message || 'Failed to complete purchase');
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate('/attendee/dashboard');
  };
  
  // View ticket details
  const handleViewTicket = (ticketId) => {
    navigate(`/event/${eventId}/ticket/${ticketId}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="bg-white w-full max-w-xl p-6 rounded shadow text-center">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }
  
  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="bg-white w-full max-w-xl p-6 rounded shadow text-center">
          <p className="text-red-500">Event not found</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/attendee/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">{event.title}</h2>
        <p className="text-gray-600 mb-4">
          📅 {new Date(event.date).toLocaleDateString()} at 🕒 {new Date(event.date).toLocaleTimeString()} 
          • 📍 {event.location}
        </p>
        
        {/* Step 1: Select Tickets */}
        {paymentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Tickets</h3>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Ticket Type</label>
              <div className="space-y-3">
                {ticketTypes.map(ticketType => (
                  <div 
                    key={ticketType.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTicketType === ticketType.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTicketType(ticketType.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{ticketType.name}</h4>
                        <p className="text-sm text-gray-600">{ticketType.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {ticketType.available - ticketType.sold} remaining
                        </div>
                      </div>
                      <div className="text-lg font-bold">${ticketType.price.toFixed(2)}</div>
                    </div>
                    
                    {selectedTicketType === ticketType.id && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Includes:</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {ticketType.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={getSelectedTicketTypeDetails() ? getSelectedTicketTypeDetails().available - getSelectedTicketTypeDetails().sold : 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-lg">
                <span>Total:</span>
                <span className="font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleNextStep}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              disabled={!selectedTicketType}
            >
              Continue to Payment
            </button>
          </div>
        )}
        
        {/* Step 2: Payment */}
        {paymentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
            
            <form onSubmit={handlePurchase}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  // In a real app, you would use a proper credit card input with validation
                  maxLength={19}
                  defaultValue="4111 1111 1111 1111"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={5}
                    defaultValue="12/25"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={3}
                    defaultValue="123"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={user ? user.name : ''}
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addToCalendar}
                    onChange={(e) => setAddToCalendar(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Add to my calendar</span>
                </label>
              </div>
              
              <div className="mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-lg mb-2">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg mb-2">
                    <span>Processing Fee:</span>
                    <span>${(calculateTotal() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>${(calculateTotal() * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setPaymentStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
                  disabled={processing}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Complete Purchase'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 3: Confirmation */}
        {paymentStep === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Purchase Complete!</h3>
              <p className="text-gray-600">Your tickets have been sent to your email address.</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Your Tickets:</h4>
              <div className="space-y-3">
                {purchasedTickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{event.title}</h5>
                        <p className="text-sm text-gray-600">{ticket.ticketType} - Ticket #{ticket.ticketNumber}</p>
                      </div>
                      <button
                        onClick={() => handleViewTicket(ticket.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
