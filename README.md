# EventCraft

EventCraft is a comprehensive event management platform that allows users to create, discover, and register for events. The application is built with a React frontend and Node.js/Express backend.

## Features

- Auth0 Authentication
- User roles (Attendee, Organizer, Admin)
- Event creation and management
- Ticket purchasing and management
- User profiles
- Admin dashboard

## Tech Stack

### Frontend
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Framer Motion
- Auth0

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Auth0 Integration

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Auth0 account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/eventcraft.git
   cd eventcraft
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables
   - Create a `.env` file in the backend directory based on `.env.example`
   - Create a `.env` file in the frontend directory based on `.env.example`

5. Set up Auth0 (see AUTH0_SETUP.md for detailed instructions)

6. Start the development servers

   Backend:
   ```
   cd backend
   npm run dev
   ```

   Frontend:
   ```
   cd frontend
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

## Auth0 Setup

See the [AUTH0_SETUP.md](AUTH0_SETUP.md) file for detailed instructions on setting up Auth0 authentication.

## Project Structure

```
eventcraft/
├── backend/             # Express server
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── frontend/            # React application
│   ├── public/          # Static files
│   └── src/             # Source files
│       ├── components/  # React components
│       ├── hooks/       # Custom hooks
│       ├── pages/       # Page components
│       ├── redux/       # Redux store and slices
│       └── services/    # API services
└── README.md            # Project documentation
```

## License

This project is licensed under the MIT License.
