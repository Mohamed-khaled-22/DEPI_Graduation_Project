import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, User, Phone, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

// Flight pricing structure (same as in BookingContext)
const FLIGHT_PRICING = {
  basePrices: {
    economy: 500,
    business: 1500,
    first: 3000
  },
  baggagePrice: 100,
  routeMultipliers: {
    domestic: 1.0,
    international: 1.5
  }
};

export default function Booking() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
  const { createBooking, getUserBookings, calculateFlightPrice } = useBooking();

  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('auth_return_url', '/booking');
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  const isRtl = locale === 'ar';

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || '',
    email: currentUser?.email || '',
    phone: '',
    passportNumber: '',
    from: 'RUH',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    baggageCount: 0,
    cabinClass: 'economy'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showConflictPopup, setShowConflictPopup] = useState(false);

  // Calculate estimated price for display
  const estimatedPrice = formData.to ? calculateFlightPrice(formData.cabinClass, formData.baggageCount, formData.from, formData.to, formData.passengers) : 0;

  const airports = [
    { code: 'RUH', nameAr: 'الرياض', nameEn: 'Riyadh' },
    { code: 'JED', nameAr: 'جدة', nameEn: 'Jeddah' },
    { code: 'DXB', nameAr: 'دبي', nameEn: 'Dubai' },
    { code: 'CAI', nameAr: 'القاهرة', nameEn: 'Cairo' },
    { code: 'LHR', nameAr: 'لندن', nameEn: 'London' },
    { code: 'CDG', nameAr: 'باريس', nameEn: 'Paris' },
    { code: 'IST', nameAr: 'إسطنبول', nameEn: 'Istanbul' },
    { code: 'NYC', nameAr: 'نيويورك', nameEn: 'New York' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = isRtl ? 'الاسم الكامل مطلوب' : 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRtl ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = isRtl ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }
    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = isRtl ? 'رقم جواز السفر مطلوب' : 'Passport number is required';
    }
    if (!formData.to) {
      newErrors.to = isRtl ? 'الوجهة مطلوبة' : 'Destination is required';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = isRtl ? 'تاريخ المغادرة مطلوب' : 'Departure date is required';
    }
    if (formData.passengers < 1 || formData.passengers > 9) {
      newErrors.passengers = isRtl ? 'عدد المسافرين يجب أن يكون بين 1 و 9' : 'Passengers must be between 1 and 9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for existing bookings within the first week of departure date
      const userBookings = getUserBookings(formData.email);
      const departureDate = new Date(formData.departureDate);
      const weekBefore = new Date(departureDate);
      weekBefore.setDate(weekBefore.getDate() - 7);
      const weekAfter = new Date(departureDate);
      weekAfter.setDate(weekAfter.getDate() + 7);

      const hasConflict = userBookings.some(
        booking => {
          const bookingDate = new Date(booking.departureDate);
          return bookingDate >= weekBefore && 
                 bookingDate <= weekAfter && 
                 booking.status !== 'cancelled';
        }
      );

      if (hasConflict) {
        setShowConflictPopup(true);
        setIsSubmitting(false);
        return;
      }

      // Calculate total price
      const price = calculateFlightPrice(formData.cabinClass, formData.baggageCount, formData.from, formData.to, formData.passengers);
      
      // Prepare booking data
      const fromAirport = airports.find(a => a.code === formData.from);
      const toAirport = airports.find(a => a.code === formData.to);

      const flightNo = `QA-${Math.floor(Math.random() * 900) + 100}`;
      const gate = ['A12', 'B15', 'C08', 'D22', 'E05'][Math.floor(Math.random() * 5)];
      const seat = `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`;
      const departureTime = `${Math.floor(Math.random() * 12) + 6}:${Math.random() > 0.5 ? '30' : '00'}`;
      const arrivalTime = `${parseInt(departureTime.split(':')[0]) + Math.floor(Math.random() * 4) + 2}:${departureTime.split(':')[1]}`;

      const bookingData = {
        userEmail: formData.email,
        passengerName: formData.fullName,
        phone: formData.phone,
        passportNumber: formData.passportNumber,
        flightNo,
        from: formData.from,
        fromFull: isRtl ? fromAirport.nameAr : fromAirport.nameEn,
        to: formData.to,
        toFull: isRtl ? toAirport.nameAr : toAirport.nameEn,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        departureTime,
        arrivalTime,
        gate,
        seat,
        passengers: formData.passengers,
        baggageCount: formData.baggageCount,
        cabinClass: formData.cabinClass,
        price: price,
        terminal: ['T1', 'T2', 'T3'][Math.floor(Math.random() * 3)]
      };

      // Navigate to payment page
      navigate('/payment', { state: { bookingData, totalPrice: price } });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Booking error:', error);
      alert(isRtl ? 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.' : 'An error occurred during booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleViewBooking = () => {
    navigate('/flight-details');
  };

  if (bookingSuccess && createdBooking) {
    return (
      <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          
          <h2 style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--text-heading)' }}>
            {isRtl ? 'تم الحجز بنجاح!' : 'Booking Successful!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            {isRtl ? 'تم تأكيد حجز رحلتك بنجاح. يمكنك عرض تفاصيل رحلتك من خلال صفحة تفاصيل الرحلة.' : 'Your flight has been successfully booked. You can view your trip details in the Flight Details page.'}
          </p>

          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.2)', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '30px',
            textAlign: isRtl ? 'right' : 'left'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-heading)' }}>
              {isRtl ? 'ملخص الحجز' : 'Booking Summary'}
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'رقم الرحلة' : 'Flight No'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.flightNo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'من' : 'From'}:</span>
                <strong>{createdBooking.from} ({createdBooking.fromFull})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'إلى' : 'To'}:</span>
                <strong>{createdBooking.to} ({createdBooking.toFull})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'تاريخ المغادرة' : 'Departure Date'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.departureDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'وقت المغادرة' : 'Departure Time'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.departureTime}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'رقم جواز السفر' : 'Passport Number'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.passportNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'البوابة' : 'Gate'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.gate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{isRtl ? 'المقعد' : 'Seat'}:</span>
                <strong style={{ fontFamily: 'Inter' }}>{createdBooking.seat}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={handleViewBooking} style={{ justifyContent: 'center' }}>
              <Plane size={18} />
              {isRtl ? 'عرض تفاصيل رحلتك' : 'View Flight Details'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setBookingSuccess(false);
                setCreatedBooking(null);
                setFormData({
                  fullName: currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || '',
                  email: currentUser?.email || '',
                  phone: '',
                  passportNumber: '',
                  from: 'RUH',
                  to: '',
                  departureDate: '',
                  returnDate: '',
                  passengers: 1,
                  baggageCount: 0,
                  cabinClass: 'economy'
                });
              }}
              style={{ justifyContent: 'center' }}
            >
              {isRtl ? 'حجز رحلة أخرى' : 'Book Another Trip'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          {isRtl ? 'احجز رحلتك الآن' : 'Book Your Trip Now'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isRtl ? 'اكتشف العالم مع مطار القلادة الدولي. احجز رحلتك بكل سهولة وأمان.' : 'Discover the world with Al-Qilada International Airport. Book your trip with ease and security.'}
        </p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Passenger Information */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
              <User size={20} style={{ color: 'var(--primary)' }} />
              {isRtl ? 'معلومات المسافر' : 'Passenger Information'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder={isRtl ? 'أحمد محمد' : 'Ahmad Mohammed'}
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
                {errors.fullName && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  style={{ textAlign: isRtl ? 'right' : 'left', background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                />
                {errors.email && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'رقم الهاتف' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+966 5X XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter' }}
                />
                {errors.phone && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'رقم جواز السفر' : 'Passport Number'} *
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  className="form-control"
                  placeholder={isRtl ? 'A1234567' : 'A1234567'}
                  value={formData.passportNumber}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter', textTransform: 'uppercase' }}
                />
                {errors.passportNumber && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.passportNumber}</span>}
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
              <Plane size={20} style={{ color: 'var(--primary)' }} />
              {isRtl ? 'تفاصيل الرحلة' : 'Flight Details'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'من' : 'From'}
                </label>
                <select
                  name="from"
                  className="form-control"
                  value={formData.from}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  {airports.map(airport => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {isRtl ? airport.nameAr : airport.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'إلى' : 'To'} *
                </label>
                <select
                  name="to"
                  className="form-control"
                  value={formData.to}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <option value="">{isRtl ? 'اختر الوجهة' : 'Select Destination'}</option>
                  {airports.filter(a => a.code !== formData.from).map(airport => (
                    <option key={airport.code} value={airport.code}>
                      {airport.code} - {isRtl ? airport.nameAr : airport.nameEn}
                    </option>
                  ))}
                </select>
                {errors.to && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.to}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'تاريخ المغادرة' : 'Departure Date'} *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  className="form-control"
                  value={formData.departureDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter' }}
                />
                {errors.departureDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.departureDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'تاريخ العودة (اختياري)' : 'Return Date (Optional)'}
                </label>
                <input
                  type="date"
                  name="returnDate"
                  className="form-control"
                  value={formData.returnDate}
                  onChange={handleChange}
                  min={formData.departureDate || new Date().toISOString().split('T')[0]}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter' }}
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
              {isRtl ? 'خيارات إضافية' : 'Additional Options'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'عدد المسافرين' : 'Passengers'}
                </label>
                <input
                  type="number"
                  name="passengers"
                  className="form-control"
                  min="1"
                  max="9"
                  value={formData.passengers}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter' }}
                />
                {errors.passengers && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.passengers}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'عدد الحقائب' : 'Baggage Count'}
                </label>
                <input
                  type="number"
                  name="baggageCount"
                  className="form-control"
                  min="0"
                  max="10"
                  value={formData.baggageCount}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left', fontFamily: 'Inter' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {isRtl ? '100 ر.س لكل حقيبة إضافية' : '100 SAR per additional baggage'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  {isRtl ? 'درجة السفر' : 'Cabin Class'}
                </label>
                <select
                  name="cabinClass"
                  className="form-control"
                  value={formData.cabinClass}
                  onChange={handleChange}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <option value="economy">{isRtl ? 'الدرجة السياحية (500 ر.س)' : 'Economy (500 SAR)'}</option>
                  <option value="business">{isRtl ? 'درجة الأعمال (1500 ر.س)' : 'Business (1500 SAR)'}</option>
                  <option value="first">{isRtl ? 'الدرجة الأولى (3000 ر.س)' : 'First Class (3000 SAR)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {formData.to && (
            <div style={{
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px'
            }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-heading)', marginBottom: '15px' }}>
                {isRtl ? 'ملخص السعر' : 'Price Summary'}
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isRtl ? 'السعر الأساسي' : 'Base Price'}
                  </span>
                  <span style={{ fontFamily: 'Inter' }}>
                    {FLIGHT_PRICING.basePrices[formData.cabinClass]} {isRtl ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isRtl ? 'الحقائق الإضافية' : 'Extra Baggage'}
                  </span>
                  <span style={{ fontFamily: 'Inter' }}>
                    {formData.baggageCount * FLIGHT_PRICING.baggagePrice} {isRtl ? 'ر.س' : 'SAR'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isRtl ? 'عدد المسافرين' : 'Passengers'}
                  </span>
                  <span style={{ fontFamily: 'Inter' }}>
                    x{formData.passengers}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '12px', 
                  marginTop: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ color: 'var(--text-heading)' }}>
                    {isRtl ? 'الإجمالي المقدر' : 'Estimated Total'}
                  </span>
                  <span style={{ color: 'var(--primary)', fontFamily: 'Inter', fontSize: '18px' }}>
                    {estimatedPrice} {isRtl ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '16px' }}
          >
            {isSubmitting ? (
              isRtl ? 'جاري الحجز...' : 'Processing...'
            ) : (
              <>
                {isRtl ? 'تأكيد الحجز' : 'Confirm Booking'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Conflict Popup */}
      {showConflictPopup && (
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
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} style={{ color: '#f59e0b' }} />
              </div>
              <h3 style={{ fontSize: '20px', color: 'var(--text-heading)', margin: 0 }}>
                {isRtl ? 'تعارض في الموعد' : 'Schedule Conflict'}
              </h3>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.6' }}>
              {isRtl ? 'لديك رحلة أخرى محجوزة خلال أول أسبوع من هذا التاريخ. يرجى اختيار تاريخ آخر.' : 'You already have another flight booked within the first week of this date. Please choose a different date.'}
            </p>
            
            <button
              className="btn-primary"
              onClick={() => setShowConflictPopup(false)}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 24px'
              }}
            >
              {isRtl ? 'حسناً' : 'OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
