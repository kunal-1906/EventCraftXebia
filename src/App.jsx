import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { setUser } from './redux/userSlice';
import { authService } from './services/api';

// Common Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Attendee Pages
import AttendeeDashboard from './pages/AttendeeDashboard';
import EventRegistration from './pages/EventRegistration';
import CalendarView from './pages/CalendarView';

// Organizer Pages
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import EventManagement from './pages/EventManagement';
import VendorManagement from './pages/VendorManagement';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import EventModeration from './pages/EventModeration';
import ReportsFeedback from './pages/ReportsFeedback';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // Check for existing user session on app load
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser && !user) {
      dispatch(setUser(storedUser));
    }
  }, [dispatch, user]);

  // Helper function to redirect users to their appropriate dashboard
  const DashboardRedirect = () => {
    if (!user) {
      return <Navigate to="/login" />;
    }

    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'organizer':
        return <Navigate to="/organizer/dashboard" />;
      case 'attendee':
        return <Navigate to="/attendee/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        {/* Common Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/event/:id" element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        } />

        {/* Attendee Routes */}
        <Route path="/attendee/dashboard" element={
          <ProtectedRoute requiredRoles={['attendee', 'organizer', 'admin']}>
            <AttendeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/attendee/register/:eventId" element={
          <ProtectedRoute requiredRoles={['attendee', 'organizer', 'admin']}>
            <EventRegistration />
          </ProtectedRoute>
        } />
        <Route path="/attendee/calendar" element={
          <ProtectedRoute requiredRoles={['attendee', 'organizer', 'admin']}>
            <CalendarView />
          </ProtectedRoute>
        } />

        {/* Organizer Routes */}
        <Route path="/organizer/dashboard" element={
          <ProtectedRoute requiredRoles={['organizer', 'admin']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/organizer/create-event" element={
          <ProtectedRoute requiredRoles={['organizer', 'admin']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/organizer/manage-events" element={
          <ProtectedRoute requiredRoles={['organizer', 'admin']}>
            <EventManagement />
          </ProtectedRoute>
        } />
        <Route path="/organizer/vendors" element={
          <ProtectedRoute requiredRoles={['organizer', 'admin']}>
            <VendorManagement />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/moderation" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <EventModeration />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <ReportsFeedback />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;