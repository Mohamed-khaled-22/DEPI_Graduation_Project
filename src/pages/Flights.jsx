import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plane, Search, RefreshCw, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Flights() {
  const { locale, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'departures';
  const initialQuery = searchParams.get('query') || '';

  const [activeTab, setActiveTab] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAirlineCode, setSelectedAirlineCode] = useState('all');
  
  // Dynamic API state variables
  const [flights, setFlights] = useState({ departures: [], arrivals: [] });
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isRtl = locale === 'ar';

  const loadFlightsData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/flights');
      if (response.ok) {
        const data = await response.json();
        console.log('Flights data loaded:', data);
        return data;
      } else {
        console.error('Failed to load flights from database, HTTP status: ', response.status);
      }
    } catch (err) {
      console.error('Network error loading flights from database', err);
    }
    return null;
  };

  const fetchWeatherForFlights = async (flightList) => {
    const uniqueLocations = [];
    const locationKeys = new Set();

    // Gather all departures and arrivals locations
    const allFlights = [...flightList.departures, ...flightList.arrivals];
    allFlights.forEach(f => {
      if (f.lat && f.lon) {
        const key = `${f.lat},${f.lon}`;
        if (!locationKeys.has(key)) {
          locationKeys.add(key);
          uniqueLocations.push({ lat: f.lat, lon: f.lon, key });
        }
      }
    });

    const weatherResults = {};

    // Parallel fetch weather from keyless Open-Meteo API
    await Promise.all(uniqueLocations.map(async (loc) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const wCode = data.current_weather.weathercode;
            
            // Map weather codes to labels and emojis
            let icon = '☀️';
            let descAr = 'مشمس';
            let descEn = 'Sunny';

            if (wCode === 0) {
              icon = '☀️';
              descAr = 'صافي';
              descEn = 'Clear';
            } else if ([1, 2, 3].includes(wCode)) {
              icon = '⛅';
              descAr = 'غائم جزئياً';
              descEn = 'Partly Cloudy';
            } else if ([45, 48].includes(wCode)) {
              icon = '🌫️';
              descAr = 'ضباب';
              descEn = 'Foggy';
            } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wCode)) {
              icon = '🌧️';
              descAr = 'ممطر';
              descEn = 'Rainy';
            } else if ([71, 73, 75].includes(wCode)) {
              icon = '❄️';
              descAr = 'مثلج';
              descEn = 'Snowy';
            } else if ([95, 96, 99].includes(wCode)) {
              icon = '⛈️';
              descAr = 'عاصف';
              descEn = 'Stormy';
            }

            weatherResults[loc.key] = {
              temp,
              icon,
              desc: isRtl ? descAr : descEn
            };
          }
        }
      } catch (err) {
        console.error('Failed to query weather API for coords:', loc.key, err);
      }
    }));

    setWeatherData(prev => ({ ...prev, ...weatherResults }));
  };

  useEffect(() => {
    let active = true;
    loadFlightsData().then((data) => {
      if (!active) return;
      if (data) {
        setFlights(data);
        setHasError(false);
        fetchWeatherForFlights(data);
      } else {
        // Backend/API unreachable or failed: clear any stale data and show empty state
        setFlights({ departures: [], arrivals: [] });
        setHasError(true);
      }
      setLoading(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    const query = searchParams.get('query');

    Promise.resolve().then(() => {
      if (type) {
        setActiveTab(type);
      }
      if (query !== null) {
        setSearchQuery(query);
      }
    });
  }, [searchParams]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await loadFlightsData();
    if (data) {
      setFlights(data);
      setHasError(false);
      await fetchWeatherForFlights(data);
    } else {
      setFlights({ departures: [], arrivals: [] });
      setHasError(true);
    }
    setIsRefreshing(false);
setSearchQuery("")
  };

  const currentFlights = activeTab === 'departures' ? flights.departures : flights.arrivals;

  // Calculate live statistics
  const totalCount = currentFlights.length;
  const onTimeCount = currentFlights.filter(f => f.status === 'ontime').length;
  const delayedCount = currentFlights.filter(f => f.status === 'delayed').length;
  const boardingCount = currentFlights.filter(f => f.status === 'boarding').length;

  const filteredFlights = currentFlights.filter((flight) => {
    const term = searchQuery.toLowerCase();

const airline = isRtl ? flight.airline_ar : flight.airline_en;

const location =
  activeTab === "departures"
    ? (isRtl ? flight.destination_ar : flight.destination_en)
    : (isRtl ? flight.origin_ar : flight.origin_en);

const matchesSearch =
  (flight.flight_no || "").toLowerCase().includes(term) ||
  (airline || "").toLowerCase().includes(term) ||
  (location || "").toLowerCase().includes(term);

const matchesAirline =
  selectedAirlineCode === "all" ||
  (flight.flight_no || "").startsWith(selectedAirlineCode);

    return matchesSearch && matchesAirline;
  });

  // Unique airlines for quick filter
  const airlineFilters = [
    { code: 'all', labelAr: 'كل الشركات', labelEn: 'All Airlines' },
    { code: 'QA', labelAr: 'طيران القلادة', labelEn: 'Qalada Airways' },
    { code: 'SV', labelAr: 'الخطوط السعودية', labelEn: 'Saudia' },
    { code: 'EK', labelAr: 'طيران الإمارات', labelEn: 'Emirates' },
    { code: 'MS', labelAr: 'مصر للطيران', labelEn: 'EgyptAir' }
  ];

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('flights.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('flights.subtitle')}</p>
      </div>

      {/* Live Statistics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: isRtl ? 'none' : '4px solid var(--primary)', borderRight: isRtl ? '4px solid var(--primary)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'إجمالي الرحلات الحالية' : 'Total Active Flights'}</span>
            <strong style={{ fontSize: '26px', color: 'var(--text-heading)', fontFamily: 'Inter' }}>{totalCount}</strong>
          </div>
          <Plane size={24} style={{ color: 'var(--primary)', opacity: 0.8 }} />
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: isRtl ? 'none' : '4px solid var(--status-ontime)', borderRight: isRtl ? '4px solid var(--status-ontime)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'الرحلات الملتزمة بالمواعيد' : 'On-Time Flights'}</span>
            <strong style={{ fontSize: '26px', color: 'var(--status-ontime)', fontFamily: 'Inter' }}>{onTimeCount}</strong>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--status-ontime)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>
            {totalCount ? Math.round((onTimeCount/totalCount)*100) : 100}%
          </span>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: isRtl ? 'none' : '4px solid var(--status-delayed)', borderRight: isRtl ? '4px solid var(--status-delayed)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'الرحلات المتأخرة' : 'Delayed Flights'}</span>
            <strong style={{ fontSize: '26px', color: 'var(--status-delayed)', fontFamily: 'Inter' }}>{delayedCount}</strong>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--status-delayed)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>
            {totalCount ? Math.round((delayedCount/totalCount)*100) : 0}%
          </span>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: isRtl ? 'none' : '4px solid var(--status-boarding)', borderRight: isRtl ? '4px solid var(--status-boarding)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>{isRtl ? 'في مرحلة صعود الطائرة' : 'Boarding Now'}</span>
            <strong style={{ fontSize: '26px', color: 'var(--status-boarding)', fontFamily: 'Inter' }}>{boardingCount}</strong>
          </div>
          <span className="flight-status boarding" style={{ animation: 'pulseGlow 2s infinite', fontSize: '11px' }}>⚡ Live</span>
        </div>
      </div>

      {/* Tabs and Refresh Bar */}
      <div className="flights-header" style={{ marginBottom: '15px' }}>
        <div className="flights-tabs">
          <button 
            className={`flights-tab-btn ${activeTab === 'departures' ? 'active' : ''}`}
            onClick={() => { setActiveTab('departures'); setSearchQuery(''); setSelectedAirlineCode('all'); }}
          >
            <Plane size={18} style={{ transform: isRtl ? 'rotate(-45deg)' : 'rotate(45deg)' }} />
            {t('flights.departures')}
          </button>
          <button 
            className={`flights-tab-btn ${activeTab === 'arrivals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('arrivals'); setSearchQuery(''); setSelectedAirlineCode('all'); }}
          >
            <Plane size={18} style={{ transform: isRtl ? 'rotate(135deg)' : 'rotate(-135deg)' }} />
            {t('flights.arrivals')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          <div className="search-filter-bar" style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={t('flights.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                paddingRight: isRtl ? '40px' : '16px', 
                paddingLeft: isRtl ? '16px' : '40px',
                textAlign: isRtl ? 'right' : 'left'
              }}
            />
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                right: isRtl ? '14px' : 'auto', 
                left: isRtl ? 'auto' : '14px', 
                top: '15px', 
                color: 'var(--text-muted)' 
              }} 
            />
          </div>

          <button 
            onClick={handleRefresh} 
            className="btn-secondary" 
            style={{ padding: '12px', height: '48px' }}
            title="Refresh"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Airline Filters Row */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '25px', paddingBottom: '5px' }} className="hide-scrollbar">
        {airlineFilters.map((airline) => (
          <button
            key={airline.code}
            onClick={() => setSelectedAirlineCode(airline.code)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '20px',
              border: selectedAirlineCode === airline.code ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: selectedAirlineCode === airline.code ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
              color: selectedAirlineCode === airline.code ? '#fff' : 'var(--text-main)',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: selectedAirlineCode === airline.code ? 'var(--shadow-glow)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            {isRtl ? airline.labelAr : airline.labelEn}
          </button>
        ))}
      </div>

      {/* Live Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flight-table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
              <span>Loading flights database...</span>
            </div>
          ) : hasError ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Plane size={24} style={{ margin: '0 auto 10px auto', display: 'block', opacity: 0.5 }} />
              <span style={{ display: 'block', marginBottom: '16px' }}>
                {isRtl ? 'لا يوجد أي رحلات متاحة حالياً' : 'No flights available right now'}
              </span>
              <button
                onClick={handleRefresh}
                className="btn-secondary"
                style={{ padding: '8px 20px' }}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} style={{ marginRight: isRtl ? 0 : '6px', marginLeft: isRtl ? '6px' : 0 }} />
                {isRtl ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : (
            <table className="flight-table" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('flights.time')}</th>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('flights.flightNo')}</th>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('flights.airline')}</th>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    {activeTab === 'departures' ? t('flights.destination') : t('flights.origin')}
                  </th>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('flights.gate')}</th>
                  <th style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('flights.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => {
                    const weatherKey = `${flight.lat},${flight.lon}`;
                    const weather = weatherData[weatherKey];

                    return (
                    <tr key={flight.id}>
  <td style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
    <Clock size={16} style={{ color: 'var(--text-muted)' }} />
    <span style={{ fontFamily: 'Inter' }}>{flight.time}</span>
  </td>

  <td style={{ fontFamily: 'Inter', fontWeight: 'bold', color: 'var(--primary)' }}>
    {flight.flight_no}
  </td>

  <td>
    {isRtl ? flight.airline_ar : flight.airline_en}
  </td>

  <td style={{ fontWeight: '500' }}>
    <span style={{ verticalAlign: 'middle' }}>
      {activeTab === 'departures'
        ? (isRtl ? flight.destination_ar : flight.destination_en)
        : (isRtl ? flight.origin_ar : flight.origin_en)}
    </span>

    {weather && (
      <span
        className="weather-badge"
        title={`${t('flights.weather')}: ${weather.desc}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          color: 'var(--accent)',
          marginLeft: isRtl ? '0' : '8px',
          marginRight: isRtl ? '8px' : '0',
          background: 'rgba(245,158,11,.08)',
          padding: '2px 8px',
          borderRadius: '12px',
          border: '1px solid rgba(245,158,11,.15)',
          verticalAlign: 'middle'
        }}
      >
        <span>{weather.icon}</span>
        <span style={{ fontFamily: 'Inter', fontWeight: '700' }}>
          {weather.temp}°C
        </span>
      </span>
    )}
  </td>

  <td style={{ fontFamily: 'Inter' }}>
    {flight.gate}
  </td>

  <td>
    <span className={`flight-status ${flight.status}`}>
      {isRtl ? flight.status_label_ar : flight.status_label_en}
    </span>
  </td>
</tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      {t('flights.noFlights')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-ontime)' }}></span> {t('flights.onTime')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-delayed)' }}></span> {t('flights.delayed')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-boarding)' }}></span> {t('flights.boarding')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-landed)' }}></span> {t('flights.landed')}
        </span>
      </div>
    </div>
  );
}