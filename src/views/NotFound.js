import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="nf-page">
      <div className="nf-card">
        <div className="nf-code">404</div>
        <div className="nf-icon">🗺️</div>
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-desc">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="nf-actions">
          <Link to="/home" className="btn btn-primary nf-home-btn">🏠 Go Home</Link>
          <button className="btn btn-secondary nf-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
