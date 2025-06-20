# EventCraft - Event Management Platform

A modern event management web application built with React that allows users to create, manage, and attend events. The platform supports multiple user roles with role-specific dashboards and features.

## Features

### Authentication System
- Secure JWT-based authentication
- Role-based access control (Attendee, Organizer, Admin)
- User registration with role selection
- Login with appropriate redirects
- Protected routes based on user roles

### User Roles & Dashboards

#### Attendee
- View and register for upcoming events
- Track registered events
- Access to personalized calendar view
- Submit feedback for attended events
- View event certificates and details

#### Organizer
- Create and manage events
- Track event statistics and attendance
- Manage event vendors
- Handle sponsorship and speaker requests
- View revenue and analytics

#### Admin
- Moderate events and content
- Manage all users
- Handle reports and feedback
- View platform-wide statistics
- Approve/reject pending events

### UI Components
- Modern, responsive design with Tailwind CSS
- Role-specific dashboards
- Interactive event cards
- Notification system
- Tabbed interfaces for data organization

## Tech Stack

- **Frontend**: React, React Router
- **State Management**: Redux with Redux Toolkit
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd eventcraft
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Accounts

Use these credentials to test different user roles:

- **Attendee**: john@example.com / password123
- **Organizer**: jane@example.com / password123
- **Admin**: admin@example.com / password123

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
├── pages/           # Page components
│   ├── admin/       # Admin-specific pages
│   ├── attendee/    # Attendee-specific pages
│   └── organizer/   # Organizer-specific pages
├── redux/           # Redux state management
├── services/        # API services
├── App.jsx          # Main application component
└── main.jsx         # Application entry point
```

## Future Enhancements

- Real-time notifications with WebSockets
- Payment gateway integration
- Event analytics dashboard
- Mobile application
- Email notifications
- Social media integration

## License

MIT
