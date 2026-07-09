import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Plane, Menu, X, Sun, Moon, Languages, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { locale, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isRtl = locale === 'ar';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('navbar.home') },
    { path: '/flights', label: t('navbar.flights') },
    { path: '/services', label: t('navbar.services') },
    { path: '/map', label: t('navbar.map') },
    { path: '/flight-details', label: t('navbar.checkin') },
    { path: '/travel-info', label: t('navbar.travelInfo') },
    { path: '/contact', label: t('navbar.contact') }
  ];

  // Get user initials for profile circle
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>

        {/* Brand Logo */}
        <NavLink to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Plane
            className="ticket-flight-icon"
            style={{
              transform: isRtl ? 'rotate(-45deg)' : 'rotate(45deg)',
              color: '#0ea5e9',
              marginLeft: isRtl ? '10px' : '0',
              marginRight: isRtl ? '0' : '10px',
              transition: 'var(--transition)'
            }}
            size={28}
          />
          <span style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>{t('navbar.brand')}</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ul className="navbar-links" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            {navLinks.map((link) => (
              <li key={link.path} >
                <NavLink
                  to={link.path}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  style={{
                    position: 'relative',

                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'var(--transition)'
                  }}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick Actions (Theme, Language, Auth) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRight: isRtl ? 'none' : '1px solid var(--border-color)',
            borderLeft: isRtl ? '1px solid var(--border-color)' : 'none',
            paddingRight: isRtl ? '0' : '12px',
            paddingLeft: isRtl ? '12px' : '0',
            marginLeft: isRtl ? '12px' : '0',
            marginRight: isRtl ? '0' : '12px'
          }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '8px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'rgba(255,255,255,0.06)' }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#6366f1' }} />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="btn-secondary"
              style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: '20px' }}
              title="Change Language"
            >
              <Languages size={15} />
              <span>{isRtl ? 'English' : 'العربية'}</span>
            </button>

            {/* Auth section */}
            {currentUser ? (
              /* Authenticated User Menu */
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.1))',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {getUserInitials(currentUser.username)}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.username}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition)' }} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="glass-card animate-fade-in" style={{
                    position: 'absolute',
                    top: '45px',
                    right: isRtl ? 'auto' : 0,
                    left: isRtl ? 0 : 'auto',
                    width: '220px',
                    padding: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-focus)',
                    zIndex: 110,
                    background: 'var(--bg-card)'
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
                        {currentUser.username}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0', wordBreak: 'break-all' }}>
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: isRtl ? 'right' : 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'var(--transition)'
                      }}
                      className="dropdown-logout-btn"
                    >
                      <LogOut size={16} />
                      <span>{t('navbar.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Anonymous Login Button */
              <Link
                to="/login"
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)'
                }}
              >
                <User size={14} />
                <span>{t('navbar.login')}</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" style={{ display: 'none' }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          backdropFilter: 'var(--glass-backdrop)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px',
          zIndex: 99
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', padding: 0, margin: '0 0 20px 0' }}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  style={({ isActive }) => ({
                    display: 'block',
                    padding: '8px 0',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isActive ? '700' : '500',
                  })}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>

            {/* User Session Info for Mobile */}
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px'
                }}>
                  {getUserInitials(currentUser.username)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{currentUser.username}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser.email}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => { toggleTheme(); setIsOpen(false); }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? (isRtl ? 'الوضع الفاتح' : 'Light Mode') : (isRtl ? 'الوضع الداكن' : 'Dark Mode')}</span>
              </button>
              <button
                onClick={() => { toggleLanguage(); setIsOpen(false); }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}
              >
                <Languages size={18} />
                <span>{isRtl ? 'English' : 'العربية'}</span>
              </button>
            </div>

            {currentUser ? (
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="btn-secondary"
                style={{ justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
              >
                <LogOut size={16} />
                <span>{t('navbar.logout')}</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <User size={16} />
                <span>{t('navbar.login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
