# Backend Setup Instructions

This document explains how to set up the PostgreSQL database and backend server for the Airport Portal application.

## Prerequisites

1. **PostgreSQL** - Install PostgreSQL on your system
   - Download from: https://www.postgresql.org/download/
   - Default installation typically uses:
     - Host: localhost
     - Port: 5432
     - Username: postgres
     - Password: (set during installation)

2. **Node.js** - Already installed for the frontend

## Database Setup

### Step 1: Create the Database

Open PostgreSQL command line tool (psql) or a GUI tool like pgAdmin and run:

```sql
CREATE DATABASE airport_portal;
```

### Step 2: Verify Database Connection

Ensure you can connect to the database with the credentials in `.env`:
- Database: `airport_portal`
- User: `postgres`
- Password: `postgres` (or your set password)

### Step 3: Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=airport_portal
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

**Important:** Change `JWT_SECRET` to a secure random string in production.

## Backend Server Setup

### Step 1: Install Dependencies

Dependencies are already installed via `npm install`. The following packages were added:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `jspdf` - PDF generation (frontend)

### Step 2: Start the Backend Server

Run the backend server in a separate terminal:

```bash
npm run server
```

The server will start on `http://localhost:3001`

The server will automatically create the required database tables on first startup:
- `users` table (for authentication)
- `service_bookings` table (for service bookings)

### Step 3: Start the Frontend

In another terminal, start the frontend:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password, phone? }`
  - Returns: `{ message, user }`

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ message, token, user }`

- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`

### Service Bookings

- `POST /api/service-bookings` - Create a service booking (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ serviceType, passengerName, flightNumber?, travelDate?, details?, price? }`
  - Returns: `{ message, booking }`

- `GET /api/service-bookings/:id` - Get booking by ID (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ booking }`

- `GET /api/service-bookings` - Get all user bookings (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ bookings }`

### Health Check

- `GET /api/health` - Server health check
  - Returns: `{ status, message }`

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Service Bookings Table

```sql
CREATE TABLE service_bookings (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  service_type VARCHAR(50) NOT NULL,
  passenger_name VARCHAR(255) NOT NULL,
  flight_number VARCHAR(50),
  travel_date DATE,
  details TEXT,
  price DECIMAL(10, 2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  booking_status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Service Types

The following service types are supported:
- `lounge` - VIP Lounge (default price: 150 SAR)
- `limo` - Luxury Limousine (default price: 500 SAR)
- `fastpass` - FastTrack VIP Pass (default price: 100 SAR)
- `dining` - Dining Reservation (default price: 0 SAR)
- `dutyfree` - Duty Free Pre-Order (default price: 0 SAR)

## Testing the Backend

### Test Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Booking Creation (requires token)

```bash
curl -X POST http://localhost:3001/api/service-bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"serviceType":"lounge","passengerName":"John Doe","flightNumber":"QA-301","travelDate":"2026-06-15"}'
```

## Troubleshooting

### Database Connection Error

If you see "Error initializing database", check:
1. PostgreSQL is running
2. Database `airport_portal` exists
3. Credentials in `.env` match your PostgreSQL setup

### Port Already in Use

If port 3001 is already in use, change the `PORT` in `.env` file.

### CORS Errors

The backend is configured to allow CORS from any origin. If you still see CORS errors, ensure the backend server is running.

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` in `.env` to a secure random string in production
2. **Database Password**: Use a strong password for PostgreSQL in production
3. **HTTPS**: Use HTTPS in production for secure communication
4. **Environment Variables**: Never commit `.env` to version control
