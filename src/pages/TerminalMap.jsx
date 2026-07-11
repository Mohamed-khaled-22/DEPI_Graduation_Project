import React, { useState } from 'react';
import { ShieldCheck, Compass, Search, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';

export default function TerminalMap() {
  const { locale, t } = useLanguage();
  const { getTerminalGates, getTerminalInfo, getGateInfo } = useBooking();
  const [activeTerminal, setActiveTerminal] = useState('t1');
  const [selectedGate, setSelectedGate] = useState(null);

  // Gate Finder Search State
  const [flightSearchQuery, setFlightSearchQuery] = useState('');
  const [finderMessage, setFinderMessage] = useState('');
  const [finderSuccess, setFinderSuccess] = useState(false);

  // Direct flight to gate mapping (fallback)
  const FLIGHT_GATE_MAPPING = [
    { flight: 'QA-301', terminal: 't1', gate: 'A3', destAr: 'لندن', destEn: 'London' },
    { flight: 'QA-302', terminal: 't1', gate: 'A5', destAr: 'الرياض', destEn: 'Riyadh' },
    { flight: 'QA-110', terminal: 't1', gate: 'A1', destAr: 'القاهرة', destEn: 'Cairo' },
    { flight: 'EK-812', terminal: 't1', gate: 'A8', destAr: 'دبي', destEn: 'Dubai' },
    { flight: 'SV-500', terminal: 't2', gate: 'B2', destAr: 'جدة', destEn: 'Jeddah' },
    { flight: 'QA-225', terminal: 't2', gate: 'B4', destAr: 'باريس', destEn: 'Paris' }
  ];

  const gates = getTerminalGates(activeTerminal);
  const terminalInfo = getTerminalInfo(activeTerminal);
  const isRtl = locale === 'ar';

  // Service name translations
  const getServiceNameAr = (service) => {
    const serviceNames = {
      'duty-free': 'السوق الحرة',
      'lounge': 'صالة الانتظار',
      'cafe': 'مقهى',
      'restroom': 'دورات المياه',
      'restaurant': 'مطعم',
      'prayer-room': 'غرفة الصلاة',
      'spa': 'سبا',
      'kids-zone': 'منطقة الأطفال',
      'charging-station': 'محطة الشحن',
      'vending-machine': 'آلة البيع'
    };
    return serviceNames[service] || service;
  };

  const getServiceNameEn = (service) => {
    const serviceNames = {
      'duty-free': 'Duty Free',
      'lounge': 'Lounge',
      'cafe': 'Cafe',
      'restroom': 'Restroom',
      'restaurant': 'Restaurant',
      'prayer-room': 'Prayer Room',
      'spa': 'Spa',
      'kids-zone': 'Kids Zone',
      'charging-station': 'Charging Station',
      'vending-machine': 'Vending Machine'
    };
    return serviceNames[service] || service;
  };

  const steps = [
    { num: 1, title: t('map.step1Title'), desc: t('map.step1Desc') },
    { num: 2, title: t('map.step2Title'), desc: t('map.step2Desc') },
    { num: 3, title: t('map.step3Title'), desc: t('map.step3Desc') },
    { num: 4, title: t('map.step4Title'), desc: t('map.step4Desc') }
  ];

  const handleFlightSearch = (e) => {
    e.preventDefault();
    setFinderMessage('');
    setFinderSuccess(false);

    const searchQuery = flightSearchQuery.trim().toUpperCase();
    if (!searchQuery) return;

    const found = FLIGHT_GATE_MAPPING.find(f => f.flight.toUpperCase() === searchQuery);

    if (found) {
      setActiveTerminal(found.terminal);
      setSelectedGate(found.gate);
      setFinderSuccess(true);
      setFinderMessage(
        isRtl
          ? `تم العثور على رحلتك! رحلة ${found.flight} المغادرة إلى ${found.destAr} تقلع من البوابة ${found.gate} في الصالة ${found.terminal === 't1' ? '1' : '2'}.`
          : `Flight found! Flight ${found.flight} to ${found.destEn} departs from Gate ${found.gate} in Terminal ${found.terminal === 't1' ? '1' : '2'}.`
      );
    } else {
      setFinderMessage(
        isRtl
          ? 'عذراً، لم نتمكن من العثور على الرحلة المحددة. يرجى كتابة رحلة صحيحة مثل: QA-301 أو QA-302.'
          : 'Sorry, flight not found. Try searching for QA-301, QA-302, QA-110, or EK-812.'
      );
    }
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('map.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('map.subtitle')}</p>
      </div>

      {/* Interactive Gate Finder Box */}
      <div className="glass-card" style={{ marginBottom: '35px', border: '1px solid var(--border-focus)', padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-heading)' }}>
          <Sparkles style={{ color: 'var(--accent)' }} />
          {isRtl ? 'مكتشف بوابات المغادرة الذكي' : 'Smart Flight Gate Finder'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
          {isRtl
            ? 'اكتبي رقم رحلتكِ وسنقوم بتحديد البوابة الصحيحة لكِ تلقائياً على المخطط التفاعلي وتوضيح مسار المشي الفوري!'
            : 'Type your flight number and we will locate the correct departure gate, terminal and walk path immediately!'}
        </p>

        <form onSubmit={handleFlightSearch} style={{ display: 'flex', gap: '15px', maxWidth: '600px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder={isRtl ? 'اكتبي رقم الرحلة (مثال: QA-301)' : 'Type flight number (e.g., QA-301)'}
              value={flightSearchQuery}
              onChange={(e) => setFlightSearchQuery(e.target.value)}
              style={{
                paddingRight: isRtl ? '40px' : '16px',
                paddingLeft: isRtl ? '16px' : '40px',
                textAlign: isRtl ? 'right' : 'left',
                textTransform: 'uppercase'
              }}
            />
            <Search size={18} style={{ position: 'absolute', right: isRtl ? '14px' : 'auto', left: isRtl ? 'auto' : '14px', top: '15px', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn-primary" style={{
            height: '48px', display: "block", width: "200px"
          }}>
            {isRtl ? 'ابحث عن البوابة' : 'Find Gate'}
          </button>
        </form>

        {finderMessage && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: finderSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: finderSuccess ? '1px solid var(--status-ontime)' : '1px solid var(--status-delayed)',
            borderRadius: '8px',
            fontSize: '13.5px',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {finderSuccess ? <ShieldCheck size={20} style={{ color: 'var(--status-ontime)', flexShrink: 0 }} /> : <AlertCircle size={20} style={{ color: 'var(--status-delayed)', flexShrink: 0 }} />}
            <span>{finderMessage}</span>
          </div>
        )}
      </div>

      {/* Terminal Select Tabs */}
      <div className="map-tabs">
        <button
          className={`flights-tab-btn ${activeTerminal === 't1' ? 'active' : ''}`}
          onClick={() => { setActiveTerminal('t1'); setSelectedGate(null); setFlightSearchQuery(''); setFinderMessage(''); }}
        >
          {t('map.terminal1')}
        </button>
        <button
          className={`flights-tab-btn ${activeTerminal === 't2' ? 'active' : ''}`}
          onClick={() => { setActiveTerminal('t2'); setSelectedGate(null); setFlightSearchQuery(''); setFinderMessage(''); }}
        >
          {t('map.terminal2')}
        </button>
      </div>

      <div className="map-card glass-card">
        {/* Interactive SVG / CSS Map Layout */}
        <div className="terminal-map-illustration">
          <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass className="animate-spin" size={20} />
            {t('map.diagramTitle')} - {terminalInfo ? (isRtl ? terminalInfo.nameAr : terminalInfo.nameEn) : (isRtl ? 'الصالة' : 'Terminal')}
          </h3>

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            width: '100%',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: 'var(--text-heading)', fontSize: '14px', marginBottom: '5px' }}>
              {isRtl ? 'منطقة المغادرة الرئيسية (الأمن والأسواق)' : 'Main Departures Zone (Security & Shops)'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t('map.diagramSub')}</p>
          </div>

          <div className="map-gate-grid">
            {gates.map((gate) => (
              <div
                key={gate}
                className={`map-gate ${selectedGate === gate ? 'active' : ''}`}
                onClick={() => { setSelectedGate(gate); setFlightSearchQuery(''); setFinderMessage(''); }}
              >
                {gate}
              </div>
            ))}
          </div>

          {selectedGate && (() => {
            const gateInfo = getGateInfo(activeTerminal, selectedGate);
            return (
              <div style={{
                marginTop: '25px',
                padding: '18px',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                width: '100%',
                textAlign: isRtl ? 'right' : 'left',
                animation: 'fadeInUp 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--text-heading)', fontSize: '15px' }}>
                    {t('map.selectedGate')}: {selectedGate}
                  </strong>

                  {/* Walk Time details */}
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: 'var(--accent)',
                    fontWeight: 'bold',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '15px'
                  }}>
                    <Clock size={14} />
                    <span>{isRtl ? 'وقت المشي: ' : 'Walk time: '} {gateInfo?.walkTime || terminalInfo?.walkTime || 5} {isRtl ? 'دقائق' : 'min'}</span>
                  </span>
                </div>

                {/* Distance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{isRtl ? 'المسافة: ' : 'Distance: '}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{gateInfo?.distance || 'N/A'}</span>
                </div>

                {/* Services */}
                {gateInfo?.services && gateInfo.services.length > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      {isRtl ? 'الخدمات المتاحة:' : 'Available Services:'}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {gateInfo.services.map((service, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '11px',
                            background: 'rgba(14, 165, 233, 0.2)',
                            color: 'var(--primary)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {isRtl ? getServiceNameAr(service) : getServiceNameEn(service)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Path Way points */}
                <div style={{
                  marginTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '12px'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                    {isRtl ? 'مسار الوصول الموصى به للبوابة:' : 'Recommended walking route:'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', fontWeight: '700' }}>
                    <span style={{ color: 'var(--text-main)' }}>{isRtl ? 'الفحص الأول' : 'Initial Check'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>←</span>
                    <span style={{ color: 'var(--text-main)' }}>{isRtl ? 'الجوازات' : 'Passport Desk'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>←</span>
                    <span style={{ color: 'var(--text-main)' }}>{isRtl ? 'السوق الحرة' : 'Duty Free Area'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>←</span>
                    <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{isRtl ? `بوابة ${selectedGate}` : `Gate ${selectedGate}`}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Step-by-Step Travel Guide */}
        <div>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck style={{ color: 'var(--primary)' }} />
            {t('map.guideTitle')}
          </h3>
          <div className="terminal-flow">
            {steps.map((step) => (
              <div key={step.num} className="flow-step" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div className="flow-step-num">{step.num}</div>
                <div className="flow-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
