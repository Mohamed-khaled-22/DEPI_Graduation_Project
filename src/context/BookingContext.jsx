/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

// Flight pricing structure
const FLIGHT_PRICING = {
  basePrices: {
    economy: 500,
    business: 1500,
    first: 3000
  },
  baggagePrice: 100, // per baggage
  routeMultipliers: {
    domestic: 1.0,
    international: 1.5
  }
};

// Calculate flight price
const calculateFlightPrice = (cabinClass, baggageCount, from, to, passengers = 1) => {
  const basePrice = FLIGHT_PRICING.basePrices[cabinClass] || FLIGHT_PRICING.basePrices.economy;
  const baggageCost = (baggageCount || 0) * FLIGHT_PRICING.baggagePrice;
  
  // Determine if international route (simplified logic)
  const isInternational = ['LHR', 'CDG', 'IST', 'NYC', 'CAI'].includes(from) || ['LHR', 'CDG', 'IST', 'NYC', 'CAI'].includes(to);
  const routeMultiplier = isInternational ? FLIGHT_PRICING.routeMultipliers.international : FLIGHT_PRICING.routeMultipliers.domestic;
  
  const total = (basePrice + baggageCost) * routeMultiplier * passengers;
  return Math.round(total);
};

// Airport gate database
const AIRPORT_GATES = {
  terminals: {
    t1: {
      nameAr: 'الصالة 1 - مغادرة دولية',
      nameEn: 'Terminal 1 - International Departures',
      gates: [
        { id: 'A1', walkTime: 3, services: ['duty-free', 'lounge'], distance: '150m' },
        { id: 'A2', walkTime: 4, services: ['cafe', 'restroom'], distance: '200m' },
        { id: 'A3', walkTime: 5, services: ['duty-free', 'lounge', 'spa'], distance: '250m' },
        { id: 'A4', walkTime: 4, services: ['restaurant', 'prayer-room'], distance: '180m' },
        { id: 'A5', walkTime: 6, services: ['duty-free', 'kids-zone'], distance: '300m' },
        { id: 'A6', walkTime: 5, services: ['cafe', 'lounge'], distance: '220m' },
        { id: 'A7', walkTime: 4, services: ['restroom', 'charging-station'], distance: '160m' },
        { id: 'A8', walkTime: 7, services: ['duty-free', 'restaurant', 'lounge'], distance: '350m' }
      ],
      walkTime: 4 // minutes average
    },
    t2: {
      nameAr: 'الصالة 2 - مغادرة محلية',
      nameEn: 'Terminal 2 - Domestic Departures',
      gates: [
        { id: 'B1', walkTime: 4, services: ['cafe', 'restroom'], distance: '120m' },
        { id: 'B2', walkTime: 5, services: ['restaurant', 'prayer-room'], distance: '180m' },
        { id: 'B3', walkTime: 3, services: ['vending-machine'], distance: '100m' },
        { id: 'B4', walkTime: 6, services: ['cafe', 'lounge'], distance: '250m' },
        { id: 'B5', walkTime: 4, services: ['restroom', 'charging-station'], distance: '140m' },
        { id: 'B6', walkTime: 5, services: ['restaurant'], distance: '200m' },
        { id: 'B7', walkTime: 7, services: ['cafe', 'kids-zone'], distance: '280m' },
        { id: 'B8', walkTime: 6, services: ['lounge', 'prayer-room'], distance: '260m' }
      ],
      walkTime: 6 // minutes average
    }
  },
  // Flight to gate mapping
  flightGateMapping: [
    { flight: 'QA-301', terminal: 't1', gate: 'A3', destAr: 'لندن', destEn: 'London', time: '5' },
    { flight: 'QA-302', terminal: 't1', gate: 'A5', destAr: 'الرياض', destEn: 'Riyadh', time: '3' },
    { flight: 'QA-110', terminal: 't1', gate: 'A1', destAr: 'القاهرة', destEn: 'Cairo', time: '8' },
    { flight: 'EK-812', terminal: 't1', gate: 'A8', destAr: 'دبي', destEn: 'Dubai', time: '4' },
    { flight: 'SV-500', terminal: 't2', gate: 'B2', destAr: 'جدة', destEn: 'Jeddah', time: '6' },
    { flight: 'QA-225', terminal: 't2', gate: 'B4', destAr: 'باريس', destEn: 'Paris', time: '4' }
  ]
};

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    const storedBookings = localStorage.getItem('airport_bookings');
    if (storedBookings) {
      try {
        return JSON.parse(storedBookings);
      } catch (e) {
        console.error('Failed to parse bookings from localStorage', e);
      }
    }
    return [];
  });

  const createBooking = (bookingData) => {
    const newBooking = {
      id: Date.now().toString(),
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    
    const updatedBookings = [...bookings, newBooking];
    localStorage.setItem('airport_bookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    return newBooking;
  };

  const getUserBookings = (userEmail) => {
    return bookings.filter(b => b.userEmail === userEmail);
  };

  const getBookingById = (bookingId) => {
    return bookings.find(b => b.id === bookingId);
  };

  const updateBooking = (bookingId, updates) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, ...updates } : b
    );
    localStorage.setItem('airport_bookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
  };

  const deleteBooking = (bookingId) => {
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('airport_bookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
  };

  // Gate management functions
  const getTerminalGates = (terminal) => {
    return AIRPORT_GATES.terminals[terminal]?.gates?.map(g => g.id) || [];
  };

  const getGateInfo = (terminal, gateId) => {
    return AIRPORT_GATES.terminals[terminal]?.gates?.find(g => g.id === gateId) || null;
  };

  const getTerminalInfo = (terminal) => {
    return AIRPORT_GATES.terminals[terminal] || null;
  };

  const findGateByFlight = (flightNumber) => {
    return AIRPORT_GATES.flightGateMapping.find(
      f => f.flight.toLowerCase() === flightNumber.toLowerCase()
    );
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      createBooking,
      getUserBookings,
      getBookingById,
      updateBooking,
      deleteBooking,
      getTerminalGates,
      getGateInfo,
      getTerminalInfo,
      findGateByFlight,
      calculateFlightPrice
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
