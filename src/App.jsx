import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Services from './pages/Services';
import TerminalMap from './pages/TerminalMap';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import TravelInfo from './pages/TravelInfo';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import SmartAssistant from './components/SmartAssistant';
import './App.css';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookingProvider>
            <Router>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                
                <main style={{ flex: '1 0 auto' }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/flights" element={<Flights />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/map" element={<TerminalMap />} />
                    <Route path="/flight-details" element={<FlightDetails />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/travel-info" element={<TravelInfo />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </main>

                <Footer />
                <SmartAssistant />
              </div>
            </Router>
          </BookingProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
