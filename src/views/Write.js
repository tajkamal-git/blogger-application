import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Write.css';
import { useUser } from '../UserContext';
import { useToast } from '../components/Toast';
import { API_BASE } from '../config';
import logo from '../images/blogger.png';

function Write() {
  const { userEmail, darkMode, toggleDarkMode } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const titleRef = useRef(null);

  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [imageB64, setImageB64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags]       = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  /* — auto-resize title — */
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  /* — image upload — */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageB64(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  /* — tags — */
  const addTag = (val) => {
    const t = val.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) { setTags(prev => [...prev, t]); }
    setTagInput('');
  };
  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
    if (e.key === 'Backspace' && !tagInput) setTags(prev => prev.slice(0, -1));
  };

  /* — submit — */
  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Please add a title.'); return; }
    if (!content.trim()) { toast.error('Please add some content.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, title: title.trim(), content: content.trim(), image: imageB64, tags }),
      });
      if (res.ok) { toast.success('Blog published! 🎉'); setTimeout(() => navigate('/home'), 1200); }
      else { toast.error('Failed to publish. Try again.'); }
    } catch { toast.error('Network error.'); }
    finally { setLoading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeE = { target: { files: [file] } };
      handleImageChange(fakeE);
    }
  };

  return (
    <div className="write-page">
      {/* NAVBAR */}
      <nav className="write-nav">
        <Link to="/home" className="write-nav-brand">
          <img src={logo} alt="Blogger" className="write-nav-logo" />
          <span className="write-nav-title">New Story</span>
        </Link>
        <span className="write-word-count">{wordCount} words</span>
        <div className="write-nav-actions">
          <button className="h-dark-btn" onClick={toggleDarkMode} title="Toggle dark mode" style={{background:'none',border:'1.5px solid var(--border)',borderRadius:10,padding:'7px 10px',fontSize:16,cursor:'pointer',color:'var(--text-secondary)',transition:'all 0.2s'}}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/home" className="btn btn-secondary write-nav-back" style={{fontSize:13,padding:'7px 14px'}}>← Back</Link>
          <button className="btn btn-primary write-nav-publish" style={{fontSize:13,padding:'7px 16px'}} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"/> : '🚀 Publish'}
          </button>
        </div>
      </nav>

      {/* MOBILE STICKY PUBLISH BAR */}
      <div className="write-mobile-bar">
        <button className="btn btn-secondary" style={{flex:1,fontSize:13}} onClick={() => navigate('/home')}>Discard</button>
        <button className="btn btn-primary" style={{flex:2,fontSize:13}} onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner"/> : '🚀 Publish Story'}
        </button>
      </div>

      <div className="write-body">
        {/* EDITOR */}
        <div className="write-editor">
          <textarea
            ref={titleRef}
            className="write-title-input"
            placeholder="Your story begins with a title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            rows={1}
          />
          <div className="write-divider" />
          <textarea
            className="write-content-textarea"
            placeholder="Tell your story. What did you learn? What inspired you? What happened? The world is ready to listen…"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        {/* SIDEBAR */}
        <div className="write-sidebar">
          {/* Cover image */}
          <div className="write-sidebar-section">
            <span className="write-sidebar-label">Cover Image</span>
            <div className="write-image-upload">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="write-image-preview" />
                  <button className="write-image-remove" onClick={() => { setImagePreview(null); setImageB64(null); }}>
                    🗑 Remove image
                  </button>
                </>
              ) : (
                <div className="write-image-drop" onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('imgInput').click()}>
                  <div className="write-image-drop-icon">🖼️</div>
                  <p className="write-image-drop-text">
                    Click or drag & drop to upload
                    <span>PNG, JPG up to 5 MB</span>
                  </p>
                </div>
              )}
              <input type="file" id="imgInput" accept="image/*"
                className="write-image-file-input" onChange={handleImageChange} />
            </div>
          </div>

          {/* Tags */}
          <div className="write-sidebar-section">
            <span className="write-sidebar-label">Tags (up to 5)</span>
            <div className="tags-input-wrap" onClick={() => document.getElementById('tagInput').focus()}>
              {tags.map(t => (
                <span key={t} className="tag-chip">
                  #{t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))}>×</button>
                </span>
              ))}
              {tags.length < 5 && (
                <input id="tagInput" className="tags-input" placeholder={tags.length ? '' : 'Add a tag…'}
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey} onBlur={() => tagInput && addTag(tagInput)} />
              )}
            </div>
            <p className="tags-hint">Press Enter or comma to add. e.g. technology, health</p>
          </div>

          {/* Publish */}
          <div className="write-sidebar-section">
            <span className="write-sidebar-label">Publish</span>
            <button className="btn btn-primary write-publish-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spinner"/> Publishing…</> : '🚀 Publish Story'}
            </button>
            <button className="btn btn-secondary write-draft-btn" onClick={() => navigate('/home')}>
              Discard
            </button>
            <p className="write-publish-info">Your story will be visible to all readers.</p>
          </div>

          {/* Tips */}
          <div className="write-sidebar-section">
            <span className="write-sidebar-label">Writing Tips</span>
            <div className="write-guidelines">
              <p>📌 Hook readers in the first sentence.<br />
              📌 Use short paragraphs for readability.<br />
              📌 Add a cover image to boost engagement.<br />
              📌 Tag your post to reach the right audience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Write;
