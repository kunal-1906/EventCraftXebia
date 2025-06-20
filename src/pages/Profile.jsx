import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('light'); 

  const handleUpdate = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      name,
      email,
     
    };

    dispatch(setUser(updatedUser));
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <form
        onSubmit={handleUpdate}
        className="bg-white w-full max-w-lg p-8 rounded shadow"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6">My Profile</h2>

        <label className="block mb-4">
          <span className="text-gray-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">New Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Preferred Theme</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 mt-1 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
