import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import { useUser } from '../UserContext';
import { useToast } from '../components/Toast';
import BackToTop from '../components/BackToTop';
import MobileNav from '../components/MobileNav';
import { API_BASE } from '../config';
import {
  readingTime, formatDateShort, truncate, getInitials,
  CATEGORIES, SORT_OPTIONS, getBookmarks, isBookmarked, toggleBookmark,
} from '../utils/helpers';
import logo from '../images/blogger.png';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-row" style={{width:'40%'}} />
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-img" />
    <div className="skeleton skeleton-row" style={{width:'60%'}} />
  </div>
);

function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userEmail, logout, darkMode, toggleDarkMode } = useUser();
  const toast = useToast();

  const showSavedOnly = searchParams.get('saved') === '1';

  const [blogs, setBlogs]         = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [userFullName, setUserFullName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy]       = useState('latest');
  const [sortOpen, setSortOpen]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [navHidden, setNavHidden] = useState(false);
  const [commentOpen, setCommentOpen] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [, setBookmarkTick] = useState(0); // forces re-render after bookmark toggle
  const prevScroll = useRef(0);

  /* — fetch all blogs — */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/blogs`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const enriched = await Promise.all(data.map(async (b) => {
        try {
          const ur = await fetch(`${API_BASE}/api/user/${b.email}`);
          if (ur.ok) { const ud = await ur.json(); return { ...b, userDetails: ud }; }
        } catch {}
        return b;
      }));
      setBlogs(enriched.reverse());
    } catch { toast.error('Could not load blogs.'); }
    finally { setLoading(false); }
  }, []);/* eslint-disable-line */

  /* — fetch current user — */
  useEffect(() => {
    if (!userEmail) return;
    fetch(`${API_BASE}/api/user/${userEmail}`)
      .then(r => r.json()).then(d => { setUserDetails(d); setUserFullName(d.fullName); })
      .catch(() => {});
  }, [userEmail]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  /* — hide navbar on scroll down — */
  useEffect(() => {
    const h = () => {
      const cur = window.scrollY;
      setNavHidden(cur > prevScroll.current && cur > 60);
      prevScroll.current = cur;
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* — close sort dropdown on outside click — */
  useEffect(() => {
    if (!sortOpen) return;
    const close = () => setSortOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [sortOpen]);

  /* — like — */
  const handleLike = async (blogId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${blogId}/like`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setBlogs(prev => prev.map(b => b._id === blogId ? { ...b, likes: updated.likes } : b));
      }
    } catch { toast.error('Could not like post.'); }
  };

  /* — bookmark — */
  const handleBookmark = (blogId, e) => {
    e.stopPropagation();
    const nowSaved = toggleBookmark(blogId);
    setBookmarkTick(t => t + 1);
    toast.success(nowSaved ? 'Saved to your bookmarks.' : 'Removed from bookmarks.');
  };

  /* — comment — */
  const submitComment = async (blogId) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${blogId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userFullName || 'Anonymous', text: commentText }),
      });
      if (res.ok) {
        toast.success('Comment posted!');
        setCommentText(''); setCommentOpen(null); fetchBlogs();
      } else { toast.error('Failed to post comment.'); }
    } catch { toast.error('Network error.'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const clearSavedFilter = () => {
    searchParams.delete('saved');
    setSearchParams(searchParams);
  };

  /* — filter + sort — */
  let filtered = blogs.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchQ = !q || b.title?.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q);
    const matchCat = activeCategory === 'All' ||
      b.title?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      b.content?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSaved = !showSavedOnly || isBookmarked(b._id);
    return matchQ && matchCat && matchSaved;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'liked') return (b.likes || 0) - (a.likes || 0);
    if (sortBy === 'discussed') return (b.comments?.length || 0) - (a.comments?.length || 0);
    return 0; // latest — already newest-first from fetch
  });

  const totalLikes = blogs.reduce((s, b) => s + (b.likes || 0), 0);
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Latest';
  const savedCount = getBookmarks().length;

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className={`h-navbar${navHidden ? ' hidden' : ''}`}>
        <Link to="/home" className="h-navbar-brand">
          <img src={logo} alt="Blogger" className="h-navbar-logo" />
          <span className="h-navbar-name">Blogger</span>
        </Link>

        <div className="h-search-wrap h-search-desktop">
          <span className="h-search-icon">🔍</span>
          <input type="text" placeholder="Search blogs…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="h-navbar-actions">
          <button className="h-icon-btn h-search-toggle" onClick={() => setMobileSearchOpen(v => !v)} aria-label="Search">
            🔍
          </button>
          <button className="btn btn-primary h-btn-write" onClick={() => navigate('/write')}>
            ✏️ <span className="btn-text">Write</span>
          </button>
          <button className="h-dark-btn" onClick={toggleDarkMode} title="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="h-logout-btn" onClick={handleLogout}>Logout</button>
          <Link to="/profile">
            {userDetails.profilePicture
              ? <img src={`data:image/png;base64,${userDetails.profilePicture}`} alt="Profile" className="h-avatar" />
              : <div className="h-avatar-placeholder">{getInitials(userDetails.fullName)}</div>}
          </Link>
        </div>
      </nav>

      {/* MOBILE SEARCH ROW */}
      {mobileSearchOpen && (
        <div className="h-mobile-search-row">
          <span className="h-search-icon">🔍</span>
          <input type="text" placeholder="Search blogs…" autoFocus
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={() => { setMobileSearchOpen(false); setSearchTerm(''); }}>✕</button>
        </div>
      )}

      <div className="home-inner">
        {/* MAIN FEED */}
        <main>
          {showSavedOnly ? (
            <div className="saved-banner">
              <span>🔖 Showing your <strong>saved</strong> stories</span>
              <button onClick={clearSavedFilter}>Show all →</button>
            </div>
          ) : (
            <div className="category-bar-row">
              <div className="category-bar">
                {CATEGORIES.map(c => (
                  <button key={c} className={`cat-btn${activeCategory === c ? ' active' : ''}`}
                    onClick={() => setActiveCategory(c)}>{c}</button>
                ))}
              </div>
              <div className="sort-dropdown">
                <button className="sort-btn" onClick={(e) => { e.stopPropagation(); setSortOpen(v => !v); }}>
                  ⇅ {sortLabel}
                </button>
                {sortOpen && (
                  <div className="sort-menu" onClick={e => e.stopPropagation()}>
                    {SORT_OPTIONS.map(o => (
                      <button key={o.value} className={`sort-menu-item${sortBy === o.value ? ' active' : ''}`}
                        onClick={() => { setSortBy(o.value); setSortOpen(false); }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOG FEED */}
          {loading ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{showSavedOnly ? '🔖' : '📭'}</div>
              <h3>{showSavedOnly ? 'No saved stories yet' : 'No blogs found'}</h3>
              <p>
                {showSavedOnly
                  ? 'Tap the bookmark icon on any story to save it for later.'
                  : (searchTerm ? `No results for "${searchTerm}"` : 'Be the first to write something!')}
              </p>
            </div>
          ) : (
            <div className="blog-feed">
              {filtered.map((blog, idx) => {
                const saved = isBookmarked(blog._id);
                return (
                <div key={blog._id} className="blog-card"
                  style={{ animationDelay: `${idx * 60}ms` }}>

                  {/* Card body */}
                  <div className="blog-card-body">
                    <div className="blog-card-author">
                      {blog.userDetails?.profilePicture
                        ? <img src={`data:image/jpeg;base64,${blog.userDetails.profilePicture}`}
                            alt="" className="blog-card-avatar" />
                        : <div className="blog-card-avatar-ph">{getInitials(blog.userDetails?.fullName)}</div>}
                      <div>
                        <div className="blog-card-author-name">{blog.userDetails?.fullName || 'Unknown'}</div>
                        <div className="blog-card-date">
                          {blog.createdAt ? formatDateShort(blog.createdAt) : 'Recent'} · {readingTime(blog.content)}
                        </div>
                      </div>
                      <button className={`blog-card-bookmark${saved ? ' saved' : ''}`}
                        onClick={(e) => handleBookmark(blog._id, e)} aria-label="Save for later">
                        {saved ? '🔖' : '🏷️'}
                      </button>
                    </div>

                    <div className="blog-card-title" onClick={() => navigate(`/blog/${blog._id}`)}>
                      {blog.title}
                    </div>
                    <p className="blog-card-excerpt">{truncate(blog.content, 140)}</p>

                    <div className="blog-card-footer">
                      <div className="blog-card-actions">
                        <button className={`blog-card-action-btn${blog.liked ? ' liked' : ''}`}
                          onClick={(e) => handleLike(blog._id, e)}>
                          ❤️ {blog.likes || 0}
                        </button>
                        <button className="blog-card-action-btn"
                          onClick={() => setCommentOpen(commentOpen === blog._id ? null : blog._id)}>
                          💬 {blog.comments?.length || 0}
                        </button>
                        <button className="blog-card-action-btn"
                          onClick={() => navigate(`/blog/${blog._id}`)}>
                          Read →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="blog-card-img-wrap" onClick={() => navigate(`/blog/${blog._id}`)}>
                    {blog.image
                      ? <img src={`data:image/jpeg;base64,${blog.image}`} alt={blog.title} />
                      : <div className="blog-card-img-placeholder">📝</div>}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* COMMENT BOXES */}
          {filtered.map(blog => commentOpen === blog._id && (
            <div key={`c-${blog._id}`} className="blog-comment-box" style={{marginTop:'-18px',marginBottom:'20px',borderRadius:'0 0 12px 12px'}}>
              <textarea rows={3} placeholder="Write a comment…" value={commentText}
                onChange={e => setCommentText(e.target.value)} />
              <div className="blog-comment-box-actions">
                <button className="btn btn-secondary" style={{fontSize:13}} onClick={() => { setCommentOpen(null); setCommentText(''); }}>
                  Cancel
                </button>
                <button className="btn btn-primary comment-send-btn" onClick={() => submitComment(blog._id)}>
                  Post
                </button>
              </div>
            </div>
          ))}
        </main>

        {/* SIDEBAR */}
        <aside className="home-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-title">📊 Feed Stats</div>
            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total posts</span>
                <span className="sidebar-stat-val">{blogs.length}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Total likes</span>
                <span className="sidebar-stat-val">{totalLikes}</span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Search results</span>
                <span className="sidebar-stat-val">{filtered.length}</span>
              </div>
            </div>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-title">🔖 Saved Stories</div>
            <p className="sidebar-tip">
              You have <strong>{savedCount}</strong> {savedCount === 1 ? 'story' : 'stories'} saved.
            </p>
            <button className="btn btn-secondary" style={{width:'100%',fontSize:13,marginTop:6}}
              onClick={() => setSearchParams({ saved: '1' })}>
              View saved stories
            </button>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-title">💡 Writing Tip</div>
            <p className="sidebar-tip">
              <strong>Consistency beats perfection.</strong> Write something every day, even if it's small. Your audience will grow.
            </p>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-title">👤 You</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {userDetails.profilePicture
                ? <img src={`data:image/png;base64,${userDetails.profilePicture}`} alt="" style={{width:44,height:44,borderRadius:'50%',objectFit:'cover'}} />
                : <div className="h-avatar-placeholder" style={{width:44,height:44,fontSize:16}}>{getInitials(userDetails.fullName)}</div>}
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>{userDetails.fullName || 'Blogger'}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{userEmail}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <BackToTop />
      <MobileNav />
      <div className="mobile-nav-spacer" />
    </div>
  );
}

export default Home;
