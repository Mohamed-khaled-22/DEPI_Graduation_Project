import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

let msgCounter = 0;
function generateMsgId() {
  msgCounter += 1;
  return `msg_${Date.now()}_${msgCounter}`;
}

export default function SmartAssistant() {
  const { locale, t } = useLanguage();
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const isRtl = locale === 'ar';

  // Helper defined inside but called in effects - declared before them to satisfy declaration check
  const initializeWelcomeMessage = () => {
    const userGreeting = currentUser 
      ? (isRtl ? `أهلاً بكِ يا ${currentUser.username}! ` : `Welcome, ${currentUser.username}! `)
      : '';
    const welcomeText = userGreeting + t('widgets.botWelcome');
    
    setMessages([
      { 
        id: 'welcome', 
        text: welcomeText, 
        sender: 'bot', 
        time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  };

  // Load chat messages from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('airport_chat_history');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error('Failed to parse chat messages from localStorage', e);
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Save chat messages to localStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('airport_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleClearHistory = () => {
    localStorage.removeItem('airport_chat_history');
    initializeWelcomeMessage();
  };

  const quickReplies = [
    { text: t('widgets.botQ1'), tag: 'checkin' },
    { text: t('widgets.botQ2'), tag: 'lounge' },
    { text: t('widgets.botQ3'), tag: 'wifi' },
    { text: t('widgets.botQ4'), tag: 'lost' }
  ];

  const getBotResponse = (tag, typedText = '') => {
    const text = typedText.toLowerCase();
    
    // Keyword match
    if (tag === 'checkin' || text.includes('بوردنج') || text.includes('قص') || text.includes('مقعد') || text.includes('check') || text.includes('seat')) {
      return isRtl 
        ? 'لإصدار بطاقة صعود الطائرة واختيار المقعد أونلاين، يرجى التوجه لصفحة "قص البوردنج" من القائمة العلوية وإدخال رقم حجزك.'
        : 'To generate your boarding pass and select your seat online, please navigate to the "Web Check-in" page in the top menu and enter your booking PNR.';
    }
    if (tag === 'lounge' || text.includes('صالة') || text.includes('صالون') || text.includes('lounge') || text.includes('vip')) {
      return isRtl
        ? 'صالات كبار الشخصيات (VIP Lounges) متوفرة في صالة المغادرة الدولية بالدور الثاني، وتوفر خدمات بوفيه فاخر وغرف اجتماعات هادئة.'
        : 'VIP Lounges are located in the International Departures Hall on the second floor, offering premium buffet dining and quiet meeting rooms.';
    }
    if (tag === 'wifi' || text.includes('واي') || text.includes('نت') || text.includes('wifi') || text.includes('internet')) {
      return isRtl
        ? 'شبكة الواي فاي المجانية هي "Airport_Free_WiFi". يمكنك توليد رمز تفعيل مجاني عالي السرعة من صفحة "الخدمات".'
        : 'The free Wi-Fi network is "Airport_Free_WiFi". You can generate a free high-speed activation voucher directly on the "Services" page.';
    }
    if (tag === 'lost' || text.includes('مفقود') || text.includes('شنط') || text.includes('lost') || text.includes('bag')) {
      return isRtl
        ? 'مكتب المفقودات يقع في صالة الوصول رقم 1 بجوار بوابة الاستلام الجمركي. رقم الاتصال المباشر هو 104.'
        : 'The Lost & Found office is situated in Arrivals Terminal 1 next to the customs gate. You can contact them directly at extension 104.';
    }

    // Checking if user is asking about registration or login
    if (text.includes('حساب') || text.includes('تسجيل') || text.includes('دخول') || text.includes('login') || text.includes('register') || text.includes('account')) {
      return isRtl
        ? 'يمكنك إنشاء حساب جديد أو تسجيل الدخول من خلال زر "تسجيل الدخول" في شريط التنقل العلوي لحفظ بيانات بوردنج الطائرة والتمتع بخدماتنا الذكية.'
        : 'You can create a new account or log in via the "Login" button on the top navigation bar to save your boarding pass details and enjoy smart services.';
    }
    
    // Default reply
    return isRtl
      ? 'عذراً، لم أفهم استفساركِ تماماً. يرجى استخدام أحد الأسئلة السريعة أو الاتصال بخدمة العملاء على الرقم 920012345.'
      : 'Sorry, I did not catch that. Please use one of the quick replies or contact customer support at 920012345.';
  };

  const handleSendMessage = (text, tag = null) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: generateMsgId(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulate bot typing
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = getBotResponse(tag, text);
      const botMsg = {
        id: generateMsgId(),
        text: replyText,
        sender: 'bot',
        time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: isRtl ? 'auto' : '30px', left: isRtl ? '30px' : 'auto', zIndex: 1000, direction: isRtl ? 'rtl' : 'ltr' }} className="no-print">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-primary animate-fade-in"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4)',
            padding: 0,
            cursor: 'pointer'
          }}
          title={t('widgets.botTitle')}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card animate-fade-in" style={{
          width: '360px',
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1px solid var(--border-focus)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={22} />
              <strong style={{ fontSize: '15px' }}>{t('widgets.botTitle')}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {messages.length > 1 && (
                <button
                  onClick={handleClearHistory}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }}
                  title={isRtl ? "مسح السجل" : "Clear History"}
                  className="chat-header-action"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            background: 'rgba(0, 0, 0, 0.15)'
          }}>
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  maxWidth: '80%'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50px',
                  background: msg.sender === 'user' ? 'var(--secondary)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div>
                  <div style={{
                    background: msg.sender === 'user' ? 'var(--secondary)' : 'rgba(255,255,255,0.06)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' 
                      ? (isRtl ? '12px 0 12px 12px' : '0 12px 12px 12px') 
                      : (isRtl ? '0 12px 12px 12px' : '12px 0 12px 12px'),
                    fontSize: '13px',
                    lineHeight: '1.5',
                    textAlign: isRtl ? 'right' : 'left'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block', textAlign: msg.sender === 'user' ? 'left' : 'right' }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px' }}>
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Options */}
          {messages.length <= 1 && !isTyping && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 16px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)' }}>
              {quickReplies.map((reply, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSendMessage(reply.text, reply.tag)}
                  style={{
                    background: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    color: 'var(--primary)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="quick-reply-btn"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            style={{
              display: 'flex',
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input 
              type="text"
              className="form-control"
              placeholder={t('widgets.botPlaceholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                height: '38px',
                fontSize: '13px',
                padding: '0 12px',
                textAlign: isRtl ? 'right' : 'left'
              }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', flexShrink: 0 }}
            >
              <Send size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
