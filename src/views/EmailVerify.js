import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './EmailVerify.css';
import { API_BASE } from '../config';

function EmailVerify() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

  const sendOtpByEmail = async (otp) => {
    await fetch(`${API_BASE}/api/sendOtpByEmail`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/checkEmail`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        const otp = generateOtp();
        await sendOtpByEmail(otp);
        navigate('/otpverify', { state: { email, otp } });
      } else {
        setError('No account found with this email address.');
      }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="ev-page">
      <div className="ev-card">
        <div className="ev-icon">🔐</div>
        <h1 className="ev-title">Forgot Password?</h1>
        <p className="ev-desc">Enter your email address and we'll send a 6-digit OTP to reset your password.</p>
        <form onSubmit={handleSubmit}>
          <label className="ev-label" htmlFor="email">Email Address</label>
          <input id="email" type="email" className="ev-input" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          {error && <div className="ev-error">⚠️ {error}</div>}
          <button type="submit" className="btn btn-primary ev-btn" disabled={loading}>
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
        <Link to="/" className="ev-back">← Back to Login</Link>
      </div>
    </div>
  );
}
export default EmailVerify;
