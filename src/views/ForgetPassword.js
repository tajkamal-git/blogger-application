import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgetPassword.css';
import { API_BASE } from '../config';

const ForgetPassword = () => {
  const [email, setEmail]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [msg, setMsg]             = useState({ text: '', type: '' });
  const [loading, setLoading]     = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (newPassword !== confirmPwd) { setMsg({ text: 'Passwords do not match.', type: 'error' }); return; }
    if (newPassword.length < 6)    { setMsg({ text: 'Password must be at least 6 characters.', type: 'error' }); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/resetPassword`, { email, newPassword });
      if (res.data.success) {
        setMsg({ text: '✅ Password reset successfully! You can now log in.', type: 'success' });
        setEmail(''); setNewPassword(''); setConfirmPwd('');
      } else {
        setMsg({ text: 'No account found with that email.', type: 'error' });
      }
    } catch { setMsg({ text: 'Something went wrong. Please try again.', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-icon">🔑</div>
        <h1 className="fp-title">Reset Password</h1>
        <p className="fp-desc">Enter your email and choose a new strong password.</p>
        <form onSubmit={handleReset}>
          <label className="fp-label" htmlFor="fp-email">Email Address</label>
          <input id="fp-email" type="email" className="fp-input" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />

          <label className="fp-label" htmlFor="fp-pwd">New Password</label>
          <div style={{position:'relative',marginBottom:14}}>
            <input id="fp-pwd" type={showPwd ? 'text' : 'password'} className="fp-input" style={{marginBottom:0,paddingRight:44}}
              placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPwd(v=>!v)}
              style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--text-muted)'}}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="fp-label" htmlFor="fp-confirm">Confirm Password</label>
          <input id="fp-confirm" type="password" className="fp-input" placeholder="Repeat new password"
            value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />

          <button type="submit" className="btn btn-primary fp-btn" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        {msg.text && <div className={`fp-msg ${msg.type}`}>{msg.text}</div>}
        <br />
        <Link to="/" className="fp-back">← Back to Login</Link>
      </div>
    </div>
  );
};
export default ForgetPassword;
