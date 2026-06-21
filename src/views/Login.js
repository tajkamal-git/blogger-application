import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { useUser } from '../UserContext';
import { API_BASE } from '../config';
import logo from '../images/blogger.png';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/login`, { email, password });
      setUser(email);
      navigate('/home');
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-left-content">
          <img src={logo} alt="Blogger" className="login-left-logo" />
          <h1 className="login-left-title">Share Your Story</h1>
          <p className="login-left-sub">Join thousands of writers who use Blogger to share their ideas and connect with readers worldwide.</p>
          <div className="login-left-quote">
            <p>"The first draft of anything is garbage."</p>
            <span>— Ernest Hemingway</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-mobile-brand">
            <img src={logo} alt="Blogger" />
            <span>Blogger</span>
          </div>
          <h2>Welcome back 👋</h2>
          <p>Sign in to continue to your dashboard</p>

          {error && <div className="login-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" type="email" className="input-field" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input id="password" type={showPwd ? 'text' : 'password'} className="input-field"
                  placeholder="Enter your password" value={password}
                  onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" className="input-toggle" onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <Link to="/forget" className="forgot-link">Forgot password?</Link>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>
          <p className="login-signup-link">Don't have an account? <Link to="/signup">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
