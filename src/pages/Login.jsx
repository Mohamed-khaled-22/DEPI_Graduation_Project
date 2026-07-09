import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle, ScanLine, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { login, register } = useAuth(); // register to populate mock user if empty
  const { locale, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL from query params or localStorage
  const getReturnUrl = () => {
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const returnUrl = params.get('return') || localStorage.getItem('auth_return_url');
    localStorage.removeItem('auth_return_url');
    return returnUrl || '/';
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Passport Scan Simulation States
  const [isScanning, setIsScanning] = useState(false);

  const isRtl = locale === 'ar';

  const validateEmail = (emailVal) => {
    return /\S+@\S+\.\S+/.test(emailVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validations
    if (!email || !password) {
      setError(t('auth.errFieldsRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.errEmailInvalid'));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccess(t('auth.successLogin'));
      setLoading(false);
      // Redirect to return URL or homepage after 1.2 seconds
      setTimeout(() => {
        navigate(getReturnUrl());
      }, 1200);
    } catch (err) {
      setLoading(false);
      if (err.message === 'user_not_found') {
        setError(t('auth.errUserNotFound'));
      } else if (err.message === 'incorrect_password') {
        setError(t('auth.errIncorrectPassword'));
      } else {
        setError(err.message || 'An error occurred');
      }
    }
  };

  // Automated Passport Scan Simulation
  const handlePassportScan = async () => {
    setError('');
    setSuccess('');
    setIsScanning(true);
    setLoading(true);

    // Laser scan animation runs for 1.8 seconds, then auto-fills and submits
    setTimeout(async () => {
      // Pre-populate standard mock account.
      const mockEmail = 'ahmad@example.com';
      const mockPass = '123456';

      setEmail(mockEmail);
      setPassword(mockPass);
      setIsScanning(false);

      // Submit immediately
      try {
        await login(mockEmail, mockPass);
        setSuccess(
          isRtl
            ? 'تم التحقق من الجواز الرقمي بنجاح! تسجيل الدخول الذكي...'
            : 'Digital Passport verified! Access granted successfully.'
        );
        setLoading(false);
        setTimeout(() => {
          navigate(getReturnUrl());
        }, 1200);
      } catch (err) {
        setLoading(false);
        setError('Scan failed, please type credentials manually.');
      }

    }, 1800);
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated Laser Scan Bar */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, transparent, var(--status-ontime), transparent)',
            boxShadow: '0 0 12px var(--status-ontime)',
            zIndex: 99,
            animation: 'scanEffect 1s infinite alternate'
          }}></div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{t('auth.loginTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('auth.loginSubtitle')}</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--status-ontime)',
            color: 'var(--status-ontime)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            direction: isRtl ? 'rtl' : 'ltr'
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--status-delayed)',
            color: 'var(--status-delayed)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            direction: isRtl ? 'rtl' : 'ltr'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('auth.email')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  paddingRight: isRtl ? '45px' : '16px',
                  paddingLeft: isRtl ? '16px' : '45px',
                  textAlign: isRtl ? 'right' : 'left',
                  direction: 'ltr' // Email is always LTR
                }}
                disabled={loading}
              />
              <Mail
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
          </div>

          {/* Password input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('auth.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  paddingRight: isRtl ? '45px' : '16px',
                  paddingLeft: isRtl ? '16px' : '45px',
                  textAlign: isRtl ? 'right' : 'left',
                  direction: 'ltr' // Passwords are LTR
                }}
                disabled={loading}
              />
              <Lock
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              marginTop: '5px'
            }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading && !isScanning ? '...' : t('auth.btnSubmitLogin')}</span>
          </button>

          {/* Smart Passport Scan Login Button (Extra wow-factor) */}
          <button
            type="button"
            onClick={handlePassportScan}
            className="btn-secondary"
            style={{
              justifyContent: 'center',
              width: '100%',
              padding: '12px',
              fontSize: '13.5px',
              border: '1px solid var(--primary)',
              background: 'rgba(14, 165, 233, 0.05)',
              color: 'var(--primary)',
              fontWeight: '700'
            }}
            disabled={loading}
          >
            <ScanLine size={16} className={isScanning ? 'animate-pulse' : ''} />
            <span>{isScanning ? (isRtl ? 'جاري قراءة الجواز...' : 'Scanning digital passport...') : (isRtl ? 'مسح جواز السفر الرقمي الذكي' : 'Digital Passport Quick Login')}</span>
          </button>

        </form>

        {/* Toggle to register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <Link
            to="/register"
            style={{
              color: 'var(--primary)',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'var(--transition)'
            }}
            className="auth-link-toggle"
          >
            {t('auth.noAccount')}
          </Link>
        </div>

      </div>
    </div>
  );
}
