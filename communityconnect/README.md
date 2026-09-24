# CommunityConnect

**Tagline:** *Help is closer than you think.*

CommunityConnect is a full-stack real-time web application that connects local residents who need everyday or emergency services with local service providers and volunteers. It utilizes MongoDB's Native Geospatial `$near` queries to match users based on their immediate geographic proximity.

## Problem Statement
People in local communities often don't know whom to contact when they need help, such as plumbers, electricians, tutors, ambulance/emergency assistance, volunteers, etc.

## Solution
A robust platform where people can request help, providers can register, and users can find suitable nearby help based on requirements and real-world latitude/longitude distance calculations.

## Features
- **Role-Based Access:** Help Seeker, Service Provider, Admin
- **Geolocation Matching:** Uses Browser Geolocation API and MongoDB `2dsphere` indexes.
- **Service Dashboards:** Dedicated dashboards for Seekers to post requests and Providers to discover nearby jobs.
- **Emergency Feature:** Critical contacts quick-dial.
- **JWT Authentication:** Secure login/registration.

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Lucide React
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB Atlas (or Local), Mongoose

## Folder Structure
```text
communityconnect/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth & Error middlewares
│   ├── models/          # Mongoose Schemas (User, HelpRequest, etc.)
│   ├── routes/          # Express Routers
│   ├── server.js        # Entry point
│   └── seed.js          # DB Seed script
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, UI elements
    │   ├── context/     # AuthContext
    │   ├── pages/       # Dashboards, Auth pages, Home
    │   ├── App.jsx      # Routing
    │   └── main.jsx     # Entry point
```

## Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   cd communityconnect/backend
   npm install

   cd ../frontend
   npm install
   ```

2. **Environment Variables:**
   - In `backend/`, create a `.env` file based on `.env.example`:
     ```env
     MONGO_URI=mongodb://127.0.0.1:27017/communityconnect
     JWT_SECRET=supersecretjwtkey_replace_me
     PORT=5000
     CLIENT_URL=http://localhost:5173
     ```

3. **Database Seeding:**
   Populate the database with sample data:
   ```bash
   cd backend
   npm run seed
   ```
   **Demo Accounts:**
   - Admin: `admin@communityconnect.com` / `password123`
   - Seeker: `john@example.com` / `password123`
   - Provider: `mike@example.com` / `password123`

4. **Running the Application:**
   - Start Backend: `cd backend && npm run dev`
   - Start Frontend: `cd frontend && npm run dev`

5. **Access:** Open `http://localhost:5173` in your browser.

## Future Enhancements
- Full Real-Time Chat using Socket.IO (foundation built in `server.js`).
- Push notifications for new requests.
- Integrated mapping UI (Leaflet).
