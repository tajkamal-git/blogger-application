import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';
import { API_BASE } from '../config';
import logo from '../images/blogger.png';

const getPwdStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '' };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const levels = ['', 'weak', 'fair', 'strong', 'strong'];
  return { score: s, label: labels[s], level: levels[s] };
};

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const pwd = getPwdStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/signup`, {
        fullName: form.fullName, email: form.email,
        password: form.password, confirmPassword: form.confirmPassword,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <div className="signup-blob signup-blob-1" />
        <div className="signup-blob signup-blob-2" />
        <div className="signup-left-content">
          <img src={logo} alt="Blogger" className="signup-left-logo" />
          <h1 className="signup-left-title">Join Blogger Today</h1>
          <p className="signup-left-sub">Create your free account and start sharing your stories with the world.</p>
          <div className="signup-left-features">
            <div className="signup-feature"><span>✍️</span><span>Write & publish unlimited blogs</span></div>
            <div className="signup-feature"><span>🌍</span><span>Reach readers worldwide</span></div>
            <div className="signup-feature"><span>💬</span><span>Engage with your community</span></div>
          </div>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-form-box">
          <div className="signup-mobile-brand">
            <img src={logo} alt="Blogger" />
            <span>Blogger</span>
          </div>
          <h2>Create your account</h2>
          <p>It's free and always will be.</p>

          {error && <div className="signup-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" className="input-field" placeholder="John Doe"
                value={form.fullName} onChange={set('fullName')} required autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input id="password" type={showPwd ? 'text' : 'password'} className="input-field"
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={set('password')} required autoComplete="new-password" />
                <button type="button" className="input-toggle" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bar">
                    {[1,2,3,4].map(i => (
                      <span key={i} className={i <= pwd.score ? `active ${pwd.level}` : ''} />
                    ))}
                  </div>
                  <span className="pwd-strength-label">{pwd.label}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrap">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} className="input-field"
                  placeholder="Repeat your password" value={form.confirmPassword}
                  onChange={set('confirmPassword')} required autoComplete="new-password" />
                <button type="button" className="input-toggle" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary signup-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>
          <p className="signup-login-link">Already have an account? <Link to="/">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
