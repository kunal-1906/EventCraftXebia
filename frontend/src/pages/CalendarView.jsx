import React, { useState, useEffect } from 'react';
import eventService from '../services/eventService';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Set appropriate role for viewing events
    localStorage.setItem('userRole', 'attendee');
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsResponse = await eventService.getEvents({ 
        status: 'published',
        limit: 100 
      });
      
      const eventsData = Array.isArray(eventsResponse) 
        ? eventsResponse 
        : eventsResponse.events || eventsResponse.data || [];
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter events by selected month and year
  const filteredEvents = events.filter(event => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  });

  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const dateKey = new Date(event.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let d = new Date(startDate); d <= lastDay || days.length < 42; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-blue-700">📆 Event Calendar</h2>
          <button 
            onClick={fetchEvents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              ← Prev
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
            
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-blue-50">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map((day, index) => {
              const dateKey = day.toDateString();
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = day.getMonth() === selectedMonth;
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                  } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                        title={`${event.title} - ${event.location}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Events ({filteredEvents.length})
          </h3>
          
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((event) => (
                  <div
                    key={event._id}
                    className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600 hover:shadow-lg transition-shadow"
                  >
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">
                      {event.title}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</p>
                      <p>📍 {event.location}</p>
                      <p>🎫 {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}</p>
                      {event.category && (
                        <p>🏷️ {event.category}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No events scheduled for {monthNames[selectedMonth]} {selectedYear}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
