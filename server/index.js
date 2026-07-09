import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { open } from 'sqlite';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const normalizeOrigin = (origin) => origin.replace(/\/$/, '');

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  ...configuredOrigins
]);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header, such as Postman,
    // Railway health checks, and server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedRequestOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedRequestOrigin)) {
      return callback(null, true);
    }

    console.error(`Blocked by CORS: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Database configuration
let db;

// Initialize database
async function initDatabase() {
  try {
    db = await open({
      filename: './airport_portal.db',
      driver: sqlite3.Database
    });

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create service_bookings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS service_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id),
        service_type TEXT NOT NULL,
        passenger_name TEXT NOT NULL,
        flight_number TEXT,
        travel_date DATE,
        details TEXT,
        price REAL,
        payment_status TEXT DEFAULT 'pending',
        booking_status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create flights table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flight_no TEXT NOT NULL,
        airline_en TEXT NOT NULL,
        airline_ar TEXT NOT NULL,
        destination_en TEXT NOT NULL,
        destination_ar TEXT NOT NULL,
        origin_en TEXT NOT NULL,
        origin_ar TEXT NOT NULL,
        time TEXT NOT NULL,
        gate TEXT NOT NULL,
        status TEXT NOT NULL,
        status_label_en TEXT NOT NULL,
        status_label_ar TEXT NOT NULL,
        type TEXT NOT NULL,
        lat REAL,
        lon REAL
      )
    `);

    // Check if flights table is empty, then seed sample data
    const flightCount = await db.get(
      'SELECT COUNT(*) as count FROM flights'
    );

    if (flightCount.count === 0) {
      console.log('Seeding sample flights data...');

      const sampleFlights = [
        // Departures
        {
          flight_no: 'QA101',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'London',
          destination_ar: 'لندن',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '08:30',
          gate: 'A12',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'departure',
          lat: 51.5074,
          lon: -0.1278
        },
        {
          flight_no: 'QA205',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'Dubai',
          destination_ar: 'دبي',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '09:15',
          gate: 'B05',
          status: 'boarding',
          status_label_en: 'Boarding',
          status_label_ar: 'صعود',
          type: 'departure',
          lat: 25.2048,
          lon: 55.2708
        },
        {
          flight_no: 'SV302',
          airline_en: 'Saudia',
          airline_ar: 'الخطوط السعودية',
          destination_en: 'Riyadh',
          destination_ar: 'الرياض',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '10:00',
          gate: 'C08',
          status: 'delayed',
          status_label_en: 'Delayed',
          status_label_ar: 'متأخر',
          type: 'departure',
          lat: 24.7136,
          lon: 46.6753
        },
        {
          flight_no: 'EK405',
          airline_en: 'Emirates',
          airline_ar: 'طيران الإمارات',
          destination_en: 'Abu Dhabi',
          destination_ar: 'أبو ظبي',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '11:30',
          gate: 'A15',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'departure',
          lat: 24.4539,
          lon: 54.3773
        },
        {
          flight_no: 'MS712',
          airline_en: 'EgyptAir',
          airline_ar: 'مصر للطيران',
          destination_en: 'Cairo',
          destination_ar: 'القاهرة',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '12:45',
          gate: 'D03',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'departure',
          lat: 30.0444,
          lon: 31.2357
        },
        {
          flight_no: 'QA315',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'Istanbul',
          destination_ar: 'إسطنبول',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '14:20',
          gate: 'B12',
          status: 'boarding',
          status_label_en: 'Boarding',
          status_label_ar: 'صعود',
          type: 'departure',
          lat: 41.0082,
          lon: 28.9784
        },
        {
          flight_no: 'SV508',
          airline_en: 'Saudia',
          airline_ar: 'الخطوط السعودية',
          destination_en: 'Jeddah',
          destination_ar: 'جدة',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '15:00',
          gate: 'C15',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'departure',
          lat: 21.5433,
          lon: 39.1728
        },
        {
          flight_no: 'EK602',
          airline_en: 'Emirates',
          airline_ar: 'طيران الإمارات',
          destination_en: 'Dubai',
          destination_ar: 'دبي',
          origin_en: 'Doha',
          origin_ar: 'الدوحة',
          time: '16:30',
          gate: 'A20',
          status: 'delayed',
          status_label_en: 'Delayed',
          status_label_ar: 'متأخر',
          type: 'departure',
          lat: 25.2048,
          lon: 55.2708
        },

        // Arrivals
        {
          flight_no: 'QA202',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'London',
          origin_ar: 'لندن',
          time: '07:45',
          gate: 'A10',
          status: 'landed',
          status_label_en: 'Landed',
          status_label_ar: 'هبط',
          type: 'arrival',
          lat: 51.5074,
          lon: -0.1278
        },
        {
          flight_no: 'SV401',
          airline_en: 'Saudia',
          airline_ar: 'الخطوط السعودية',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Riyadh',
          origin_ar: 'الرياض',
          time: '08:30',
          gate: 'B02',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'arrival',
          lat: 24.7136,
          lon: 46.6753
        },
        {
          flight_no: 'EK301',
          airline_en: 'Emirates',
          airline_ar: 'طيران الإمارات',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Dubai',
          origin_ar: 'دبي',
          time: '09:15',
          gate: 'C05',
          status: 'boarding',
          status_label_en: 'Boarding',
          status_label_ar: 'صعود',
          type: 'arrival',
          lat: 25.2048,
          lon: 55.2708
        },
        {
          flight_no: 'MS801',
          airline_en: 'EgyptAir',
          airline_ar: 'مصر للطيران',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Cairo',
          origin_ar: 'القاهرة',
          time: '10:00',
          gate: 'D01',
          status: 'delayed',
          status_label_en: 'Delayed',
          status_label_ar: 'متأخر',
          type: 'arrival',
          lat: 30.0444,
          lon: 31.2357
        },
        {
          flight_no: 'QA405',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Istanbul',
          origin_ar: 'إسطنبول',
          time: '11:30',
          gate: 'A18',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'arrival',
          lat: 41.0082,
          lon: 28.9784
        },
        {
          flight_no: 'SV602',
          airline_en: 'Saudia',
          airline_ar: 'الخطوط السعودية',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Jeddah',
          origin_ar: 'جدة',
          time: '12:45',
          gate: 'B08',
          status: 'landed',
          status_label_en: 'Landed',
          status_label_ar: 'هبط',
          type: 'arrival',
          lat: 21.5433,
          lon: 39.1728
        },
        {
          flight_no: 'EK503',
          airline_en: 'Emirates',
          airline_ar: 'طيران الإمارات',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Abu Dhabi',
          origin_ar: 'أبو ظبي',
          time: '14:00',
          gate: 'C12',
          status: 'ontime',
          status_label_en: 'On Time',
          status_label_ar: 'في الموعد',
          type: 'arrival',
          lat: 24.4539,
          lon: 54.3773
        },
        {
          flight_no: 'QA508',
          airline_en: 'Qalada Airways',
          airline_ar: 'طيران القلادة',
          destination_en: 'Doha',
          destination_ar: 'الدوحة',
          origin_en: 'Dubai',
          origin_ar: 'دبي',
          time: '15:30',
          gate: 'A25',
          status: 'boarding',
          status_label_en: 'Boarding',
          status_label_ar: 'صعود',
          type: 'arrival',
          lat: 25.2048,
          lon: 55.2708
        }
      ];

      for (const flight of sampleFlights) {
        await db.run(
          `INSERT INTO flights (
            flight_no,
            airline_en,
            airline_ar,
            destination_en,
            destination_ar,
            origin_en,
            origin_ar,
            time,
            gate,
            status,
            status_label_en,
            status_label_ar,
            type,
            lat,
            lon
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            flight.flight_no,
            flight.airline_en,
            flight.airline_ar,
            flight.destination_en,
            flight.destination_ar,
            flight.origin_en,
            flight.origin_ar,
            flight.time,
            flight.gate,
            flight.status,
            flight.status_label_en,
            flight.status_label_ar,
            flight.type,
            flight.lat,
            flight.lon
          ]
        );
      }

      console.log(`Seeded ${sampleFlights.length} sample flights`);
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Auth Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (
        username,
        email,
        password,
        phone
      )
      VALUES (?, ?, ?, ?)`,
      [
        username,
        email.toLowerCase(),
        hashedPassword,
        phone || null
      ]
    );

    const user = await db.get(
      `SELECT
        id,
        username,
        email
      FROM users
      WHERE id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      `SELECT
        id,
        username,
        email,
        phone,
        created_at
      FROM users
      WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Verify token
app.post(
  '/api/auth/verify',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await db.get(
        `SELECT
          id,
          username,
          email
        FROM users
        WHERE id = ?`,
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      return res.json({
        valid: true,
        user
      });
    } catch (error) {
      console.error('Token verification error:', error);

      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// Logout
app.post(
  '/api/auth/logout',
  authenticateToken,
  async (req, res) => {
    return res.json({
      message: 'Logout successful'
    });
  }
);

// Service Booking Routes

// Create service booking
app.post(
  '/api/service-bookings',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        serviceType,
        passengerName,
        flightNumber,
        travelDate,
        details,
        price
      } = req.body;

      if (!serviceType || !passengerName) {
        return res.status(400).json({
          error: 'Service type and passenger name are required'
        });
      }

      const bookingId =
        'QA-' + Math.floor(100000 + Math.random() * 900000);

      let finalPrice = price;

      if (finalPrice === undefined || finalPrice === null) {
        const priceMap = {
          lounge: 150,
          limo: 500,
          fastpass: 100,
          dining: 0,
          dutyfree: 0
        };

        finalPrice = priceMap[serviceType] ?? 0;
      }

      const result = await db.run(
        `INSERT INTO service_bookings (
          booking_id,
          user_id,
          service_type,
          passenger_name,
          flight_number,
          travel_date,
          details,
          price
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          req.user.id,
          serviceType,
          passengerName,
          flightNumber || null,
          travelDate || null,
          details || null,
          finalPrice
        ]
      );

      const booking = await db.get(
        `SELECT *
        FROM service_bookings
        WHERE id = ?`,
        [result.lastID]
      );

      return res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      console.error('Booking creation error:', error);

      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// Get booking by ID
app.get(
  '/api/service-bookings/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const booking = await db.get(
        `SELECT
          sb.*,
          u.username,
          u.email
        FROM service_bookings sb
        JOIN users u ON sb.user_id = u.id
        WHERE sb.booking_id = ?
          AND sb.user_id = ?`,
        [id, req.user.id]
      );

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found'
        });
      }

      return res.json({ booking });
    } catch (error) {
      console.error('Get booking error:', error);

      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// Get all user bookings
app.get(
  '/api/service-bookings',
  authenticateToken,
  async (req, res) => {
    try {
      const bookings = await db.all(
        `SELECT *
        FROM service_bookings
        WHERE user_id = ?
        ORDER BY created_at DESC`,
        [req.user.id]
      );

      return res.json({ bookings });
    } catch (error) {
      console.error('Get bookings error:', error);

      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
);

// Health check
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'Server is running'
  });
});

// Flights Routes

// Get all flights
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await db.all(
      'SELECT * FROM flights ORDER BY time ASC'
    );

    const departures = flights.filter(
      (flight) => flight.type === 'departure'
    );

    const arrivals = flights.filter(
      (flight) => flight.type === 'arrival'
    );

    return res.json({
      departures,
      arrivals
    });
  } catch (error) {
    console.error('Get flights error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Seed sample flights data
app.post('/api/flights/seed', async (req, res) => {
  try {
    const sampleFlights = [
      // Departures
      {
        flight_no: 'QA101',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'London',
        destination_ar: 'لندن',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '08:30',
        gate: 'A12',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'departure',
        lat: 51.5074,
        lon: -0.1278
      },
      {
        flight_no: 'QA205',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'Dubai',
        destination_ar: 'دبي',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '09:15',
        gate: 'B05',
        status: 'boarding',
        status_label_en: 'Boarding',
        status_label_ar: 'صعود',
        type: 'departure',
        lat: 25.2048,
        lon: 55.2708
      },
      {
        flight_no: 'SV302',
        airline_en: 'Saudia',
        airline_ar: 'الخطوط السعودية',
        destination_en: 'Riyadh',
        destination_ar: 'الرياض',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '10:00',
        gate: 'C08',
        status: 'delayed',
        status_label_en: 'Delayed',
        status_label_ar: 'متأخر',
        type: 'departure',
        lat: 24.7136,
        lon: 46.6753
      },
      {
        flight_no: 'EK405',
        airline_en: 'Emirates',
        airline_ar: 'طيران الإمارات',
        destination_en: 'Abu Dhabi',
        destination_ar: 'أبو ظبي',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '11:30',
        gate: 'A15',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'departure',
        lat: 24.4539,
        lon: 54.3773
      },
      {
        flight_no: 'MS712',
        airline_en: 'EgyptAir',
        airline_ar: 'مصر للطيران',
        destination_en: 'Cairo',
        destination_ar: 'القاهرة',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '12:45',
        gate: 'D03',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'departure',
        lat: 30.0444,
        lon: 31.2357
      },
      {
        flight_no: 'QA315',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'Istanbul',
        destination_ar: 'إسطنبول',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '14:20',
        gate: 'B12',
        status: 'boarding',
        status_label_en: 'Boarding',
        status_label_ar: 'صعود',
        type: 'departure',
        lat: 41.0082,
        lon: 28.9784
      },
      {
        flight_no: 'SV508',
        airline_en: 'Saudia',
        airline_ar: 'الخطوط السعودية',
        destination_en: 'Jeddah',
        destination_ar: 'جدة',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '15:00',
        gate: 'C15',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'departure',
        lat: 21.5433,
        lon: 39.1728
      },
      {
        flight_no: 'EK602',
        airline_en: 'Emirates',
        airline_ar: 'طيران الإمارات',
        destination_en: 'Dubai',
        destination_ar: 'دبي',
        origin_en: 'Doha',
        origin_ar: 'الدوحة',
        time: '16:30',
        gate: 'A20',
        status: 'delayed',
        status_label_en: 'Delayed',
        status_label_ar: 'متأخر',
        type: 'departure',
        lat: 25.2048,
        lon: 55.2708
      },

      // Arrivals
      {
        flight_no: 'QA202',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'London',
        origin_ar: 'لندن',
        time: '07:45',
        gate: 'A10',
        status: 'landed',
        status_label_en: 'Landed',
        status_label_ar: 'هبط',
        type: 'arrival',
        lat: 51.5074,
        lon: -0.1278
      },
      {
        flight_no: 'SV401',
        airline_en: 'Saudia',
        airline_ar: 'الخطوط السعودية',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Riyadh',
        origin_ar: 'الرياض',
        time: '08:30',
        gate: 'B02',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'arrival',
        lat: 24.7136,
        lon: 46.6753
      },
      {
        flight_no: 'EK301',
        airline_en: 'Emirates',
        airline_ar: 'طيران الإمارات',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Dubai',
        origin_ar: 'دبي',
        time: '09:15',
        gate: 'C05',
        status: 'boarding',
        status_label_en: 'Boarding',
        status_label_ar: 'صعود',
        type: 'arrival',
        lat: 25.2048,
        lon: 55.2708
      },
      {
        flight_no: 'MS801',
        airline_en: 'EgyptAir',
        airline_ar: 'مصر للطيران',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Cairo',
        origin_ar: 'القاهرة',
        time: '10:00',
        gate: 'D01',
        status: 'delayed',
        status_label_en: 'Delayed',
        status_label_ar: 'متأخر',
        type: 'arrival',
        lat: 30.0444,
        lon: 31.2357
      },
      {
        flight_no: 'QA405',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Istanbul',
        origin_ar: 'إسطنبول',
        time: '11:30',
        gate: 'A18',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'arrival',
        lat: 41.0082,
        lon: 28.9784
      },
      {
        flight_no: 'SV602',
        airline_en: 'Saudia',
        airline_ar: 'الخطوط السعودية',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Jeddah',
        origin_ar: 'جدة',
        time: '12:45',
        gate: 'B08',
        status: 'landed',
        status_label_en: 'Landed',
        status_label_ar: 'هبط',
        type: 'arrival',
        lat: 21.5433,
        lon: 39.1728
      },
      {
        flight_no: 'EK503',
        airline_en: 'Emirates',
        airline_ar: 'طيران الإمارات',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Abu Dhabi',
        origin_ar: 'أبو ظبي',
        time: '14:00',
        gate: 'C12',
        status: 'ontime',
        status_label_en: 'On Time',
        status_label_ar: 'في الموعد',
        type: 'arrival',
        lat: 24.4539,
        lon: 54.3773
      },
      {
        flight_no: 'QA508',
        airline_en: 'Qalada Airways',
        airline_ar: 'طيران القلادة',
        destination_en: 'Doha',
        destination_ar: 'الدوحة',
        origin_en: 'Dubai',
        origin_ar: 'دبي',
        time: '15:30',
        gate: 'A25',
        status: 'boarding',
        status_label_en: 'Boarding',
        status_label_ar: 'صعود',
        type: 'arrival',
        lat: 25.2048,
        lon: 55.2708
      }
    ];

    await db.exec('DELETE FROM flights');

    for (const flight of sampleFlights) {
      await db.run(
        `INSERT INTO flights (
          flight_no,
          airline_en,
          airline_ar,
          destination_en,
          destination_ar,
          origin_en,
          origin_ar,
          time,
          gate,
          status,
          status_label_en,
          status_label_ar,
          type,
          lat,
          lon
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          flight.flight_no,
          flight.airline_en,
          flight.airline_ar,
          flight.destination_en,
          flight.destination_ar,
          flight.origin_en,
          flight.origin_ar,
          flight.time,
          flight.gate,
          flight.status,
          flight.status_label_en,
          flight.status_label_ar,
          flight.type,
          flight.lat,
          flight.lon
        ]
      );
    }

    return res.json({
      message: 'Sample flights data seeded successfully',
      count: sampleFlights.length
    });
  } catch (error) {
    console.error('Seed flights error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);

    console.log(
      `Allowed CORS origins: ${Array.from(
        allowedOrigins
      ).join(', ')}`
    );
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;