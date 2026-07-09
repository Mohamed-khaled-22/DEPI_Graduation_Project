import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { register } = useAuth();
  const { locale, t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isRtl = locale === 'ar';

  const validateEmail = (emailVal) => {
    return /\S+@\S+\.\S+/.test(emailVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (!username || !email || !password || !confirmPassword) {
      setError(t('auth.errFieldsRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.errEmailInvalid'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.errPasswordLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errPasswordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess(t('auth.successRegister'));
      setLoading(false);
      // Redirect to homepage after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setLoading(false);
      if (err.message === 'user_already_exists') {
        setError(t('auth.errUserExists'));
      } else {
        setError(err.message || 'An error occurred during registration.');
      }
    }
  };

  return (
    <div className="page-layout container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px 30px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{t('auth.registerTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('auth.registerSubtitle')}</p>
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Username Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('auth.username')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRtl ? "مثال: أحمد" : "e.g. John Doe"}
                style={{
                  paddingRight: isRtl ? '45px' : '16px',
                  paddingLeft: isRtl ? '16px' : '45px',
                  textAlign: isRtl ? 'right' : 'left'
                }}
                disabled={loading}
              />
              <User
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

          {/* Email Input */}
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
                  direction: 'ltr'
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

          {/* Password Input */}
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
                  direction: 'ltr'
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

          {/* Confirm Password Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              {t('auth.confirmPassword')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  paddingRight: isRtl ? '45px' : '16px',
                  paddingLeft: isRtl ? '16px' : '45px',
                  textAlign: isRtl ? 'right' : 'left',
                  direction: 'ltr'
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
              marginTop: '10px'
            }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? '...' : t('auth.btnSubmitRegister')}</span>
          </button>

        </form>

        {/* Toggle to login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--primary)',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'var(--transition)'
            }}
            className="auth-link-toggle"
          >
            {t('auth.hasAccount')}
          </Link>
        </div>

      </div>
    </div>
  );
}
