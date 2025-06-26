import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import axios from 'axios';

const DummyUsers = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  const createDummyUser = async (role) => {
    try {
      setLoading(true);
      setMessage(`Creating ${role} user...`);
      
      // Create a dummy user with the specified role
      const dummyUser = {
        name: `Dummy ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: `dummy.${role}@example.com`,
        picture: `https://ui-avatars.com/api/?name=${role}&background=random`,
        auth0Id: `dummy-${role}-${Date.now()}`,
        role: role
      };
      
      try {
        // Try to create the user in the backend
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/dummy`, dummyUser);
        
        setMessage(`Successfully created ${role} user in database!`);
        
        // Set the user in Redux store
        dispatch(setUser({
          ...response.data,
          token: 'dummy-token'
        }));
        
        return response.data;
      } catch (error) {
        console.error(`Failed to create ${role} user in database:`, error);
        
        // Fallback: Use local user object
        setMessage(`Created local ${role} user (backend failed).`);
        
        const localUser = {
          _id: dummyUser.auth0Id,
          ...dummyUser,
          createdAt: new Date().toISOString()
        };
        
        // Set the user in Redux store
        dispatch(setUser({
          ...localUser,
          token: 'dummy-token'
        }));
        
        return localUser;
      }
    } catch (error) {
      console.error(`Error creating ${role} user:`, error);
      setMessage(`Error creating ${role} user.`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAllDummyUsers = async () => {
    setLoading(true);
    setMessage('Creating all dummy users...');
    
    const attendee = await createDummyUser('attendee');
    const organizer = await createDummyUser('organizer');
    const admin = await createDummyUser('admin');
    
    setMessage(`Created all dummy users: 
      - Attendee: ${attendee ? attendee.name : 'Failed'}
      - Organizer: ${organizer ? organizer.name : 'Failed'}
      - Admin: ${admin ? admin.name : 'Failed'}
    `);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create Dummy Users</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg whitespace-pre-line">
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => createDummyUser('attendee')}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Create Dummy Attendee
          </button>
          
          <button
            onClick={() => createDummyUser('organizer')}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Create Dummy Organizer
          </button>
          
          <button
            onClick={() => createDummyUser('admin')}
            disabled={loading}
            className="w-full py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Create Dummy Admin
          </button>
          
          <button
            onClick={createAllDummyUsers}
            disabled={loading}
            className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Create All Dummy Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default DummyUsers; 