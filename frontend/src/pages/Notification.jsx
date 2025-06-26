import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  const bgColor =
    type === 'success'
      ? 'bg-green-100 text-green-700'
      : type === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700';

  return (
    <div className={`p-3 rounded shadow ${bgColor} flex justify-between items-center`}>
      <p className="text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-xs text-gray-500 hover:underline">
          Dismiss
        </button>
      )}
    </div>
  );
};

export default Notification;
