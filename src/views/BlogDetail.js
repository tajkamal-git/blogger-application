import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css';
import SimilarBlogs from './SimilarBlogs';
import { useUser } from '../UserContext';
import { useToast } from '../components/Toast';
import BackToTop from '../components/BackToTop';
import MobileNav from '../components/MobileNav';
import { API_BASE } from '../config';
import { readingTime, formatDate, getInitials, isBookmarked, toggleBookmark, shareContent } from '../utils/helpers';
import logo from '../images/blogger.png';

function BlogDetail() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { userEmail, logout, darkMode, toggleDarkMode } = useUser();
  const toast = useToast();

  const [blog, setBlog]             = useState(null);
  const [authorDetails, setAuthorDetails] = useState(null);
  const [userFullName, setUserFullName]   = useState('');
  const [commentInput, setCommentInput]   = useState('');
  const [showComments, setShowComments]   = useState(false);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [navHidden, setNavHidden]         = useState(false);
  const [progress, setProgress]           = useState(0);
  const [copied, setCopied]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const prevScroll = useRef(0);

  /* — fetch blog — */
  const fetchBlog = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/blog/${blogId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBlog(data);
      setSaved(isBookmarked(blogId));
      if (data.email) {
        const ur = await fetch(`${API_BASE}/api/user/${data.email}`);
        if (ur.ok) setAuthorDetails(await ur.json());
      }
    } catch { toast.error('Could not load blog.'); }
  }, [blogId]);/* eslint-disable-line */

  useEffect(() => {
    if (!userEmail) return;
    fetch(`${API_BASE}/api/user/${userEmail}`).then(r => r.json()).then(d => setUserFullName(d.fullName)).catch(() => {});
  }, [userEmail]);

  useEffect(() => { fetchBlog(); }, [fetchBlog]);

  /* — scroll: navbar + progress — */
  useEffect(() => {
    const h = () => {
      const cur = window.scrollY;
      setNavHidden(cur > prevScroll.current && cur > 80);
      prevScroll.current = cur;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.round((cur / total) * 100) : 0);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* — like — */
  const handleLike = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${blogId}/like`, { method: 'POST' });
      if (res.ok) { const u = await res.json(); setBlog(p => ({ ...p, likes: u.likes })); }
    } catch { toast.error('Failed to like.'); }
  };

  /* — bookmark — */
  const handleBookmark = () => {
    const nowSaved = toggleBookmark(blogId);
    setSaved(nowSaved);
    toast.success(nowSaved ? 'Saved to your bookmarks.' : 'Removed from bookmarks.');
  };

  /* — comment — */
  const submitComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${blogId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userFullName || 'Anonymous', text: commentInput }),
      });
      if (res.ok) { toast.success('Comment posted!'); setCommentInput(''); fetchBlog(); }
      else toast.error('Failed to post comment.');
    } catch { toast.error('Network error.'); }
  };

  /* — delete comment — */
  const deleteComment = async (cId) => {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${blogId}/comment/${cId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Comment removed.'); fetchBlog(); }
    } catch { toast.error('Failed to delete.'); }
  };

  /* — speech — */
  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) { toast.error('Text-to-speech not supported.'); return; }
    const synth = window.speechSynthesis;
    if (synth.speaking && isSpeaking) { synth.cancel(); setIsSpeaking(false); }
    else {
      const u = new SpeechSynthesisUtterance(`${blog.title}. ${blog.content}`);
      u.onend = () => setIsSpeaking(false);
      synth.speak(u); setIsSpeaking(true);
    }
  };

  /* — share (native share sheet on mobile, clipboard fallback on desktop) — */
  const handleShare = async () => {
    const result = await shareContent({
      title: blog.title,
      text: `Check out "${blog.title}" on Blogger`,
      url: window.location.href,
    });
    if (result === 'copied') { setCopied(true); toast.success('Link copied to clipboard!'); setTimeout(() => setCopied(false), 2500); }
    else if (result === 'failed') toast.error('Could not share link.');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!blog) return (
    <div className="bd-page">
      <div className="bd-loading">
        <div className="bd-loading-spinner" />
        <p>Loading story…</p>
      </div>
    </div>
  );

  return (
    <div className="bd-page">
      {/* PROGRESS BAR */}
      <div className="read-progress" style={{ width: `${progress}%` }} />

      {/* NAVBAR */}
      <nav className={`bd-nav${navHidden ? ' hidden' : ''}`}>
        <Link to="/home" className="bd-nav-brand">
          <img src={logo} alt="Blogger" className="bd-nav-logo" />
          <span className="bd-nav-name">Blogger</span>
        </Link>
        <div className="bd-nav-actions">
          <button className="bd-nav-btn" onClick={toggleDarkMode}>{darkMode ? '☀️' : '🌙'}</button>
          <Link to="/home" className="bd-nav-btn">← Home</Link>
          <button className="bd-nav-btn bd-nav-btn-hide-mobile" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="bd-hero">
        {blog.image
          ? <><img src={`data:image/jpeg;base64,${blog.image}`} alt={blog.title} /><div className="bd-hero-overlay"/></>
          : <div className="bd-hero-placeholder">✍️</div>}
      </div>

      {/* BODY */}
      <div className="bd-wrapper">
        {/* ARTICLE */}
        <article className="bd-article">
          {/* Author meta */}
          <div className="bd-meta">
            {authorDetails?.profilePicture
              ? <img src={`data:image/jpeg;base64,${authorDetails.profilePicture}`} alt="" className="bd-author-avatar" />
              : <div className="bd-author-avatar-ph">{getInitials(authorDetails?.fullName)}</div>}
            <div className="bd-meta-text">
              <div className="bd-meta-name">{authorDetails?.fullName || 'Unknown Author'}</div>
              <div className="bd-meta-sub">
                {blog.createdAt && <><span>{formatDate(blog.createdAt)}</span><span className="bd-meta-dot"/></>}
                <span>{readingTime(blog.content)}</span>
                <span className="bd-meta-dot"/>
                <span>❤️ {blog.likes || 0}</span>
              </div>
            </div>
            <button className={`bd-bookmark-btn${saved ? ' saved' : ''}`} onClick={handleBookmark} aria-label="Save for later">
              {saved ? '🔖' : '🏷️'}
            </button>
          </div>

          {/* Title */}
          <h1 className="bd-title">{blog.title}</h1>

          {/* Content */}
          <div className="bd-content">{blog.content}</div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'24px 0 0'}}>
              {blog.tags.map(t => <span key={t} className="badge">#{t}</span>)}
            </div>
          )}

          {/* Action bar */}
          <div className="bd-action-bar">
            <button className="bd-action-btn liked" onClick={handleLike}>
              ❤️ {blog.likes || 0} <span className="bd-action-label">Likes</span>
            </button>
            <button className="bd-action-btn" onClick={() => setShowComments(v => !v)}>
              💬 {blog.comments?.length || 0} <span className="bd-action-label">Comments</span>
            </button>
            <button className={`bd-action-btn${isSpeaking ? ' speaking' : ''}`} onClick={handleSpeech}>
              {isSpeaking ? '🔇 Stop' : '🔊 Listen'}
            </button>
            <button className={`bd-action-btn${saved ? ' saved' : ''}`} onClick={handleBookmark}>
              {saved ? '🔖 Saved' : '🏷️ Save'}
            </button>
            <div className="bd-action-spacer" />
            <button className={`bd-action-btn${copied ? ' bd-share-copied' : ''}`} onClick={handleShare}>
              {copied ? '✅ Copied!' : '🔗 Share'}
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="bd-comments">
              <div className="bd-comments-title">
                💬 Comments <span style={{fontSize:14,fontWeight:400,color:'var(--text-muted)'}}>({blog.comments?.length || 0})</span>
              </div>
              <div className="bd-comment-form">
                <textarea rows={3} placeholder="Share your thoughts…"
                  value={commentInput} onChange={e => setCommentInput(e.target.value)} />
                <div className="bd-comment-form-footer">
                  <button className="btn btn-primary bd-comment-submit" onClick={submitComment}>Post Comment</button>
                </div>
              </div>
              {blog.comments?.length === 0
                ? <div className="bd-no-comments">No comments yet. Be the first! 🌟</div>
                : <div className="bd-comment-list">
                    {blog.comments.map(c => (
                      <div key={c._id} className="bd-comment">
                        <div className="bd-comment-header">
                          <div className="bd-comment-avatar">{getInitials(c.user)}</div>
                          <span className="bd-comment-name">{c.user}</span>
                          <button className="bd-comment-del" onClick={() => deleteComment(c._id)}>🗑 Delete</button>
                        </div>
                        <p className="bd-comment-text">{c.text}</p>
                      </div>
                    ))}
                  </div>}
            </div>
          )}

          {/* MOBILE-ONLY: Similar Stories (sidebar is hidden below 900px) */}
          <div className="bd-mobile-similar">
            <div className="bd-sidebar-title">Similar Stories</div>
            <SimilarBlogs currentBlogId={blog._id} />
          </div>
        </article>

        {/* SIDEBAR (desktop only) */}
        <aside className="bd-sidebar">
          <div className="bd-sidebar-card">
            <div className="bd-sidebar-title">About the Author</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              {authorDetails?.profilePicture
                ? <img src={`data:image/jpeg;base64,${authorDetails.profilePicture}`} alt="" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover'}} />
                : <div className="bd-author-avatar-ph">{getInitials(authorDetails?.fullName)}</div>}
              <div>
                <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)'}}>{authorDetails?.fullName || 'Unknown'}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{authorDetails?.email || ''}</div>
              </div>
            </div>
          </div>
          <div className="bd-sidebar-card">
            <div className="bd-sidebar-title">Similar Stories</div>
            <SimilarBlogs currentBlogId={blog._id} />
          </div>
        </aside>
      </div>

      <BackToTop />
      <MobileNav />
      <div className="mobile-nav-spacer" />
    </div>
  );
}

export default BlogDetail;
