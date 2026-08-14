import { useEffect, useState } from 'react';

/**
 * A floating toast that slides in from the top-right
 * and auto-dismisses after `duration` ms.
 *
 * Props:
 *  - message  {string}   Text to display
 *  - show     {boolean}  Controlled visibility
 *  - onClose  {fn}       Called when toast should hide
 *  - onLogin  {fn}       Called when "Log In" button clicked
 *  - duration {number}   Auto-dismiss delay (default 4000ms)
 */
export default function AuthToast({ message, show, onClose, onLogin, duration = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // wait for fade-out transition
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, duration]);

  if (!show && !visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '400px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1.5px solid #C9A84C',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(30px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className="fa-solid fa-lock" style={{ color: '#fff', fontSize: '16px' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#1a1a1a', lineHeight: 1.4 }}>
          {message || 'Please log in to continue with your purchase.'}
        </p>
        <button
          className="btn btn-sm"
          onClick={() => {
            setVisible(false);
            setTimeout(() => { onClose(); onLogin(); }, 150);
          }}
          style={{
            marginTop: '10px',
            background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            borderRadius: '6px',
            padding: '4px 16px',
            fontSize: '13px',
          }}
        >
          Log In
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#888',
          fontSize: '16px',
          padding: '0',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}
