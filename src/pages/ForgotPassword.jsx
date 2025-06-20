import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(`Reset link sent to: ${email}`);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">Forgot Password</h2>

        {!submitted ? (
          <>
            <label className="block mb-4">
              <span className="text-gray-700">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mt-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Send Reset Link
            </button>
          </>
        ) : (
          <p className="text-green-600 text-center">
            ✅ A password reset link has been sent to <strong>{email}</strong>
          </p>
        )}

        <p className="mt-6 text-center text-sm">
          Remember your password?{' '}
          <a href="/login" className="text-blue-600 underline">Back to Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;

