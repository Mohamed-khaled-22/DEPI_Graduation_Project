import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, ArrowLeft, CheckCircle, Clock, MapPin, Calendar, User, Award, Printer, QrCode, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function FlightDetails() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
  const { getUserBookings, deleteBooking } = useBooking();
  
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBaggageTag, setShowBaggageTag] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const isRtl = locale === 'ar';

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('auth_return_url', '/flight-details');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser?.email) {
      const userBookings = getUserBookings(currentUser.email);
      setBookings(userBookings);
      if (userBookings.length > 0) {
        setSelectedBooking(userBookings[0]);
      }
    }
  }, [currentUser, getUserBookings]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBooking = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelPopup(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      deleteBooking(bookingToCancel);
      const updatedBookings = bookings.filter(b => b.id !== bookingToCancel);
      setBookings(updatedBookings);
      if (selectedBooking?.id === bookingToCancel) {
        setSelectedBooking(updatedBookings.length > 0 ? updatedBookings[0] : null);
      }
      setShowCancelPopup(false);
      setBookingToCancel(null);
    }
  };

  const getCabinClassLabel = (cabinClass) => {
    switch (cabinClass) {
      case 'business':
        return isRtl ? 'درجة الأعمال 💼' : 'Business Class 💼';
      case 'first':
        return isRtl ? 'الدرجة الأولى 👑' : 'First Class 👑';
      default:
        return isRtl ? 'الدرجة السياحية ✈️' : 'Economy Class ✈️';
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' },
      pending: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' },
      cancelled: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }
    };
    const style = statusStyles[status] || statusStyles.confirmed;
    const statusLabels = {
      confirmed: isRtl ? 'مؤكد' : 'Confirmed',
      pending: isRtl ? 'قيد الانتظار' : 'Pending',
      cancelled: isRtl ? 'ملغي' : 'Cancelled'
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        ...style
      }}>
        {statusLabels[status] || statusLabels.confirmed}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          <Plane size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>
            {isRtl ? 'لا توجد حجوزات' : 'No Bookings Found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            {isRtl ? 'لم تقم بأي حجوزات بعد. احجز رحلتك الآن!' : 'You haven\'t made any bookings yet. Book your trip now!'}
          </p>
          <button className="btn-primary" onClick={() => navigate('/booking')} style={{ justifyContent: 'center' }}>
            <Plane size={18} />
            {isRtl ? 'احجز رحلتك الآن' : 'Book Your Trip Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          {isRtl ? 'تفاصيل رحلتك' : 'Flight Details'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isRtl ? 'عرض تفاصيل حجوزاتك ومعلومات الرحلة' : 'View your booking details and flight information'}
        </p>
      </div>

      {/* Booking Selector */}
      {bookings.length > 1 && (
        <div className="glass-card" style={{ marginBottom: '30px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-heading)' }}>
            {isRtl ? 'حجوزاتك' : 'Your Bookings'}
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {bookings.map((booking, index) => (
              <button
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: selectedBooking?.id === booking.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedBooking?.id === booking.id ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                  color: selectedBooking?.id === booking.id ? '#fff' : 'var(--text-main)',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {booking.flightNo} - {booking.to}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedBooking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Boarding Pass Card */}
          <div className="boarding-pass-card" style={{
            direction: isRtl ? 'rtl' : 'ltr',
            border: selectedBooking.cabinClass === 'first' ? '2px solid #f59e0b' : (selectedBooking.cabinClass === 'business' ? '2px solid var(--secondary)' : '1px solid var(--border-color)'),
            boxShadow: selectedBooking.cabinClass === 'first' ? '0 10px 30px rgba(245, 158, 11, 0.15)' : 'var(--shadow-lg)'
          }}>
            
            {/* Premium Badge */}
            {selectedBooking.cabinClass !== 'economy' && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: isRtl ? '15px' : 'auto',
                right: isRtl ? 'auto' : '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: selectedBooking.cabinClass === 'first' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                color: selectedBooking.cabinClass === 'first' ? '#f59e0b' : 'var(--secondary)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                <Award size={12} />
                <span>{getCabinClassLabel(selectedBooking.cabinClass)}</span>
              </div>
            )}

            <div className="ticket-header" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane style={{ transform: isRtl ? 'rotate(-45deg)' : 'rotate(45deg)', color: selectedBooking.cabinClass === 'first' ? '#f59e0b' : 'var(--primary)' }} />
                <strong style={{ color: 'var(--text-heading)' }}>{isRtl ? 'بطاقة الصعود' : 'Boarding Pass'}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusBadge(selectedBooking.status)}
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {getCabinClassLabel(selectedBooking.cabinClass)}
                </span>
              </div>
            </div>

            <div className="ticket-airport-codes" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div className="airport-code-box" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <h2>{selectedBooking.from}</h2>
                <p>{selectedBooking.fromFull}</p>
              </div>
              <Plane size={24} className="ticket-flight-icon" style={{ color: 'var(--primary)', transform: isRtl ? 'rotate(0deg)' : 'scaleX(-1)' }} />
              <div className="airport-code-box" style={{ textAlign: isRtl ? 'left' : 'right' }}>
                <h2>{selectedBooking.to}</h2>
                <p>{selectedBooking.toFull}</p>
              </div>
            </div>

            <div className="ticket-details" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <div className="ticket-details-item">
                <span>{isRtl ? 'اسم المسافر' : 'Passenger Name'}</span>
                <strong style={{ color: 'var(--text-heading)' }}>{selectedBooking.passengerName}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'رقم الرحلة' : 'Flight Number'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.flightNo}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'المقعد' : 'Seat'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--primary)' }}>{selectedBooking.seat}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'البوابة' : 'Gate'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.gate}</strong>
              </div>
            </div>

            <div className="ticket-details" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', textAlign: isRtl ? 'right' : 'left' }}>
              <div className="ticket-details-item">
                <span>{isRtl ? 'تاريخ المغادرة' : 'Departure Date'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.departureDate}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'وقت المغادرة' : 'Departure Time'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.departureTime}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'وقت الوصول' : 'Arrival Time'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.arrivalTime}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'المبنى' : 'Terminal'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.terminal}</strong>
              </div>
            </div>

            <div className="ticket-details" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', textAlign: isRtl ? 'right' : 'left' }}>
              <div className="ticket-details-item">
                <span>{isRtl ? 'رقم الحجز' : 'Booking ID'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--accent)', letterSpacing: '1px' }}>{selectedBooking.id}</strong>
              </div>
              <div className="ticket-details-item">
                <span>{isRtl ? 'عدد المسافرين' : 'Passengers'}</span>
                <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{selectedBooking.passengers}</strong>
              </div>
              {selectedBooking.price && (
                <div className="ticket-details-item">
                  <span>{isRtl ? 'سعر التذكرة' : 'Ticket Price'}</span>
                  <strong style={{ fontFamily: 'Inter', color: '#10b981', fontSize: '16px' }}>{selectedBooking.price} {isRtl ? 'ر.س' : 'SAR'}</strong>
                </div>
              )}
            </div>

            <div className="ticket-footer" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{isRtl ? 'ملاحظة هامة' : 'Important Note'}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isRtl ? 'يرجى التواجد في البوابة قبل 30 دقيقة من وقت المغادرة' : 'Please be at the gate 30 minutes before departure'}
                </p>
              </div>
              <div className="ticket-qr">
                <div style={{ width: '60px', height: '60px', background: '#000', display: 'flex', flexWrap: 'wrap', padding: '2px' }}>
                  <div style={{ width: '100%', height: '100%', border: '4px solid #fff', background: '#000', boxSizing: 'border-box', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '4px', left: '4px', width: '12px', height: '12px', background: '#fff' }}></div>
                    <div style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', background: '#fff' }}></div>
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '12px', height: '12px', background: '#fff' }}></div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '8px', height: '8px', background: '#fff' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Luggage Tag */}
          {showBaggageTag && (
            <div className="glass-card animate-fade-in" style={{
              direction: isRtl ? 'rtl' : 'ltr',
              border: '2px dashed var(--primary)',
              background: 'rgba(14, 165, 233, 0.03)',
              padding: '24px',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
                  <Award style={{ color: 'var(--primary)' }} />
                  {isRtl ? 'بطاقة الأمتعة الذكية 🏷️' : 'Smart Luggage Baggage Tag 🏷️'}
                </h3>
                <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {isRtl ? 'جاهز للمطابقة' : 'READY TO MATCH'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'مالك الأمتعة' : 'PASSENGER'}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{selectedBooking.passengerName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'الوجهة' : 'DESTINATION'}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{selectedBooking.from} → {selectedBooking.to}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'رقم الرحلة' : 'FLIGHT'}</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{selectedBooking.flightNo}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {isRtl ? '* ثبت هذه البطاقة على حقائبك المشحونة بكونتر المطار.' : '* Attach this tag to your checked bag at airport check-in.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '2px', background: 'var(--text-heading)', padding: '6px 12px', borderRadius: '4px' }}>
                    <div style={{ width: '2px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '4px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '3px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '4px', height: '30px', background: 'var(--text-inverse)' }}></div>
                    <div style={{ width: '2px', height: '30px', background: 'var(--text-inverse)' }}></div>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)' }}>*LUG-{selectedBooking.id.slice(-6)}*</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }} className="no-print">
            {!showBaggageTag && (
              <button className="btn-secondary" onClick={() => setShowBaggageTag(true)} style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                <Award size={16} />
                <span>{isRtl ? 'إصدار كرت الحقائق ذكي' : 'Generate Luggage Tag'}</span>
              </button>
            )}

            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>{isRtl ? 'طباعة البطاقة' : 'Print Boarding Pass'}</span>
            </button>

            <button 
              className="btn-secondary" 
              onClick={() => handleCancelBooking(selectedBooking.id)} 
              style={{ border: '1px solid #ef4444', color: '#ef4444' }}
            >
              <X size={16} />
              <span>{isRtl ? 'إلغاء الرحلة' : 'Cancel Flight'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Popup */}
      {showCancelPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          direction: isRtl ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{
            padding: '30px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            textAlign: isRtl ? 'right' : 'left',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <X size={24} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '20px', color: 'var(--text-heading)', margin: 0 }}>
                {isRtl ? 'تأكيد إلغاء الرحلة' : 'Cancel Flight'}
              </h3>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.6' }}>
              {isRtl ? 'هل أنت متأكد من إلغاء هذه الرحلة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to cancel this flight? This action cannot be undone.'}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowCancelPopup(false);
                  setBookingToCancel(null);
                }}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--text-main)'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className="btn-primary"
                onClick={confirmCancelBooking}
                style={{
                  padding: '12px 24px',
                  background: '#ef4444',
                  border: '1px solid #ef4444'
                }}
              >
                {isRtl ? 'نعم، إلغاء الرحلة' : 'Yes, Cancel Flight'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
