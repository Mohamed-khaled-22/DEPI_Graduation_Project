import React, { useState } from 'react';
import { Phone, Mail, MapPin, ChevronDown, ChevronUp, CheckCircle, Star, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { locale, t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Interactive rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const isRtl = locale === 'ar';

  const faqs = [
    {
      q: isRtl 
        ? 'كم قبل موعد الرحلة يجب أن أكون متواجداً في المطار؟' 
        : 'How early should I arrive at the airport before my flight?',
      a: isRtl 
        ? 'ننصح بالوصول قبل 3 ساعات من موعد إقلاع الرحلات الدولية، وقبل ساعتين للرحلات الداخلية لضمان إنجاز إجراءات الأمتعة والفحص الأمني بكل يسر.' 
        : 'We recommend arriving 3 hours before scheduled international departures, and 2 hours for domestic flights to allow smooth baggage drop and security screenings.'
    },
    {
      q: isRtl 
        ? 'كيف يمكنني تعديل أو إلغاء حجز رحلتي؟' 
        : 'How can I change or cancel my flight booking?',
      a: isRtl 
        ? 'تعديل الحجوزات أو إلغاؤها يتم مباشرة عن طريق شركة الطيران الناقلة التي قمت بالحجز معها، وليس من خلال إدارة المطار.' 
        : 'Changes or cancellations to flight bookings must be processed directly through your operating airline, not the airport administration.'
    },
    {
      q: isRtl 
        ? 'هل توجد مواقف لفترات طويلة وبكم أسعارها؟' 
        : 'Are long-term parking spaces available, and what are the rates?',
      a: isRtl 
        ? 'نعم، تتوفر مواقف مخصصة للفترات الطويلة أمام صالات المغادرة والوصول. تبلغ التكلفة اليومية للمواقف الطويلة حوالي 50 ريالاً سعودياً لليوم الواحد.' 
        : 'Yes, dedicated long-term parking areas are available in front of departures and arrivals. The daily rate is approximately 50 SAR per day.'
    },
    {
      q: isRtl 
        ? 'ماذا أفعل في حال فقدان أمتعتي أو تضررها؟' 
        : 'What should I do if my baggage is lost or damaged?',
      a: isRtl 
        ? 'يرجى التوجه فوراً لمكتب الاستعلامات عن الأمتعة المفقودة (Baggage Claim Desk) المتواجد في صالة الوصول قبل مغادرة صالة الجمارك لتسجيل بلاغ رسمي.' 
        : 'Please proceed immediately to the Baggage Claim Desk located in the arrivals hall before exiting the customs clearance area to file an official report.'
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  };

  const handleRatingSubmit = (rate) => {
    setRating(rate);
    setRatingSubmitted(true);
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('contact.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('contact.subtitle')}</p>
      </div>

      <div className="contact-grid">
        {/* Contact Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>{t('contact.formTitle')}</h3>
          
          {isSubmitted ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--status-ontime)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              animation: 'fadeInUp 0.4s ease'
            }}>
              <CheckCircle size={48} style={{ color: 'var(--status-ontime)', marginBottom: '15px' }} />
              <h4 style={{ color: 'var(--text-heading)', marginBottom: '10px' }}>{t('contact.successTitle')}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('contact.successDesc')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('contact.nameLabel')}</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder={t('contact.namePlaceholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('contact.emailLabel')}</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  style={{ textAlign: 'left', direction: 'ltr' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('contact.subjectLabel')}</label>
                <input 
                  type="text" 
                  name="subject"
                  className="form-control" 
                  placeholder={t('contact.subjectPlaceholder')} 
                  value={formData.subject}
                  onChange={handleInputChange}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>{t('contact.messageLabel')}</label>
                <textarea 
                  name="message"
                  className="form-control" 
                  rows="4" 
                  placeholder={t('contact.messagePlaceholder')} 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {t('contact.btnSubmit')}
              </button>
            </form>
          )}
        </div>

        {/* FAQs & Live Helpdesks */}
        <div>
          <h3 style={{ marginBottom: '20px' }}>{t('contact.faqTitle')}</h3>
          <div className="faq-accordion" style={{ marginBottom: '30px' }}>
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'open' : ''}`}>
                <div className="faq-question" onClick={() => toggleFaq(index)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <span>{faq.q}</span>
                  {activeFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pulsing Live Helpdesks Indicator */}
          <div className="glass-card" style={{ padding: '20px', position: 'relative' }}>
            {/* Pulsing indicator */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: isRtl ? '20px' : 'auto',
              right: isRtl ? 'auto' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--status-ontime)',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: 'bold'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                background: 'var(--status-ontime)',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--status-ontime)'
              }} className="animate-pulse"></span>
              <span>{isRtl ? 'متصل الآن' : 'LIVE'}</span>
            </div>

            <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>{t('contact.deskTitle')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <span>{t('contact.callCenter')} <strong>920012345</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>{t('contact.supportEmail')} <strong>help@alqalada-airport.com</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>{t('contact.mainOffice')} <strong>{t('contact.mainOfficeDesc')}</strong></span>
              </li>
            </ul>
          </div>

          {/* Interactive Rating Widget */}
          <div className="glass-card" style={{ marginTop: '25px', padding: '20px', textAlign: 'center' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-heading)' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              {isRtl ? 'تقييم تجربتكِ للمطار الرقمي' : 'Rate Your Digital Airport Experience'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '15px' }}>
              {isRtl ? 'رأيكِ يهمنا لتطوير وتحسين بوابتنا الرقمية وخدمات الصالات!' : 'We value your rating to improve our smart terminal portals.'}
            </p>

            {ratingSubmitted ? (
              <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                <CheckCircle size={24} style={{ color: 'var(--status-ontime)', margin: '0 auto 8px auto' }} />
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                  {isRtl ? 'شكراً جزيلاً لتقييمكِ الكريمة!' : 'Thank you so much for your review!'}
                </strong>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingSubmit(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'var(--transition)' }}
                  >
                    <Star
                      size={28}
                      style={{
                        fill: star <= (hoverRating || rating) ? 'var(--accent)' : 'none',
                        color: star <= (hoverRating || rating) ? 'var(--accent)' : 'var(--text-muted)',
                        transform: star <= hoverRating ? 'scale(1.15)' : 'none'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
