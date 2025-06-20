import React, { useState } from 'react';

const CreateEvent = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    schedule: '',
    image: '',
    tickets: 100,
    venue: '',
    vendors: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 Event Data:', formData);
    alert('Event created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-xl">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">
          {step < 6 ? `Step ${step} of 5` : 'Review & Submit'}
        </h2>

       
        {step === 1 && (
          <>
            <label className="block mb-4">
              <span className="text-gray-700">Event Title</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">Date</span>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">Time</span>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
              />
            </label>
          </>
        )}

     
        {step === 2 && (
          <label className="block mb-4">
            <span className="text-gray-700">Schedule</span>
            <textarea
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded h-24"
              placeholder="e.g. 10:00 AM - Opening Speech..."
            />
          </label>
        )}

      
        {step === 3 && (
          <label className="block mb-4">
            <span className="text-gray-700">Banner Image URL</span>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
            />
          </label>
        )}

       
        {step === 4 && (
          <label className="block mb-4">
            <span className="text-gray-700">Number of Tickets</span>
            <input
              type="number"
              name="tickets"
              value={formData.tickets}
              onChange={handleChange}
              className="w-full p-2 mt-1 border rounded"
            />
          </label>
        )}

    
        {step === 5 && (
          <>
            <label className="block mb-4">
              <span className="text-gray-700">Venue</span>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">Vendors</span>
              <input
                type="text"
                name="vendors"
                value={formData.vendors}
                onChange={handleChange}
                className="w-full p-2 mt-1 border rounded"
                placeholder="e.g. Catering, Audio, Lighting"
              />
            </label>
          </>
        )}

       
        {step === 6 && (
          <div className="text-sm text-gray-800 space-y-2">
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>Date:</strong> {formData.date}</p>
            <p><strong>Time:</strong> {formData.time}</p>
            <p><strong>Schedule:</strong> {formData.schedule}</p>
            <p><strong>Image:</strong> {formData.image}</p>
            <p><strong>Tickets:</strong> {formData.tickets}</p>
            <p><strong>Venue:</strong> {formData.venue}</p>
            <p><strong>Vendors:</strong> {formData.vendors}</p>
          </div>
        )}

     
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              ⬅ Back
            </button>
          )}
          {step < 6 && (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Next ➡
            </button>
          )}
          {step === 6 && (
            <button
              type="submit"
              className="ml-auto px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Submit ✅
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
