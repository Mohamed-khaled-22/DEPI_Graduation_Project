import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plane, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer>
      <div className="container footer-content" style={{ direction: locale === 'ar' ? 'rtl' : 'ltr', textAlign: locale === 'ar' ? 'right' : 'left' }}>
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <Plane style={{ transform: locale === 'ar' ? 'rotate(-45deg)' : 'rotate(45deg)', color: '#0ea5e9' }} size={24} />
            <h3 style={{ color: 'var(--text-heading)' }}>{t('navbar.brand')}</h3>
          </div>
          <p>{t('footer.desc')}</p>
        </div>

        <div className="footer-links">
          <h4>{t('footer.quickLinks')}</h4>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            <li><NavLink to="/">{t('navbar.home')}</NavLink></li>
            <li><NavLink to="/flights">{t('navbar.flights')}</NavLink></li>
            <li><NavLink to="/services">{t('navbar.services')}</NavLink></li>
            <li><NavLink to="/check-in">{t('navbar.checkin')}</NavLink></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>{t('footer.contactInfo')}</h4>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              <Phone size={16} style={{ color: 'var(--primary)' }} />
              <span>920012345 ({t('footer.customerService')})</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              <Mail size={16} style={{ color: 'var(--primary)' }} />
              <span>info@alqalada-airport.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
              <MapPin size={16} style={{ color: 'var(--primary)' }} />
              <span>{t('footer.address')}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {t('navbar.brand')}. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
