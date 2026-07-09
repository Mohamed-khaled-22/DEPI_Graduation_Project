import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Calendar, Lock, CheckCircle, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, t } = useLanguage();
  const { createBooking } = useBooking();
  const { currentUser } = useAuth();
  const isRtl = locale === 'ar';

  const bookingData = location.state?.bookingData;
  const totalPrice = location.state?.totalPrice;

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!bookingData || !totalPrice) {
      navigate('/booking');
    }
  }, [bookingData, totalPrice, navigate]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }

    setPaymentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    const cardNum = paymentForm.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length < 16) {
      newErrors.cardNumber = isRtl ? 'رقم البطاقة غير صالح' : 'Invalid card number';
    }

    if (!paymentForm.cardName.trim()) {
      newErrors.cardName = isRtl ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name is required';
    }

    const expiry = paymentForm.expiryDate.replace('/', '');
    if (!expiry || expiry.length < 4) {
      newErrors.expiryDate = isRtl ? 'تاريخ الانتهاء غير صالح' : 'Invalid expiry date';
    } else {
      const [month, year] = paymentForm.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = isRtl ? 'شهر غير صالح' : 'Invalid month';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = isRtl ? 'البطاقة منتهية' : 'Card has expired';
      }
    }

    if (!paymentForm.cvv || paymentForm.cvv.length < 3) {
      newErrors.cvv = isRtl ? 'رمز الأمان غير صالح' : 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validatePaymentForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      try {
        // Create the booking
        const booking = createBooking(bookingData);
        setPaymentSuccess(true);
        
        // Redirect to flight details after showing success
        setTimeout(() => {
          navigate('/flight-details');
        }, 2000);
      } catch (error) {
        console.error('Payment error:', error);
        alert(isRtl ? 'حدث خطأ أثناء معالجة الدفع' : 'An error occurred during payment processing');
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (!bookingData || !totalPrice) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/booking')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={16} />
            {isRtl ? 'العودة' : 'Back'}
          </button>
          
          <h1 style={{ fontSize: '28px', color: 'var(--text-heading)', marginBottom: '8px' }}>
            {isRtl ? 'بوابة الدفع الآمن' : 'Secure Payment Gateway'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isRtl ? 'أكمل عملية الدفع لتأكيد حجزك' : 'Complete your payment to confirm booking'}
          </p>
        </div>

        {!paymentSuccess ? (
          <>
            {/* Order Summary */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-heading)', marginBottom: '15px' }}>
                {isRtl ? 'ملخص الطلب' : 'Order Summary'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {isRtl ? 'الرحلة' : 'Flight'}: {bookingData.from} → {bookingData.to}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {isRtl ? 'التاريخ' : 'Date'}: {bookingData.departureDate}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {isRtl ? 'درجة السفر' : 'Cabin Class'}: {isRtl ? 
                    (bookingData.cabinClass === 'economy' ? 'سياحية' : bookingData.cabinClass === 'business' ? 'أعمال' : 'أولى') :
                    (bookingData.cabinClass.charAt(0).toUpperCase() + bookingData.cabinClass.slice(1))
                  }
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-heading)', fontSize: '16px' }}>
                  {isRtl ? 'المبلغ الإجمالي' : 'Total Amount'}
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '20px', fontFamily: 'Inter' }}>
                  {totalPrice} {isRtl ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

            {/* Payment Form */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', color: 'var(--text-heading)', margin: 0 }}>
                  {isRtl ? 'بيانات البطاقة' : 'Card Details'}
                </h3>
              </div>

              <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Card Number */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', textAlign: isRtl ? 'right' : 'left' }}>
                    {isRtl ? 'رقم البطاقة' : 'Card Number'} *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: errors.cardNumber ? '1px solid #ef4444' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '16px',
                      fontFamily: 'Inter',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  />
                  {errors.cardNumber && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.cardNumber}
                    </span>
                  )}
                </div>

                {/* Cardholder Name */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', textAlign: isRtl ? 'right' : 'left' }}>
                    {isRtl ? 'اسم حامل البطاقة' : 'Cardholder Name'} *
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={paymentForm.cardName}
                    onChange={handleChange}
                    placeholder={isRtl ? 'الأحمد محمد' : 'AHMAD MOHAMMED'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: errors.cardName ? '1px solid #ef4444' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '15px',
                      textTransform: 'uppercase',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  />
                  {errors.cardName && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {errors.cardName}
                    </span>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', textAlign: isRtl ? 'right' : 'left' }}>
                      {isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'} *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.expiryDate ? '1px solid #ef4444' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    />
                    {errors.expiryDate && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.expiryDate}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px', textAlign: isRtl ? 'right' : 'left' }}>
                      CVV *
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.cvv ? '1px solid #ef4444' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '16px',
                        fontFamily: 'Inter',
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    />
                    {errors.cvv && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {errors.cvv}
                      </span>
                    )}
                  </div>
                </div>

                {/* Save Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="saveCard"
                    checked={paymentForm.saveCard}
                    onChange={handleChange}
                    id="saveCard"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="saveCard" style={{ color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>
                    {isRtl ? 'حفظ بيانات البطاقة للمدفوعات المستقبلية' : 'Save card for future payments'}
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition)'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #fff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {isRtl ? 'جاري معالجة الدفع...' : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                  <Lock size={18} />
                  {isRtl ? `ادفع ${totalPrice} ر.س` : `Pay ${totalPrice} SAR`}
                </>
                  )}
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px'
            }}>
              <ShieldCheck size={20} style={{ color: '#10b981' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {isRtl ? 'معاملتك محمية بتشفير SSL 256-bit. هذه بوابة دفع وهمية للتجربة.' : 'Your transaction is secured with 256-bit SSL encryption. This is a mock payment gateway for demonstration.'}
              </span>
            </div>
          </>
        ) : (
          /* Payment Success */
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle size={48} color="white" />
            </div>
            <h2 style={{ fontSize: '24px', color: 'var(--text-heading)', marginBottom: '10px' }}>
              {isRtl ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              {isRtl ? 'تم تأكيد حجزك. سيتم تحويلك إلى صفحة تفاصيل الرحلة.' : 'Your booking has been confirmed. Redirecting to flight details...'}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {isRtl ? 'جاري التحويل...' : 'Redirecting...'}
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
