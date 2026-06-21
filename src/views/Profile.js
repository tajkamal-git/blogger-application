import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile1.css';
import { useUser } from '../UserContext';
import { useToast } from '../components/Toast';
import BackToTop from '../components/BackToTop';
import MobileNav from '../components/MobileNav';
import { API_BASE } from '../config';
import { getInitials, readingTime, getBookmarks } from '../utils/helpers';
import logo from '../images/blogger.png';

function Profile() {
  const navigate = useNavigate();
  const { userEmail, logout, darkMode, toggleDarkMode } = useUser();
  const toast = useToast();

  const [userDetails, setUserDetails] = useState({ fullName: '', email: '', profilePicture: null });
  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName]   = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'saved'

  /* — fetch user — */
  const fetchUser = useCallback(async () => {
    if (!userEmail) return;
    try {
      const r = await axios.get(`${API_BASE}/api/user/${userEmail}`);
      setUserDetails(r.data);
    } catch { toast.error('Could not load profile.'); }
  }, [userEmail]); /* eslint-disable-line */

  /* — fetch all blogs (used for both "My Posts" and "Saved Posts") — */
  const fetchAllBlogs = useCallback(async () => {
    if (!userEmail) return;
    setLoadingBlogs(true);
    try {
      const r = await fetch(`${API_BASE}/api/blogs`);
      if (r.ok) { setAllBlogs((await r.json()).reverse()); }
    } catch {} finally { setLoadingBlogs(false); }
  }, [userEmail]);

  useEffect(() => { fetchUser(); fetchAllBlogs(); }, [fetchUser, fetchAllBlogs]);

  const myBlogs = allBlogs.filter(b => b.email === userEmail);
  const savedIds = getBookmarks();
  const savedBlogs = allBlogs.filter(b => savedIds.includes(b._id));
  const visibleBlogs = activeTab === 'mine' ? myBlogs : savedBlogs;

  /* — upload picture — */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result.split(',')[1];
      try {
        await axios.post(`${API_BASE}/api/update-profile-picture`, { email: userEmail, profilePicture: b64 });
        toast.success('Profile picture updated!');
        fetchUser();
      } catch { toast.error('Failed to upload picture.'); }
    };
    reader.readAsDataURL(file);
  };

  /* — save edits — */
  const handleSave = async () => {
    setSaving(true);
    try {
      if (newName && newName !== userDetails.fullName) {
        await axios.post(`${API_BASE}/api/update-full-name`, { email: userEmail, fullName: newName });
        setUserDetails(p => ({ ...p, fullName: newName }));
      }
      if (newEmail && newEmail !== userDetails.email) {
        await axios.post(`${API_BASE}/api/update-email`, { email: userEmail, newEmail });
        setUserDetails(p => ({ ...p, email: newEmail }));
      }
      toast.success('Profile updated!');
      setEditMode(false);
    } catch { toast.error('Update failed.'); } finally { setSaving(false); }
  };

  const totalLikes = myBlogs.reduce((s, b) => s + (b.likes || 0), 0);

  return (
    <div className="pf-page">
      {/* NAVBAR */}
      <nav className="pf-nav">
        <Link to="/home" className="pf-nav-brand">
          <img src={logo} alt="Blogger" className="pf-nav-logo" />
          <span className="pf-nav-name">Blogger</span>
        </Link>
        <div className="pf-nav-actions">
          <button className="pf-nav-btn" onClick={toggleDarkMode}>{darkMode ? '☀️' : '🌙'}</button>
          <Link to="/home" className="pf-nav-btn pf-nav-hide-mobile">← Home</Link>
          <button className="pf-nav-btn danger" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div className="pf-banner" />

      {/* HEADER CARD */}
      <div className="pf-header-card">
        <div className="pf-header-inner">
          <div className="pf-avatar-wrap">
            {userDetails.profilePicture
              ? <img src={`data:image/png;base64,${userDetails.profilePicture}`} alt="Profile" className="pf-avatar" />
              : <div className="pf-avatar-placeholder">{getInitials(userDetails.fullName)}</div>}
            <label className="pf-camera-label" htmlFor="pfImgInput" title="Change photo">📷</label>
            <input type="file" id="pfImgInput" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>

          <div className="pf-info">
            <div className="pf-name">{userDetails.fullName || 'Your Name'}</div>
            <div className="pf-email">{userDetails.email}</div>
            <div className="pf-stats">
              <div className="pf-stat"><span className="pf-stat-val">{myBlogs.length}</span><span className="pf-stat-label">Posts</span></div>
              <div className="pf-stat"><span className="pf-stat-val">{totalLikes}</span><span className="pf-stat-label">Likes</span></div>
              <div className="pf-stat"><span className="pf-stat-val">{myBlogs.reduce((s,b)=>s+(b.comments?.length||0),0)}</span><span className="pf-stat-label">Comments</span></div>
            </div>
          </div>

          <div className="pf-header-actions">
            {!editMode && (
              <button className="btn btn-primary" style={{fontSize:13,padding:'8px 18px'}}
                onClick={() => { setEditMode(true); setNewName(userDetails.fullName); setNewEmail(userDetails.email); }}>
                ✏️ Edit Profile
              </button>
            )}
            <button className="btn btn-primary" style={{fontSize:13,padding:'8px 18px'}} onClick={() => navigate('/write')}>
              ✍️ New Post
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="pf-body">
        {/* EDIT / INFO CARD */}
        <div>
          <div className="pf-card">
            <div className="pf-card-title">👤 {editMode ? 'Edit Profile' : 'Profile Info'}</div>

            {editMode ? (
              <>
                <div className="pf-field">
                  <label>Full Name</label>
                  <input className="pf-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="pf-field">
                  <label>Email Address</label>
                  <input className="pf-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div style={{display:'flex',gap:8,marginTop:4}}>
                  <button className="btn btn-secondary" style={{flex:1,fontSize:13}} onClick={() => setEditMode(false)}>Cancel</button>
                  <button className="btn btn-primary pf-save-btn" style={{flex:2}} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="pf-field"><label>Full Name</label><div className="pf-field-val">{userDetails.fullName || '—'}</div></div>
                <div className="pf-field"><label>Email</label><div className="pf-field-val">{userDetails.email || '—'}</div></div>
                <div className="pf-field"><label>Member Since</label><div className="pf-field-val">Blogger Member</div></div>
              </>
            )}
          </div>
        </div>

        {/* POSTS (My Posts / Saved Posts tabs) */}
        <div>
          <div className="pf-tabs">
            <button className={`pf-tab${activeTab === 'mine' ? ' active' : ''}`} onClick={() => setActiveTab('mine')}>
              📝 My Posts <span className="pf-tab-count">{myBlogs.length}</span>
            </button>
            <button className={`pf-tab${activeTab === 'saved' ? ' active' : ''}`} onClick={() => setActiveTab('saved')}>
              🔖 Saved <span className="pf-tab-count">{savedBlogs.length}</span>
            </button>
          </div>

          {loadingBlogs ? (
            <div className="pf-spinner" />
          ) : visibleBlogs.length === 0 ? (
            <div className="pf-card pf-empty">
              <div className="pf-empty-icon">{activeTab === 'mine' ? '📭' : '🔖'}</div>
              <p>
                {activeTab === 'mine'
                  ? <>No posts yet. <Link to="/write" style={{color:'var(--primary)',fontWeight:600}}>Write your first story!</Link></>
                  : 'No saved stories yet. Bookmark posts you want to read later.'}
              </p>
            </div>
          ) : (
            <div className="pf-posts-grid">
              {visibleBlogs.map(b => (
                <div key={b._id} className="pf-post-card" onClick={() => navigate(`/blog/${b._id}`)}>
                  {b.image
                    ? <img src={`data:image/jpeg;base64,${b.image}`} alt="" className="pf-post-thumb" />
                    : <div className="pf-post-thumb-ph">📝</div>}
                  <div className="pf-post-body">
                    <div className="pf-post-title">{b.title}</div>
                    <div className="pf-post-meta">
                      <span>❤️ {b.likes || 0}</span>
                      <span>💬 {b.comments?.length || 0}</span>
                      <span>⏱ {readingTime(b.content)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BackToTop />
      <MobileNav />
      <div className="mobile-nav-spacer" />
    </div>
  );
}

export default Profile;
