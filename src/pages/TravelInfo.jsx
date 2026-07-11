import React, { useState } from 'react';
import { Luggage, AlertTriangle, ShieldCheck, Globe, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TravelInfo() {
  const { locale, t } = useLanguage();
  const [ticketClass, setTicketClass] = useState('economy');
  const [baggageCount, setBaggageCount] = useState(1);

  // Visa Advisor State
  const [selectedDestination, setSelectedDestination] = useState('uk');

  const isRtl = locale === 'ar';

  const calculateAllowance = () => {
    let allowedWeight = 23;
    let allowedBags = 1;
    let cabinWeight = 7;

    if (ticketClass === 'business') {
      allowedWeight = 32;
      allowedBags = 2;
      cabinWeight = 10;
    } else if (ticketClass === 'first') {
      allowedWeight = 32;
      allowedBags = 3;
      cabinWeight = 15;
    }

    return {
      allowedWeight: allowedWeight * baggageCount,
      allowedBags,
      cabinWeight,
      extraFee: baggageCount > allowedBags ? (baggageCount - allowedBags) * 350 : 0
    };
  };

  const info = calculateAllowance();

  // Visa Advisory Database
  const visaDb = {
    uk: {
      countryAr: 'المملكة المتحدة (UK)',
      countryEn: 'United Kingdom',
      typeAr: 'تأشيرة إلكترونية مسبقة (EVW)',
      typeEn: 'Electronic Visa Waiver (EVW)',
      timeAr: '24-48 ساعة',
      timeEn: '24-48 Hours',
      docsAr: ['جواز سفر ساري المفعول', 'تأكيد حجز الطيران والمغادرة', 'بطاقة ائتمان للدفع المالي أونلاين'],
      docsEn: ['Valid Passport (6 months)', 'Flight itinerary & booking confirmation', 'Credit card for eVisa fee payment']
    },
    egypt: {
      countryAr: 'جمهورية مصر العربية',
      countryEn: 'Egypt',
      typeAr: 'تأشيرة عند الوصول / إلكترونية',
      typeEn: 'Visa On Arrival / eVisa',
      timeAr: 'فورية عند الوصول / 3 أيام إلكترونياً',
      timeEn: 'Immediate on arrival / 3 days eVisa',
      docsAr: ['جواز سفر ساري المفعول', 'تعبئة استمارة الدخول بصالة الوصول', 'رسم التأشيرة (25 دولار أمريكي)'],
      docsEn: ['Valid Passport', 'Arrival card fill-out', 'Visa fee (25 USD) at bank counter']
    },
    uae: {
      countryAr: 'دولة الإمارات العربية المتحدة',
      countryEn: 'United Arab Emirates',
      typeAr: 'دخول مجاني بدون تأشيرة لمواطني الخليج',
      typeEn: 'Visa Free Entry (GCC Citizens)',
      timeAr: 'فوري عند كاونتر الجوازات',
      timeEn: 'Immediate at passport control',
      docsAr: ['الهوية الوطنية أو جواز السفر الساري'],
      docsEn: ['Valid Passport or National GCC Identity Card']
    },
    france: {
      countryAr: 'فرنسا (تأشيرة شنغن)',
      countryEn: 'France (Schengen Visa)',
      typeAr: 'تأشيرة شنغن مطلوبة مسبقاً',
      typeEn: 'Schengen Visa Required in Advance',
      timeAr: '10-15 يوم عمل',
      timeEn: '10-15 Working Days',
      docsAr: ['حجز موعد بمركز التأشيرات المعتمد', 'تأمين طبي للسفر يغطي 30,000 يورو', 'كشف حساب بنكي لآخر 3 أشهر'],
      docsEn: ['Visa center appointment booking', 'Travel insurance covering min 30,000 EUR', 'Bank statement for last 3 months']
    }
  };

  const currentVisa = visaDb[selectedDestination];

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('travelInfo.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('travelInfo.subtitle')}</p>
      </div>

      <div className="info-grid">
        {/* Left Side: Baggage Calculator & Prohibited Items */}
        <div>
          {/* Calculator with Baggage Visualizer */}
          <div className="baggage-calculator glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Luggage style={{ color: 'var(--primary)' }} />
              {t('travelInfo.calcTitle')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('travelInfo.classLabel')}</label>
                <select
                  className="form-control"
                  value={ticketClass}
                  onChange={(e) => setTicketClass(e.target.value)}
                  style={{
                    appearance: 'none',
                    background: ' url("data:image/svg+xml;utf8,<svg fill=\'%2394a3b8\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat left 10px center',
                    paddingLeft: isRtl ? '16px' : '30px',
                    paddingRight: isRtl ? '30px' : '16px',
                    textAlign: isRtl ? 'right' : 'left',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="economy">{t('travelInfo.classEconomy')}</option>
                  <option value="business">{t('travelInfo.classBusiness')}</option>
                  <option value="first">{t('travelInfo.classFirst')}</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('travelInfo.countLabel')}</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="5"
                  value={baggageCount}
                  onChange={(e) => setBaggageCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
            </div>

            {/* Baggage Interactive Visualizer */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                {isRtl ? 'التمثيل المرئي للحقائب المشحونة:' : 'Luggage allowance visualization:'}
              </span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {Array.from({ length: baggageCount }).map((_, i) => {
                  const isExtra = i >= info.allowedBags;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        animation: 'fadeInUp 0.3s ease'
                      }}
                    >
                      <Luggage
                        size={36}
                        style={{
                          color: isExtra ? 'var(--status-delayed)' : 'var(--status-ontime)',
                          filter: isExtra ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : 'none',
                          transform: 'scale(1.1)'
                        }}
                      />
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: isExtra ? 'var(--status-delayed)' : 'var(--status-ontime)'
                      }}>
                        {isExtra ? (isRtl ? 'حقيبة إضافية ⚠️' : 'Extra Bag ⚠️') : (isRtl ? 'حقيبة مجانية' : 'Free Bag')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="baggage-result">
              <h4 style={{ color: 'var(--text-heading)', fontSize: '15px' }}>{t('travelInfo.resultTitle')}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('travelInfo.maxWeight')}</span>
                  <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{info.allowedWeight} {t('travelInfo.kg')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('travelInfo.freeBags')}</span>
                  <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{info.allowedBags} {t('travelInfo.bags')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>{t('travelInfo.cabinWeight')}</span>
                  <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{info.cabinWeight} {t('travelInfo.kg')}</strong>
                </div>
              </div>

              {info.extraFee > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <span style={{ fontSize: '12px', color: '#fca5a5', display: 'block' }}>{t('travelInfo.overLimitAlert')}</span>
                  <span style={{ fontSize: '13px', color: '#fff' }}>{t('travelInfo.extraFeeLabel')} <strong>{info.extraFee} {t('travelInfo.currency')}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Prohibited items list */}
          <div className="glass-card" style={{ marginTop: '30px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertTriangle style={{ color: '#ef4444' }} />
              {t('travelInfo.prohibitedTitle')}
            </h3>
            <div className="regulation-list">
              <div className="regulation-item prohibited" style={{ borderRight: isRtl ? '4px solid #ef4444' : 'none', borderLeft: isRtl ? 'none' : '4px solid #ef4444' }}>
                <AlertTriangle size={20} style={{ color: '#ef4444', marginLeft: isRtl ? '10px' : '0', marginRight: isRtl ? '0' : '10px' }} />
                <div>
                  <h4 style={{ fontSize: '15px' }}>{t('travelInfo.dangerTitle')}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('travelInfo.dangerDesc')}</p>
                </div>
              </div>
              <div className="regulation-item prohibited" style={{ borderRight: isRtl ? '4px solid #ef4444' : 'none', borderLeft: isRtl ? 'none' : '4px solid #ef4444' }}>
                <AlertTriangle size={20} style={{ color: '#ef4444', marginLeft: isRtl ? '10px' : '0', marginRight: isRtl ? '0' : '10px' }} />
                <div>
                  <h4 style={{ fontSize: '15px' }}>{t('travelInfo.liquidTitle')}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('travelInfo.liquidDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Passport/Visa Advice & Interactive Visa Checker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Interactive Visa Checker Widget */}
          <div className="glass-card" style={{ border: '1px solid var(--border-focus)', padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-heading)' }}>
              <Globe style={{ color: 'var(--primary)' }} />
              {isRtl ? 'مستشار ومتطلبات التأشيرات التفاعلي' : 'Interactive Travel Visa Advisor'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              {isRtl
                ? 'اختر وجهتك المفضلة وسنعرض لكِ فوراً نوع التأشيرة للمواطنين والمقيمين والأوراق والمستندات المطلوبة!'
                : 'Select destination and we will show visa requirements, docs checklist and processing times instantly.'}
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">{isRtl ? 'اختر الدولة / الوجهة' : 'Select Destination Country'}</label>
              <select
                className="form-control"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                style={{
                  appearance: 'none',
                  background: ' url("data:image/svg+xml;utf8,<svg fill=\'%2394a3b8\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat left 10px center',
                  paddingLeft: isRtl ? '16px' : '30px',
                  paddingRight: isRtl ? '30px' : '16px',
                  textAlign: isRtl ? 'right' : 'left',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="uk">{isRtl ? 'المملكة المتحدة (UK)' : 'United Kingdom'}</option>
                <option value="france">{isRtl ? 'فرنسا (تأشيرة شنغن)' : 'France (Schengen)'}</option>
                <option value="egypt">{isRtl ? 'جمهورية مصر العربية' : 'Egypt'}</option>
                <option value="uae">{isRtl ? 'دولة الإمارات العربية المتحدة' : 'United Arab Emirates'}</option>
              </select>
            </div>

            {/* Visa Result details */}
            <div style={{
              background: 'rgba(14, 165, 233, 0.05)',
              border: '1px dashed var(--primary)',
              borderRadius: '10px',
              padding: '20px',
              animation: 'fadeInUp 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-heading)' }}>
                  {isRtl ? 'متطلبات السفر لـ:' : 'Visa Info for:'} {isRtl ? currentVisa.countryAr : currentVisa.countryEn}
                </span>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}>
                  {isRtl ? currentVisa.timeAr : currentVisa.timeEn}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                <p>
                  <strong>{isRtl ? 'نوع التأشيرة:' : 'Visa Type:'}</strong> {isRtl ? currentVisa.typeAr : currentVisa.typeEn}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    {isRtl ? 'المستندات المطلوبة للدخول:' : 'Required Document Checklist:'}
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(isRtl ? currentVisa.docsAr : currentVisa.docsEn).map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <CheckCircle size={14} style={{ color: 'var(--status-ontime)', flexShrink: 0 }} />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Documents advice */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ color: 'var(--primary)' }} />
              {t('travelInfo.docsTitle')}
            </h3>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', marginBottom: '5px' }}>{t('travelInfo.doc1Title')}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('travelInfo.doc1Desc')}</p>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', marginBottom: '5px' }}>{t('travelInfo.doc2Title')}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('travelInfo.doc2Desc')}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', marginBottom: '5px' }}>{t('travelInfo.doc3Title')}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('travelInfo.doc3Desc')}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
