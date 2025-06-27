import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelectionModal from './components/RoleSelectionModal';
import useAuth from './hooks/useAuth';

// Common Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import EventDetails from './pages/EventDetails';
import TicketDetail from './pages/TicketDetail';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import AuthHandler from './pages/AuthHandler';
import DummyUsers from './pages/DummyUsers';

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
import UserManagementTest from './pages/UserManagementTest';
import EventModeration from './pages/EventModeration';
import ReportsFeedback from './pages/ReportsFeedback';

const App = () => {
  const user = useSelector((state) => state.user.user);
  const { showRoleSelection, setShowRoleSelection, initialUser, isLoading } = useAuth();

  // Simple dashboard redirect
  const DashboardRedirect = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'organizer':
        return <Navigate to="/organizer/dashboard" replace />;
      case 'attendee':
        return <Navigate to="/attendee/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={showRoleSelection} 
        onClose={() => setShowRoleSelection(false)} 
        user={initialUser} 
      />

      {/* Main content with padding to prevent navbar overlap */}
      <div className="pt-16"> {/* Add padding-top to account for navbar height */}
        <Routes>
          {/* Common Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthHandler />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dummy-users" element={<DummyUsers />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/event/:id" element={
            <ProtectedRoute>
              <EventDetails />
            </ProtectedRoute>
          } />
          <Route path="/event/:eventId/ticket/:ticketId" element={
            <ProtectedRoute>
              <TicketDetail />
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
          <Route path="/attendee/tickets/:ticketId" element={
            <ProtectedRoute requiredRoles={['attendee', 'organizer', 'admin']}>
              <TicketDetail />
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
              <UserManagementTest />
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
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;