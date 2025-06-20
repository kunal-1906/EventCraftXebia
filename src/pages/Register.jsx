import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../redux/userSlice';
import { useNotification } from '../components/NotificationContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1); // Step 1: Role Selection, Step 2: Account Details

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error: notify, success } = useNotification();
  
  const { user, status, error } = useSelector((state) => state.user);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectToDashboard();
    }
    
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [user, dispatch]);

  // Show error notification when redux error state changes
  useEffect(() => {
    if (error) {
      notify(error, { type: 'error', duration: 5000 });
    }
  }, [error, notify]);

  const redirectToDashboard = () => {
    switch (role) {
      case 'attendee':
        navigate('/attendee/dashboard');
        break;
      case 'organizer':
        navigate('/organizer/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const validateStep1 = () => {
    if (!role) {
      notify('Please select a role to continue', { type: 'warning' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    
    if (validateStep2()) {
      dispatch(registerUser({ name, email, password, role }));
      success('Registration successful! Redirecting to dashboard...', { duration: 4000 });
    }
  };

  // Role selection step
  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900">Choose your role</h2>
      <p className="text-center text-gray-600">Select how you want to use EventCraft</p>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Attendee Card */}
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            role === 'attendee' 
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
          onClick={() => setRole('attendee')}
        >
          <div className="flex flex-col items-center">
            <div className="p-3 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Attendee</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Discover and register for events that interest you
            </p>
          </div>
        </div>

        {/* Organizer Card */}
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            role === 'organizer' 
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
          onClick={() => setRole('organizer')}
        >
          <div className="flex flex-col items-center">
            <div className="p-3 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Organizer</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Create and manage your own events and venues
            </p>
          </div>
        </div>

        {/* Admin Card */}
        <div 
          className={`border rounded-lg p-6 cursor-pointer transition-all ${
            role === 'admin' 
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500' 
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
          onClick={() => setRole('admin')}
        >
          <div className="flex flex-col items-center">
            <div className="p-3 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Admin</h3>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Manage users, moderate content, and oversee the platform
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  // Account details step
  const renderAccountDetails = () => (
    <form className="space-y-6" onSubmit={handleRegister}>
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-gray-600">
          You're registering as an <span className="font-medium capitalize">{role}</span>
        </p>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            formErrors.name ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            formErrors.email ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            formErrors.password ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          placeholder="•••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={`mt-1 appearance-none block w-full px-3 py-2 border ${
            formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          placeholder="•••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {formErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={handlePrevStep}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            status === 'loading' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-600">
        By creating an account, you agree to our{' '}
        <Link to="#" className="text-indigo-600 hover:text-indigo-500">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="#" className="text-indigo-600 hover:text-indigo-500">
          Privacy Policy
        </Link>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {step === 1 ? renderRoleSelection() : renderAccountDetails()}
      </div>
    </div>
  );
};

export default Register;

