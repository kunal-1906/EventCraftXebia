import React, { useState } from 'react';

const mockUsers = [
  {
    id: 1,
    name: 'Aman Verma',
    email: 'aman@eventcraft.com',
    role: 'Attendee',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@events.org',
    role: 'Organizer',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@eventcraft.com',
    role: 'Admin',
    status: 'Blocked',
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);

  const toggleStatus = (id) => {
    const updated = users.map((u) =>
      u.id === id
        ? {
            ...u,
            status: u.status === 'Active' ? 'Blocked' : 'Active',
          }
        : u
    );
    setUsers(updated);
  };

  const changeRole = (id) => {
    const updated = users.map((u) =>
      u.id === id
        ? {
            ...u,
            role: u.role === 'Organizer' ? 'Attendee' : u.role === 'Attendee' ? 'Organizer' : 'Admin',
          }
        : u
    );
    setUsers(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">👥 User Management</h2>

        <table className="min-w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 text-left text-gray-600 font-semibold">Name</th>
              <th className="p-3 text-left text-gray-600 font-semibold">Email</th>
              <th className="p-3 text-left text-gray-600 font-semibold">Role</th>
              <th className="p-3 text-left text-gray-600 font-semibold">Status</th>
              <th className="p-3 text-left text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className={`px-2 py-1 rounded text-sm ${
                      user.status === 'Blocked'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                  </button>
                  {user.role !== 'Admin' && (
                    <button
                      onClick={() => changeRole(user.id)}
                      className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm"
                    >
                      Promote/Demote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

