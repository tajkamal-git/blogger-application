import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './MobileNav.css';
import { getBookmarks } from '../utils/helpers';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedCount = getBookmarks().length;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-nav">
      <Link to="/home" className={`mn-item${isActive('/home') ? ' active' : ''}`}>
        <span className="mn-icon">🏠</span>
        <span className="mn-label">Home</span>
      </Link>

      <Link to="/home?saved=1" className="mn-item mn-item-rel">
        <span className="mn-icon">🔖</span>
        <span className="mn-label">Saved</span>
        {savedCount > 0 && <span className="mn-badge">{savedCount > 9 ? '9+' : savedCount}</span>}
      </Link>

      <button className="mn-fab-wrap" onClick={() => navigate('/write')} aria-label="Write a new story">
        <span className="mn-fab">✏️</span>
        <span className="mn-fab-label">Write</span>
      </button>

      <Link to="/profile" className={`mn-item${isActive('/profile') ? ' active' : ''}`}>
        <span className="mn-icon">👤</span>
        <span className="mn-label">Profile</span>
      </Link>
    </nav>
  );
}
