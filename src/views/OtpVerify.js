import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './OtpVerify.css';
import { API_BASE } from '../config';

function OtpVerify() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { email, otp } = location.state || {};

  const [entered, setEntered]     = useState('');
  const [error, setError]         = useState('');
  const [expired, setExpired]     = useState(false);
  const [remaining, setRemaining] = useState(180); // 3 minutes in seconds
  const [currentOtp, setCurrentOtp] = useState(otp);

  useEffect(() => {
    if (remaining <= 0) { setExpired(true); return; }
    const t = setInterval(() => setRemaining(r => { if (r <= 1) { setExpired(true); clearInterval(t); return 0; } return r - 1; }), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  const handleVerify = () => {
    setError('');
    // eslint-disable-next-line
    if (String(entered) == String(currentOtp) && !expired) {
      navigate('/forgetpassword', { state: { email } });
    } else if (expired) {
      setError('OTP has expired. Please request a new one.');
    } else {
      setError('Incorrect OTP. Please check and try again.');
    }
  };

  const handleResend = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000);
    try {
      await fetch(`${API_BASE}/api/sendOtpByEmail`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: newOtp }),
      });
      setCurrentOtp(newOtp); setEntered(''); setError('');
      setExpired(false); setRemaining(180);
    } catch { setError('Failed to resend OTP.'); }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-icon">📩</div>
        <h1 className="otp-title">Check your inbox</h1>
        <p className="otp-desc">We sent a 6-digit verification code to</p>
        <div className="otp-email-badge">{email}</div>

        <label className="otp-label" htmlFor="otp">Verification Code</label>
        <input id="otp" type="text" className="otp-input" placeholder="——————"
          maxLength={6} value={entered} onChange={e => setEntered(e.target.value.replace(/\D/g, ''))} />

        {!expired
          ? <div className="otp-timer">Expires in <span>{mins}:{secs}</span></div>
          : <div className="otp-timer expired">Code expired</div>}

        {error && <div className="otp-error">⚠️ {error}</div>}

        <button className="btn btn-primary otp-btn" onClick={handleVerify} disabled={!entered || expired}>
          Verify Code
        </button>

        {expired && (
          <button className="btn btn-secondary otp-resend" onClick={handleResend}>
            🔄 Resend Code
          </button>
        )}
        <br />
        <Link to="/forget" className="otp-back">← Use a different email</Link>
      </div>
    </div>
  );
}
export default OtpVerify;
