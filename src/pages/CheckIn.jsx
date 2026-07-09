import React, { useState } from 'react';
import { Plane, Search, ArrowLeft, ArrowRight, CheckCircle, Award, Sparkles, Download, Printer, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CheckIn() {
  const { locale, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  // Cabin Class Select state
  const [selectedClass, setSelectedClass] = useState('economy'); // 'economy' | 'business' | 'first'
  
  // Interactive Baggage Tag State
  const [showBaggageTag, setShowBaggageTag] = useState(false);
  const [baggageWeight, setBaggageWeight] = useState(23);

  // Seat structure based on Class
  const seatRowsEconomy = [
    { row: 1, seats: [{ num: '1A', status: 'occupied' }, { num: '1B', status: 'available' }, { num: '1C', status: 'available' }, { num: '1D', status: 'occupied' }, { num: '1E', status: 'available' }, { num: '1F', status: 'occupied' }] },
    { row: 2, seats: [{ num: '2A', status: 'available' }, { num: '2B', status: 'occupied' }, { num: '2C', status: 'available' }, { num: '2D', status: 'available' }, { num: '2E', status: 'available' }, { num: '2F', status: 'available' }] },
    { row: 3, seats: [{ num: '3A', status: 'available' }, { num: '3B', status: 'available' }, { num: '3C', status: 'available' }, { num: '3D', status: 'occupied' }, { num: '3E', status: 'occupied' }, { num: '3F', status: 'available' }] },
    { row: 4, seats: [{ num: '4A', status: 'occupied' }, { num: '4B', status: 'available' }, { num: '4C', status: 'occupied' }, { num: '4D', status: 'available' }, { num: '4E', status: 'available' }, { num: '4F', status: 'occupied' }] },
    { row: 5, seats: [{ num: '5A', status: 'available' }, { num: '5B', status: 'available' }, { num: '5C', status: 'available' }, { num: '5D', status: 'available' }, { num: '5E', status: 'occupied' }, { num: '5F', status: 'available' }] }
  ];

  const seatRowsBusiness = [
    { row: 1, seats: [{ num: '1A', status: 'occupied' }, { num: '1B', status: 'available' }, { num: '1E', status: 'available' }, { num: '1F', status: 'occupied' }] },
    { row: 2, seats: [{ num: '2A', status: 'available' }, { num: '2B', status: 'available' }, { num: '2E', status: 'occupied' }, { num: '2F', status: 'available' }] },
    { row: 3, seats: [{ num: '3A', status: 'available' }, { num: '3B', status: 'occupied' }, { num: '3E', status: 'available' }, { num: '3F', status: 'available' }] }
  ];

  const seatRowsFirst = [
    { row: 1, seats: [{ num: '1A', status: 'available' }, { num: '1F', status: 'occupied' }] },
    { row: 2, seats: [{ num: '2A', status: 'occupied' }, { num: '2F', status: 'available' }] }
  ];

  const seatRows = selectedClass === 'first' ? seatRowsFirst : (selectedClass === 'business' ? seatRowsBusiness : seatRowsEconomy);

  const isRtl = locale === 'ar';

  const [passenger, setPassenger] = useState({
    nameAr: 'أحمد علي',
    nameEn: 'Ahmad Ali',
    flightNo: 'QA-301',
    from: 'RUH',
    fromFullAr: 'الرياض (RUH)',
    fromFullEn: 'Riyadh (RUH)',
    to: 'LHR',
    toFullAr: 'لندن (LHR)',
    toFullEn: 'London (LHR)',
    date: '2026-06-02',
    time: '08:30',
    gate: 'A12',
    classAr: 'الدرجة السياحية (Economy)',
    classEn: 'Economy Class'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (bookingRef.trim().length === 6 && lastName.trim().length > 0) {
      setPassenger(prev => ({
        ...prev,
        nameAr: `الـأحمد / أحمد`,
        nameEn: `${lastName.toUpperCase()} / AHMAD`
      }));
      setStep(2);
    } else {
      alert(t('checkin.validationAlert'));
    }
  };

  const handleSeatSelect = (seatNum) => {
    setSelectedSeat(seatNum);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('checkin.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('checkin.subtitle')}</p>
      </div>

      <div className="checkin-container">
        {/* Step indicator */}
        <div className="steps-indicator" style={{ flexDirection: isRtl ? 'row' : 'row', marginBottom: '30px' }}>
          <div className={`step-bubble ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
          <div className={`step-bubble ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
          <div className={`step-bubble ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Step 1: Find Booking */}
        {step === 1 && (
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search style={{ color: 'var(--primary)' }} />
              {t('checkin.searchTitle')}
            </h3>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('checkin.pnrLabel')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t('checkin.pnrPlaceholder')} 
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  style={{ textTransform: 'uppercase', fontFamily: 'Inter', letterSpacing: '2px', textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('checkin.lastNameLabel')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t('checkin.lastNamePlaceholder')} 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
              
              {/* Premium Cabin Selection */}
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{isRtl ? 'درجة السفر والصالون' : 'Cabin Traveling Class'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedClass('economy'); setBaggageWeight(23); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: selectedClass === 'economy' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedClass === 'economy' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                      color: selectedClass === 'economy' ? '#fff' : 'var(--text-main)',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'السياحية' : 'Economy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedClass('business'); setBaggageWeight(32); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: selectedClass === 'business' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedClass === 'business' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                      color: selectedClass === 'business' ? '#fff' : 'var(--text-main)',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'الأعمال VIP' : 'Business'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedClass('first'); setBaggageWeight(40); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: selectedClass === 'first' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedClass === 'first' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                      color: selectedClass === 'first' ? '#fff' : 'var(--text-main)',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'الدرجة الأولى' : 'First Class'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {t('checkin.btnNext')}
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Seat Selection */}
        {step === 2 && (
          <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '15px' }}>{t('checkin.seatTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              {t('checkin.passenger')}: {isRtl ? passenger.nameAr : passenger.nameEn} | {t('checkin.flight')}: {passenger.flightNo}
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '10px', marginRight: '10px' }}>
                ({selectedClass === 'first' ? (isRtl ? 'الدرجة الأولى 👑' : 'First Class 👑') : (selectedClass === 'business' ? (isRtl ? 'درجة الأعمال 💼' : 'Business Class 💼') : (isRtl ? 'الدرجة السياحية ✈️' : 'Economy Class ✈️'))})
              </span>
            </p>

            <div className="seat-map-container">
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '20px',
                fontWeight: 'bold',
                color: 'var(--primary)',
                fontSize: '14px'
              }}>
                {t('checkin.cockpit')}
              </div>

              {seatRows.map((rowObj) => (
                <div key={rowObj.row} className="seat-row" style={{ flexDirection: 'row' }}>
                  {/* Left seats A, B, C */}
                  {rowObj.seats.slice(0, rowObj.seats.length / 2).map((seat) => (
                    <button 
                      key={seat.num}
                      disabled={seat.status === 'occupied'}
                      className={`seat ${seat.status === 'occupied' ? 'occupied' : ''} ${selectedSeat === seat.num ? 'selected' : ''}`}
                      onClick={() => handleSeatSelect(seat.num)}
                    >
                      {seat.num}
                    </button>
                  ))}

                  {/* Aisle */}
                  <div className="seat-aisle" style={{ fontSize: '11px' }}>{t('checkin.aisle')}</div>

                  {/* Right seats D, E, F */}
                  {rowObj.seats.slice(rowObj.seats.length / 2, rowObj.seats.length).map((seat) => (
                    <button 
                      key={seat.num}
                      disabled={seat.status === 'occupied'}
                      className={`seat ${seat.status === 'occupied' ? 'occupied' : ''} ${selectedSeat === seat.num ? 'selected' : ''}`}
                      onClick={() => handleSeatSelect(seat.num)}
                    >
                      {seat.num}
                    </button>
                  ))}
                </div>
              ))}

              <div className="seat-legend" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)' }}></div>
                  <span>{t('checkin.available')}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'var(--primary)' }}></div>
                  <span>{t('checkin.selected')}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}></div>
                  <span>{t('checkin.occupied')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                {t('checkin.btnBack')}
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, justifyContent: 'center' }} 
                disabled={!selectedSeat}
                onClick={() => setStep(3)}
              >
                {t('checkin.btnGenerate')}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Boarding Pass Printout & Luggage tag */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* The Premium Boarding Pass Card */}
            <div className="boarding-pass-card" style={{
              direction: isRtl ? 'rtl' : 'ltr',
              border: selectedClass === 'first' ? '2px solid #f59e0b' : (selectedClass === 'business' ? '2px solid var(--secondary)' : '1px solid var(--border-color)'),
              boxShadow: selectedClass === 'first' ? '0 10px 30px rgba(245, 158, 11, 0.15)' : 'var(--shadow-lg)'
            }}>
              
              {/* Card Gold Sparkle for Premium Cabin Classes */}
              {selectedClass !== 'economy' && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: isRtl ? '15px' : 'auto',
                  right: isRtl ? 'auto' : '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: selectedClass === 'first' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                  color: selectedClass === 'first' ? '#f59e0b' : 'var(--secondary)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  <Sparkles size={12} />
                  <span>{selectedClass === 'first' ? (isRtl ? 'الدرجة الأولى 👑' : 'FIRST CLASS 👑') : (isRtl ? 'درجة الأعمال 💼' : 'BUSINESS CLASS 💼')}</span>
                </div>
              )}

              <div className="ticket-header" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plane style={{ transform: isRtl ? 'rotate(-45deg)' : 'rotate(45deg)', color: selectedClass === 'first' ? '#f59e0b' : 'var(--primary)' }} />
                  <strong style={{ color: 'var(--text-heading)' }}>{t('checkin.boardingPassTitle')}</strong>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {selectedClass === 'first' ? (isRtl ? 'الدرجة الأولى' : 'First Class') : (selectedClass === 'business' ? (isRtl ? 'درجة الأعمال' : 'Business Class') : t('checkin.passenger') + ' ' + (isRtl ? 'السياحية' : 'Economy'))}
                </span>
              </div>

              <div className="ticket-airport-codes" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div className="airport-code-box" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <h2>{passenger.from}</h2>
                  <p>{isRtl ? passenger.fromFullAr : passenger.fromFullEn}</p>
                </div>
                <Plane size={24} className="ticket-flight-icon" style={{ color: 'var(--primary)', transform: isRtl ? 'rotate(0deg)' : 'scaleX(-1)' }} />
                <div className="airport-code-box" style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  <h2>{passenger.to}</h2>
                  <p>{isRtl ? passenger.toFullAr : passenger.toFullEn}</p>
                </div>
              </div>

              <div className="ticket-details" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <div className="ticket-details-item">
                  <span>{t('checkin.passName')}</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{isRtl ? passenger.nameAr : passenger.nameEn}</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{t('checkin.passFlight')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{passenger.flightNo}</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{t('checkin.passSeat')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--primary)' }}>{selectedSeat}</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{t('checkin.passGate')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{passenger.gate}</strong>
                </div>
              </div>

              <div className="ticket-details" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', textAlign: isRtl ? 'right' : 'left' }}>
                <div className="ticket-details-item">
                  <span>{t('checkin.passDate')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{passenger.date}</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{t('checkin.passTime')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>{passenger.time}</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{t('checkin.passBoardTime')}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--text-heading)' }}>07:45</strong>
                </div>
                <div className="ticket-details-item">
                  <span>{isRtl ? 'الرمز المرجعي' : 'PNR CODE'}</span>
                  <strong style={{ fontFamily: 'Inter', color: 'var(--accent)', letterSpacing: '1px' }}>{bookingRef || 'QA123X'}</strong>
                </div>
              </div>

              <div className="ticket-footer" style={{ flexDirection: isRtl ? 'row' : 'row-reverse' }}>
                <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t('checkin.passNoteTitle')}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('checkin.passNoteText')}</p>
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

            {/* Smart Luggage Tag Generator Card (Step 4 Extra) */}
            {showBaggageTag && (
              <div className="glass-card animate-fade-in" style={{
                direction: isRtl ? 'rtl' : 'ltr',
                border: '2px dashed var(--primary)',
                background: 'rgba(14, 165, 233, 0.03)',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'right'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
                    <Award style={{ color: 'var(--primary)' }} />
                    {isRtl ? 'بطاقة الأمتعة الذكية للحقائب 🏷️' : 'Smart Luggage Baggage Tag 🏷️'}
                  </h3>
                  <span style={{ fontSize: '11px', background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {isRtl ? 'جاهز للمطابقة' : 'READY TO MATCH'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'مالك الأمتعة' : 'PASSENGER'}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{isRtl ? passenger.nameAr : passenger.nameEn}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'الوزن المعتمد' : 'BAGGAGE WEIGHT'}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--status-ontime)' }}>{baggageWeight} {isRtl ? 'كجم كأقصى حد' : 'kg Max'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'الوجهة والمسار' : 'DESTINATION'}</span>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{passenger.from} → {passenger.to}</strong>
                  </div>
                </div>

                {/* Simulated Luggage barcode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {isRtl ? '* ثبت هذه البطاقة على حقائبك المشحونة بكونتر المطار.' : '* Attach this tag to your checked bag at airport check-in.'}
                    </p>
                  </div>
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
                    <span style={{ fontFamily: 'Inter', fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)' }}>*LUG-{bookingRef || 'QA123'}*</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }} className="no-print">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                {t('checkin.btnEditSeat')}
              </button>
              
              {!showBaggageTag && (
                <button className="btn-secondary" onClick={() => setShowBaggageTag(true)} style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  <Sparkles size={16} />
                  <span>{isRtl ? 'إصدار كرت الحقائب ذكي' : 'Generate Luggage Tag'}</span>
                </button>
              )}

              <button className="btn-primary" onClick={handlePrint}>
                <Printer size={16} />
                <span>{t('checkin.btnPrint')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
