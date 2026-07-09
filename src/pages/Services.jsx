import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, MapPin, Coffee, ShoppingBag, ShieldCheck, Zap, Car, Sparkles, X, Check, Utensils, QrCode, Download, Plane } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import jsPDF from 'jspdf';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

// Service pricing structure
const SERVICE_PRICING = {
  lounge: {
    basePrice: 200,
    perGuestPrice: 100
  },
  limo: {
    basePrice: 500
  },
  fastpass: {
    basePrice: 150
  },
  dining: {
    basePrice: 0 // Free reservation
  },
  dutyfree: {
    basePrice: 0 // Pay at pickup
  }
};

// Calculate service price
const calculateServicePrice = (serviceType, details) => {
  const pricing = SERVICE_PRICING[serviceType];
  if (!pricing) return 0;

  if (serviceType === 'lounge') {
    const guests = parseInt(details) || 1;
    return pricing.basePrice + (pricing.perGuestPrice * (guests - 1));
  }

  return pricing.basePrice;
};

export default function Services() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
  const { getUserBookings } = useBooking();
  const isRtl = locale === 'ar';

  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'lounge' | 'limo' | 'fastpass' | 'dining' | 'dutyfree'
  const [bookingForm, setBookingForm] = useState({ name: '', flightNo: '', date: new Date().toISOString().split('T')[0], details: '' });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingTicketId, setBookingTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [userFlights, setUserFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Duty Free State
  const [cart, setCart] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const dutyFreeItems = [
    { id: 1, nameAr: 'عطر العود الملكي الفاخر', nameEn: 'Royal Oud Premium Perfume', price: 450, icon: '💎' },
    { id: 2, nameAr: 'تمور خلاص الفاخرة المغطاة بالشوكولاتة', nameEn: 'Premium Khalas Chocolate Dates', price: 120, icon: '🌴' },
    { id: 3, nameAr: 'سماعات إلغاء الضوضاء للسفر الذكية', nameEn: 'Noise-Cancelling Smart Headphones', price: 850, icon: '🎧' },
  ];

  const handleOpenBooking = (type) => {
    if (!currentUser) {
      localStorage.setItem('auth_return_url', '/services');
      navigate('/login');
      return;
    }

    // Load user flights
    const flights = getUserBookings(currentUser.email).filter(b => b.status !== 'cancelled');
    setUserFlights(flights);

    setModalType(type);
    setBookingConfirmed(false);
    setBookingData(null);
    setError('');

    // If user has one flight, auto-select and pre-fill form
    if (flights.length === 1) {
      const flight = flights[0];
      setSelectedFlight(flight);
      setBookingForm({
        name: flight.passengerName,
        flightNo: flight.flightNo,
        date: flight.departureDate,
        details: '1'
      });
    } else if (flights.length > 1) {
      // Multiple flights - let user choose
      setSelectedFlight(null);
      setBookingForm({ name: '', flightNo: '', date: new Date().toISOString().split('T')[0], details: '1' });
    } else {
      // No flights - empty form
      setSelectedFlight(null);
      setBookingForm({ name: '', flightNo: '', date: new Date().toISOString().split('T')[0], details: '1' });
    }

    setModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get token from localStorage (assuming it's stored there after login)
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/service-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType: modalType,
          passengerName: bookingForm.name,
          flightNumber: bookingForm.flightNo,
          travelDate: bookingForm.date,
          details: bookingForm.details
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingTicketId(data.booking.booking_id);
      setBookingData(data.booking);
      setBookingConfirmed(true);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setCart(prev => [...prev, item]);
    setShowCartNotification(true);
    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  const clearCart = () => {
    setCart([]);
  };

  const generatePDFReceipt = async () => {
    try {
      // Fetch latest booking data from backend
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/service-bookings/${bookingTicketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking data');
      }

      const booking = data.booking;

      // Create PDF
      const doc = new jsPDF();
      const isRtl = locale === 'ar';

      // Set font for Arabic support (using default font for now)
      doc.setFontSize(20);
      doc.setTextColor(14, 165, 233);
      doc.text('Al-Qalada International Airport', 105, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Service Booking Receipt', 105, 35, { align: 'center' });

      // Booking details
      doc.setFontSize(12);
      let y = 55;
      const lineHeight = 10;

      doc.text(`Booking Number: ${booking.booking_id}`, 20, y);
      y += lineHeight;
      doc.text(`Passenger Name: ${booking.passenger_name}`, 20, y);
      y += lineHeight;

      const serviceNames = {
        lounge: 'VIP Lounge',
        limo: 'Luxury Limousine',
        fastpass: 'FastTrack VIP Pass',
        dining: 'Dining Reservation',
        dutyfree: 'Duty Free Pre-Order'
      };
      doc.text(`Service: ${serviceNames[booking.service_type] || booking.service_type}`, 20, y);
      y += lineHeight;

      if (booking.flight_number) {
        doc.text(`Flight Number: ${booking.flight_number}`, 20, y);
        y += lineHeight;
      }

      if (booking.travel_date) {
        doc.text(`Travel Date: ${booking.travel_date}`, 20, y);
        y += lineHeight;
      }

      y += lineHeight;
      doc.text(`Booking Date: ${new Date(booking.created_at).toLocaleDateString()}`, 20, y);
      y += lineHeight;
      doc.text(`Price: SAR ${booking.price}`, 20, y);
      y += lineHeight;
      doc.text(`Payment Status: ${booking.payment_status}`, 20, y);
      y += lineHeight;
      doc.text(`Booking Status: ${booking.booking_status}`, 20, y);

      // Contact info
      y += lineHeight + 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Contact Information:', 20, y);
      y += lineHeight;
      doc.text('Email: support@alqalada-airport.com', 20, y);
      y += lineHeight;
      doc.text('Phone: +966 11 123 4567', 20, y);

      // Footer
      y += 20;
      doc.setFontSize(8);
      doc.text('Thank you for choosing Al-Qalada International Airport', 105, y, { align: 'center' });

      // Save PDF
      doc.save(`receipt-${booking.booking_id}.pdf`);
    } catch (err) {
      alert('Failed to generate receipt: ' + err.message);
    }
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('services.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('services.subtitle')}</p>
      </div>

      {/* Cart Notification */}
      {showCartNotification && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: isRtl ? 'auto' : '30px',
          left: isRtl ? '30px' : 'auto',
          background: 'var(--status-ontime)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <Check size={18} />
          <span>{isRtl ? 'تم إضافة المنتج لطلبات السوق الحرة المسبقة بنجاح!' : 'Product added to Duty Free pre-orders!'}</span>
        </div>
      )}

      <div className="services-categories" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>

        {/* VIP Lounge */}
        <div className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <img
              src="./images/lounge.png"
              alt={t('services.loungeTitle')}
              className="service-image"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Award style={{ color: 'var(--primary)' }} size={22} />
              <h3>{t('services.loungeTitle')}</h3>
            </div>
            <p>{t('services.loungeDesc')}</p>
            <div className="service-features" style={{ marginTop: '15px' }}>
              <div className="service-feature-item">
                <Clock size={16} />
                <span>{t('services.loungeFeature1')}</span>
              </div>
              <div className="service-feature-item">
                <Coffee size={16} />
                <span>{t('services.loungeFeature2')}</span>
              </div>
              <div className="service-feature-item">
                <MapPin size={16} />
                <span>{t('services.loungeFeature3')}</span>
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => handleOpenBooking('lounge')} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
            {t('services.loungeCta')}
          </button>
        </div>

        {/* Dining & Cafes */}
        <div className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <img
              src="./images/dining.png"
              alt={t('services.diningTitle')}
              className="service-image"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Coffee style={{ color: 'var(--primary)' }} size={22} />
              <h3>{t('services.diningTitle')}</h3>
            </div>
            <p>{t('services.diningDesc')}</p>
            <div className="service-features" style={{ marginTop: '15px' }}>
              <div className="service-feature-item">
                <Clock size={16} />
                <span>{t('services.diningFeature1')}</span>
              </div>
              <div className="service-feature-item">
                <ShieldCheck size={16} />
                <span>{t('services.diningFeature2')}</span>
              </div>
              <div className="service-feature-item">
                <MapPin size={16} />
                <span>{t('services.diningFeature3')}</span>
              </div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => handleOpenBooking('dining')} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
            {t('services.diningCta')}
          </button>
        </div>

        {/* Duty Free */}
        <div className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <ShoppingBag size={80} style={{ color: 'rgba(14, 165, 233, 0.25)', position: 'absolute', transform: 'scale(1.2)' }} />
              <h2 style={{ fontSize: '24px', zIndex: 1, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{t('services.dutyFreeTitle')}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShoppingBag style={{ color: 'var(--primary)' }} size={22} />
              <h3>{t('services.dutyFreeTitle')}</h3>
            </div>
            <p>{t('services.dutyFreeDesc')}</p>
            <div className="service-features" style={{ marginTop: '15px' }}>
              <div className="service-feature-item">
                <Award size={16} />
                <span>{t('services.dutyFreeFeature1')}</span>
              </div>
              <div className="service-feature-item">
                <Clock size={16} />
                <span>{t('services.dutyFreeFeature2')}</span>
              </div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => handleOpenBooking('dutyfree')} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
            {t('services.dutyFreeCta')}
          </button>
        </div>

        {/* FastTrack VIP Pass (NEW!) */}
        <div className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Zap size={80} style={{ color: 'rgba(245, 158, 11, 0.25)', position: 'absolute', transform: 'scale(1.2)' }} />
              <h2 style={{ fontSize: '24px', zIndex: 1, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {isRtl ? 'المرور السريع VIP ⚡' : 'FastTrack VIP Pass ⚡'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap style={{ color: 'var(--accent)' }} size={22} />
              <h3>{isRtl ? 'المرور السريع الذكي (FastTrack)' : 'Smart FastTrack VIP'}</h3>
            </div>
            <p>
              {isRtl
                ? 'تخطَ الطوابير في فحص الجوازات والأمن النهائي عبر مسارات المرور السريع المخصصة. تجربة مغادرة سلسة دون أي تأخير في ثوانٍ معدودة.'
                : 'Skip passport and terminal security queues via dedicated FastTrack lanes. Experience immediate screening and fast boarding in seconds.'}
            </p>
            <div className="service-features" style={{ marginTop: '15px' }}>
              <div className="service-feature-item">
                <ShieldCheck size={16} />
                <span>{isRtl ? 'صلاحية لجميع الرحلات المغادرة الدولية والداخلية' : 'Valid for all international & domestic departures'}</span>
              </div>
              <div className="service-feature-item">
                <Clock size={16} />
                <span>{isRtl ? 'مفتوح 24 ساعة طوال أيام الأسبوع' : 'Open 24/7 all days'}</span>
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => handleOpenBooking('fastpass')} style={{ width: '100%', justifyContent: 'center', marginTop: '20px', background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}>
            {isRtl ? 'شراء بطاقة المرور السريع' : 'Purchase FastTrack Pass'}
          </button>
        </div>

        {/* Luxury Limousine (NEW!) */}
        <div className="glass-card service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #020617, #0f172a)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Car size={80} style={{ color: 'rgba(99, 102, 241, 0.25)', position: 'absolute', transform: 'scale(1.2)' }} />
              <h2 style={{ fontSize: '24px', zIndex: 1, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {isRtl ? 'الليموزين الفاخر 🚗' : 'Luxury Limousine 🚗'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Car style={{ color: 'var(--secondary)' }} size={22} />
              <h3>{isRtl ? 'ليموزين التنقل الفاخر' : 'Luxury Limousine Transfer'}</h3>
            </div>
            <p>
              {isRtl
                ? 'رحلتك الراقية لا تنتهي في المطار. احجز سيارة ليموزين فاخرة بسائق خاص من صالة الوصول لتوصلك إلى باب فندقك أو منزلك بأعلى درجات الرفاهية.'
                : 'Your premium journey continues outside the airport. Reserve a luxury private chauffeur drive from arrivals direct to your hotel.'}
            </p>
            <div className="service-features" style={{ marginTop: '15px' }}>
              <div className="service-feature-item">
                <Award size={16} />
                <span>{isRtl ? 'أسطول سيارات حديثة (مرسيدس S-Class)' : 'Modern luxury fleet (Mercedes S-Class)'}</span>
              </div>
              <div className="service-feature-item">
                <MapPin size={16} />
                <span>{isRtl ? 'الاستقبال من بوابة الحقائب مباشرة بالاسم' : 'Chauffeur greeting at baggage claim with name board'}</span>
              </div>
            </div>
          </div>
          <button className="btn-secondary" onClick={() => handleOpenBooking('limo')} style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
            {isRtl ? 'احجز ليموزين المطار' : 'Book Chauffeur Service'}
          </button>
        </div>

      </div>

      {/* Interactive Booking & Services Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 11, 19, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-focus)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '0'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              padding: '20px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} />
                <strong style={{ fontSize: '16px' }}>
                  {modalType === 'lounge' && (isRtl ? 'حجز صالة كبار الشخصيات VIP' : 'Book VIP Lounge')}
                  {modalType === 'limo' && (isRtl ? 'حجز ليموزين التنقل الفاخر' : 'Book Luxury Limousine')}
                  {modalType === 'fastpass' && (isRtl ? 'إصدار بطاقة المرور السريع ⚡' : 'Get FastTrack VIP Pass ⚡')}
                  {modalType === 'dining' && (isRtl ? 'استعراض مطاعم صالات المغادرة' : 'Departures Dining Directory')}
                  {modalType === 'dutyfree' && (isRtl ? 'تصفح كتالوج السوق الحرة المسبق' : 'Duty Free Pre-Order Catalog')}
                </strong>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {bookingConfirmed ? (
                /* Booking Success Ticket Card */
                <div style={{ textAlign: 'center', animation: 'fadeInUp 0.3s ease' }}>
                  {/* Error Display */}
                  {error && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid var(--status-delayed)',
                      color: 'var(--status-delayed)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      direction: isRtl ? 'rtl' : 'ltr'
                    }}>
                      {error}
                    </div>
                  )}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--status-ontime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px auto',
                    border: '2px solid var(--status-ontime)'
                  }}>
                    <Check size={32} />
                  </div>
                  <h3 style={{ color: 'var(--text-heading)', marginBottom: '10px' }}>
                    {isRtl ? 'تم تأكيد الحجز بنجاح!' : 'Booking Confirmed!'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                    {isRtl ? 'تم إصدار بطاقة الدخول الذكية برقم تسلسلي خاص.' : 'Your smart voucher has been generated with serial ID.'}
                  </p>

                  {/* Golden Voucher Ticket */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#fff',
                    textAlign: 'right',
                    position: 'relative',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                    marginBottom: '20px',
                    direction: isRtl ? 'rtl' : 'ltr'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '10px', marginBottom: '15px' }}>
                      <strong style={{ color: '#f59e0b', fontSize: '14px' }}>
                        {modalType === 'lounge' && 'AL-QALADA VIP LOUNGE'}
                        {modalType === 'limo' && 'CHAUFFEUR SERVICE'}
                        {modalType === 'fastpass' && 'FASTTRACK VIP PASS'}
                      </strong>
                      <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#cbd5e1' }}>{bookingTicketId}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>{isRtl ? 'اسم الراكب' : 'PASSENGER NAME'}</span>
                        <strong>{bookingForm.name || (isRtl ? 'أحمد علي' : 'Ahmad Ali')}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>{isRtl ? 'رقم الرحلة' : 'FLIGHT NO'}</span>
                          <strong style={{ fontFamily: 'Inter' }}>{bookingForm.flightNo.toUpperCase() || 'QA-301'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>{isRtl ? 'التاريخ المحدد' : 'DATE'}</span>
                          <strong style={{ fontFamily: 'Inter' }}>{bookingForm.date}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Footer QR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '12px', marginTop: '15px' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {isRtl ? '* يرجى إبراز هذا الكود عند البوابة مباشرة.' : '* Present this voucher code at entry point.'}
                        </p>
                      </div>
                      <div style={{ background: '#fff', padding: '4px', borderRadius: '4px' }}>
                        <QrCode size={40} style={{ color: '#000' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                      className="btn-secondary"
                      onClick={generatePDFReceipt}
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)'
                      }}
                    >
                      <Download size={16} />
                      <span>{isRtl ? 'حفظ الإيصال PDF' : 'Save Receipt PDF'}</span>
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => setModalOpen(false)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {isRtl ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Dynamic Booking Forms */
                <>
                  {(modalType === 'lounge' || modalType === 'limo' || modalType === 'fastpass') && (
                    <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {/* Flight Selection - Show if user has multiple flights */}
                      {userFlights.length > 1 && (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                            {isRtl ? 'اختر الرحلة' : 'Select Flight'}
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {userFlights.map((flight) => (
                              <div
                                key={flight.id}
                                onClick={() => {
                                  setSelectedFlight(flight);
                                  setBookingForm({
                                    ...bookingForm,
                                    name: flight.passengerName,
                                    flightNo: flight.flightNo,
                                    date: flight.departureDate
                                  });
                                }}
                                style={{
                                  padding: '12px',
                                  borderRadius: '8px',
                                  border: selectedFlight?.id === flight.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                  background: selectedFlight?.id === flight.id ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                  cursor: 'pointer',
                                  transition: 'var(--transition)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <Plane size={16} style={{ color: 'var(--primary)' }} />
                                  <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{flight.flightNo}</strong>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                  {flight.from} → {flight.to} | {flight.departureDate}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'الاسم الكامل للمسافر' : 'Passenger Full Name'}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={isRtl ? 'مثال: أحمد علي' : 'e.g. Ahmad Ali'}
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                          required
                          style={{ textAlign: isRtl ? 'right' : 'left' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'رقم رحلتك المعتمد' : 'Flight Number'}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. QA-301"
                          value={bookingForm.flightNo}
                          onChange={(e) => setBookingForm({ ...bookingForm, flightNo: e.target.value })}
                          required
                          style={{ textAlign: isRtl ? 'right' : 'left', textTransform: 'uppercase' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'تاريخ السفر' : 'Travel Date'}</label>
                        <input
                          type="date"
                          className="form-control"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          required
                          style={{ textAlign: isRtl ? 'right' : 'left' }}
                        />
                      </div>

                      {modalType === 'lounge' && (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'عدد الضيوف والمرافقين' : 'Number of Guests'}</label>
                          <select
                            className="form-control"
                            value={bookingForm.details}
                            onChange={(e) => setBookingForm({ ...bookingForm, details: e.target.value })}
                            style={{ textAlign: isRtl ? 'right' : 'left' }}
                          >
                            <option value="1">{isRtl ? 'مسافر واحد' : '1 Passenger'}</option>
                            <option value="2">{isRtl ? 'مسافرين (2)' : '2 Guests'}</option>
                            <option value="3">{isRtl ? '3 مرافقين' : '3 Guests'}</option>
                            <option value="4">{isRtl ? 'عائلة (4 أشخاص)' : 'Family (4 guests)'}</option>
                          </select>
                        </div>
                      )}

                      {modalType === 'limo' && (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'وجهة التوصيل المطلوبة بالرياض' : 'Destination Address'}</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={isRtl ? 'مثال: فندق الفرسان، حي الملقا' : 'e.g. Ritz Carlton Hotel'}
                            value={bookingForm.details}
                            onChange={(e) => setBookingForm({ ...bookingForm, details: e.target.value })}
                            required
                            style={{ textAlign: isRtl ? 'right' : 'left' }}
                          />
                        </div>
                      )}

                      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
                        {loading ? (isRtl ? 'جاري الحجز...' : 'Processing...') : (isRtl ? 'تأكيد وحجز الخدمة الفاخرة' : 'Confirm Luxury Reservation')}
                      </button>
                    </form>
                  )}

                  {modalType === 'dining' && (
                    /* Restaurants Directory list */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Utensils style={{ color: 'var(--primary)' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{isRtl ? 'مطعم الفيروز التركي' : 'Al-Fayrouz Turkish Restaurant'}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isRtl ? 'موقع: صالة المغادرة 1، الدور الأرضي' : 'Location: Departure Hall 1, Ground Floor'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Coffee style={{ color: 'var(--primary)' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{isRtl ? 'مقهى دبلن كوفي' : 'Dublin Coffee Roasters'}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isRtl ? 'موقع: صالة المغادرة 2 بجوار البوابة A6' : 'Location: Departure Hall 2 near Gate A6'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <Utensils style={{ color: 'var(--accent)' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{isRtl ? 'شاورما القلادة الشهيرة' : 'Al-Qalada Signature Shawarma'}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isRtl ? 'موقع: صالة المغادرة الدولية، صالة الطعام' : 'Location: International Departures, Food Court'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalType === 'dutyfree' && (
                    /* Duty free pre-order list with Add to Cart */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {isRtl ? 'احجز منتجاتك المفضلة مجاناً الآن واستلمها من منفذ السوق الحرة ببوابة المغادرة مباشرة مع بوردنج السفر.' : 'Pre-order items free of tax & duty. Pick up at departure gate counter.'}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {dutyFreeItems.map(item => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '24px' }}>{item.icon}</span>
                              <div>
                                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{isRtl ? item.nameAr : item.nameEn}</h4>
                                <strong style={{ color: 'var(--primary)', fontSize: '13px', fontFamily: 'Inter' }}>{item.price} {isRtl ? 'ر.س' : 'SAR'}</strong>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '20px' }}
                            >
                              {isRtl ? 'طلب مسبق +' : 'Pre-Order +'}
                            </button>
                          </div>
                        ))}
                      </div>

                      {cart.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                            <span>{isRtl ? 'المنتجات المطلوبة مسبقاً:' : 'Pre-ordered Items:'} ({cart.length})</span>
                            <button onClick={clearCart} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                              {isRtl ? 'حذف الكل' : 'Clear All'}
                            </button>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px' }}>
                            {cart.map((cItem, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: i === cart.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                                <span>{isRtl ? cItem.nameAr : cItem.nameEn}</span>
                                <strong style={{ fontFamily: 'Inter' }}>{cItem.price} {isRtl ? 'ر.س' : 'SAR'}</strong>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px', fontWeight: 'bold', fontSize: '13px', color: 'var(--accent)' }}>
                              <span>{isRtl ? 'المجموع المستحق عند الاستلام:' : 'Total due at gate:'}</span>
                              <span style={{ fontFamily: 'Inter' }}>{cart.reduce((sum, current) => sum + current.price, 0)} {isRtl ? 'ر.س' : 'SAR'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
