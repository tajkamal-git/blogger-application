import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './similarblog.css';
import { API_BASE } from '../config';
import { readingTime } from '../utils/helpers';

const SimilarBlogs = ({ currentBlogId }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch$ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/similar-blogs/${currentBlogId}`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.slice(0, 5));
        } else {
          // fallback: fetch all and exclude current
          const fallback = await fetch(`${API_BASE}/api/blogs`);
          if (fallback.ok) {
            const all = await fallback.json();
            setBlogs(all.filter(b => b._id !== currentBlogId).slice(0, 5));
          }
        }
      } catch {
        try {
          const fallback = await fetch(`${API_BASE}/api/blogs`);
          if (fallback.ok) {
            const all = await fallback.json();
            setBlogs(all.filter(b => b._id !== currentBlogId).slice(0, 5));
          }
        } catch {}
      } finally { setLoading(false); }
    };
    if (currentBlogId) fetch$();
  }, [currentBlogId]);

  if (loading) return (
    <div className="sb-loading">
      {[1,2,3].map(i => <div key={i} className="skeleton sb-skel" />)}
    </div>
  );

  if (!blogs.length) return <div className="sb-empty">No similar stories found.</div>;

  return (
    <div className="sb-list">
      {blogs.map(b => (
        <div key={b._id} className="sb-item" onClick={() => navigate(`/blog/${b._id}`)}>
          {b.image
            ? <img src={`data:image/jpeg;base64,${b.image}`} alt="" className="sb-thumb" />
            : <div className="sb-thumb-ph">📝</div>}
          <div className="sb-body">
            <div className="sb-title">{b.title}</div>
            <div className="sb-meta">
              <span>❤️ {b.likes || 0}</span>
              <span>⏱ {readingTime(b.content)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimilarBlogs;
