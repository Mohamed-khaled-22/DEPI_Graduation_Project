import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plane, Calendar, ShieldCheck, Star, Clock, CloudSun, CheckSquare, Square, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const { locale, t } = useLanguage();
  const { theme } = useTheme();
  const [searchType, setSearchType] = useState('departures');
  const [flightNo, setFlightNo] = useState('');
  const [city, setCity] = useState('');

  const isRtl = locale === 'ar';

  // Live time in Riyadh (Saudi Arabia)
  const [riyadhTime, setRiyadhTime] = useState('');
  useEffect(() => {
    const updateRiyadhTime = () => {
      const options = {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', options);
      setRiyadhTime(formatter.format(new Date()));
    };

    updateRiyadhTime();
    const interval = setInterval(updateRiyadhTime, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  // Interactive Checklist Tasks State
  const [checklistTasks, setChecklistTasks] = useState([
    { id: 1, textAr: 'قص البوردنج أونلاين وإصدار بطاقة الصعود الإلكترونية', textEn: 'Generate online boarding pass (Check-In)', completed: false },
    { id: 2, textAr: 'التحقق من صلاحية جواز السفر (أكثر من 6 أشهر)', textEn: 'Verify passport validity (more than 6 months)', completed: false },
    { id: 3, textAr: 'حساب الوزن المسموح وتجهيز الحقائب حسب القوانين', textEn: 'Calculate and prepare baggage weight limit', completed: false },
    { id: 4, textAr: 'مراجعة بوابة المغادرة ومكتشف البوابة الذكي', textEn: 'Double-check terminal gate & route', completed: false },
  ]);

  const toggleTask = (id) => {
    setChecklistTasks(prev =>
      prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
    );
  };

  const completedCount = checklistTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / checklistTasks.length) * 100);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/flights?type=${searchType}&query=${flightNo || city}`);
  };

  // Live flight ticker simulation
  const liveFlights = [
    { no: 'QA-301', destAr: 'لندن', destEn: 'London', status: 'boarding', statusAr: 'صعود الطائرة', statusEn: 'Boarding', time: '08:30' },
    { no: 'QA-302', destAr: 'الرياض', destEn: 'Riyadh', status: 'ontime', statusAr: 'في الموعد', statusEn: 'On Time', time: '09:15' },
    { no: 'QA-110', destAr: 'القاهرة', destEn: 'Cairo', status: 'delayed', statusAr: 'متأخرة', statusEn: 'Delayed', time: '10:05' },
    { no: 'EK-812', destAr: 'دبي', destEn: 'Dubai', status: 'landed', statusAr: 'هبطت', statusEn: 'Landed', time: '11:20' },
    { no: 'QA-225', destAr: 'باريس', destEn: 'Paris', status: 'ontime', statusAr: 'في الموعد', statusEn: 'On Time', time: '12:45' }
  ];

  // Dynamic light mode overlay background
  const heroOverlayBackground = theme === 'light'
    ? (isRtl 
        ? 'linear-gradient(to left, rgba(241, 245, 249, 0.95) 30%, rgba(241, 245, 249, 0.5) 100%)' 
        : 'linear-gradient(to right, rgba(241, 245, 249, 0.95) 30%, rgba(241, 245, 249, 0.5) 100%)')
    : (isRtl 
        ? 'linear-gradient(to left, rgba(7, 11, 19, 0.95) 35%, rgba(7, 11, 19, 0.4) 100%)' 
        : 'linear-gradient(to right, rgba(7, 11, 19, 0.95) 35%, rgba(7, 11, 19, 0.4) 100%)');

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-overlay" style={{ background: heroOverlayBackground, transition: 'var(--transition)' }}></div>
        <img 
          src="./images/hero.png" 
          alt={t('navbar.brand')} 
          className="hero-bg" 
        />
        
        <div className="hero-content" style={{ textAlign: isRtl ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Weather & Time Widget in Hero */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: theme === 'light' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.07)',
            padding: '8px 16px',
            borderRadius: '50px',
            width: 'fit-content',
            backdropFilter: 'blur(10px)',
            border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '10px'
          }}>
            <CloudSun size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
              {isRtl ? 'الرياض ☀️ 36°م' : 'Riyadh ☀️ 36°C'}
            </span>
            <span style={{ width: '1px', height: '14px', background: 'var(--border-color)' }}></span>
            <Clock size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'Inter' }}>
              {riyadhTime}
            </span>
          </div>

          <h1 style={{ fontSize: '38px', lineHeight: '1.25', fontWeight: '800' }}>{t('home.welcome')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '580px', lineHeight: '1.6' }}>{t('home.subtitle')}</p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }} className='booking-btns-container'>
            <button className="btn-primary" onClick={() => navigate('/booking')}>
              <Plane size={18} />
              {isRtl ? 'احجز رحلتك الآن' : 'Book Your Trip Now'}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/flights')}>
              {t('home.ctaFlights')}
            </button>
          </div>
        </div>
      </section>

      {/* Flight Search Widget */}
      <section className="search-widget" style={{ marginTop: '-60px' }}>
        <div className="glass-card glass-crd-first " style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="search-tabs" style={{ flexDirection: isRtl ? 'row' : 'row' }}>
            <button 
              className={`search-tab-btn ${searchType === 'departures' ? 'active' : ''}`}
              onClick={() => setSearchType('departures')}
            >
              {t('home.departures')}
            </button>
            <button 
              className={`search-tab-btn ${searchType === 'arrivals' ? 'active' : ''}`}
              onClick={() => setSearchType('arrivals')}
            >
              {t('home.arrivals')}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('home.cityLabel')}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('home.cityPlaceholder')} 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('home.flightNoLabel')}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t('home.flightNoPlaceholder')} 
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('home.dateLabel')}</label>
              <input 
                type="date" 
                className="form-control" 
                defaultValue={new Date().toISOString().split('T')[0]}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', justifyContent: 'center' }}>
              <Search size={18} />
              {t('home.searchBtn')}
            </button>
          </form>
        </div>
      </section>

      {/* Live Flight Status Ticker */}
      <section style={{ margin: '30px 0 60px 0' }}>
        <div className="glass-card" style={{
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          overflow: 'hidden',
          borderRadius: '12px',
          background: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(15, 23, 42, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary)',
            fontWeight: 'bold',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            borderRight: isRtl ? 'none' : '2px solid var(--border-color)',
            borderLeft: isRtl ? '2px solid var(--border-color)' : 'none',
            paddingRight: isRtl ? '0' : '15px',
            paddingLeft: isRtl ? '15px' : '0'
          }}>
            <Sparkles size={16} />
            <span>{isRtl ? 'الرحلات الفورية:' : 'Live Ticker:'}</span>
          </div>

          <div style={{
            display: 'flex',
            gap: '30px',
            width: '100%',
            overflowX: 'auto',
            padding: '4px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} className="hide-scrollbar">
            {liveFlights.map((flight) => (
              <div key={flight.no} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontSize: '13px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-heading)', fontFamily: 'Inter' }}>{flight.no}</span>
                <span style={{ color: 'var(--text-muted)' }}>← {isRtl ? flight.destAr : flight.destEn}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{flight.time}</span>
                <span className={`flight-status ${flight.status}`} style={{ padding: '2px 8px', fontSize: '11px' }}>
                  {isRtl ? flight.statusAr : flight.statusEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Layout: Interactive Travel Checklist & Quick Facts */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '40px 0 60px 0' }}>
        
        {/* Interactive Travel Checklist */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
              <ShieldCheck style={{ color: 'var(--primary)' }} />
              {isRtl ? 'قائمة الاستعداد للسفر التفاعلية' : 'Pre-Flight Travel Checklist'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {isRtl ? 'خطوات تفاعلية هامة لتجهيز نفسكِ قبل التوجه للمطار.' : 'Interactive steps to keep yourself completely ready before flight.'}
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              <span>{isRtl ? 'نسبة الجاهزية والاستعداد' : 'Travel Readiness'}</span>
              <span style={{ color: 'var(--primary)' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', transition: 'width 0.4s ease-out', borderRadius: '10px' }}></div>
            </div>
          </div>

          {/* Checklist Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checklistTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: task.completed ? 'rgba(14, 165, 233, 0.04)' : 'rgba(255,255,255,0.02)',
                  border: task.completed ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {task.completed ? (
                  <CheckSquare size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                ) : (
                  <Square size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: '13.5px',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                  fontWeight: task.completed ? '500' : '600'
                }}>
                  {isRtl ? task.textAr : task.textEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Airport Smart Facts / Dynamic Alert info */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-heading)' }}>
              <Sparkles style={{ color: 'var(--accent)' }} />
              {isRtl ? 'تعليمات أمن المطار الذكية' : 'Smart Airport Guidelines'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {isRtl ? 'إشعارات وتنبيهات فورية لضمان رحلة سريعة دون تأخير.' : 'Real-time security notices to speed up boarding check procedures.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
                <AlertCircle size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{isRtl ? 'الفحص الأمني الذكي للحقائب' : 'Smart Security Luggage Scan'}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isRtl ? 'يرجى وضع السوائل الأقل من 100 مل في أكياس شفافة وتسهيل إخراج أجهزة اللابتوب للفحص السريع.' : 'Keep liquids under 100ml in plastic zip bags. Take out laptops beforehand.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                <Plane size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>{isRtl ? 'البوابات الإلكترونية للجوازات' : 'Smart Gates Passport Control'}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isRtl ? 'يمكن للمواطنين والمقيمين استخدام البوابات الذكية بمسح الهوية الوطنية أو الجواز دون الوقوف في طوابير.' : 'Saudi citizens and residents can use biometric Smart Gates for instant exit check.'}
                </p>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate('/map')} style={{ justifyContent: 'center', width: '100%' }}>
            {isRtl ? 'عرض خريطة البوابات التفاعلية' : 'Open Gate Finder Map'}
          </button>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '40px 0 80px 0' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '5px', fontFamily: 'Inter', fontWeight: '800' }}>150+</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('home.statDest')}</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '5px', fontFamily: 'Inter', fontWeight: '800' }}>30+</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('home.statAirlines')}</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '5px', fontFamily: 'Inter', fontWeight: '800' }}>24/7</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('home.statSupport')}</p>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '5px', fontFamily: 'Inter', fontWeight: '800' }}>99.8%</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{t('home.statOnTime')}</p>
        </div>
      </section>

      {/* Core Services Highlights */}
      <section style={{ marginBottom: '40px' }}>
        <div className="home-services-title" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px', fontWeight: '800' }}>{t('home.whyChooseUs')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('home.whyChooseUsSub')}</p>
        </div>
        
        <div className="home-services-grid">
          <div className="glass-card home-service-card">
            <div className="icon-wrapper">
              <Calendar size={24} />
            </div>
            <h3 style={{ fontWeight: 'bold' }}>{t('home.feature1Title')}</h3>
            <p>{t('home.feature1Desc')}</p>
          </div>

          <div className="glass-card home-service-card">
            <div className="icon-wrapper">
              <Star size={24} />
            </div>
            <h3 style={{ fontWeight: 'bold' }}>{t('home.feature2Title')}</h3>
            <p>{t('home.feature2Desc')}</p>
          </div>

          <div className="glass-card home-service-card">
            <div className="icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontWeight: 'bold' }}>{t('home.feature3Title')}</h3>
            <p>{t('home.feature3Desc')}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
