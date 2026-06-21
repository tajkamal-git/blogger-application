export const readingTime = (text = '') => {
  const wpm = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / wpm));
  return mins === 1 ? '1 min read' : `${mins} min read`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const truncate = (str = '', len = 120) =>
  str.length > len ? str.slice(0, len).trimEnd() + '…' : str;

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

export const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
};

export const CATEGORIES = ['All','Technology','Health','Travel','Food','Science','Education','Business','Art','Lifestyle'];

export const SORT_OPTIONS = [
  { value: 'latest',   label: 'Latest' },
  { value: 'liked',     label: 'Most Liked' },
  { value: 'discussed', label: 'Most Discussed' },
];

/* ── Bookmarks (client-side, per-browser, no backend needed) ── */
const BOOKMARK_KEY = 'blogger_bookmarks';

export const getBookmarks = () => {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || []; }
  catch { return []; }
};

export const isBookmarked = (blogId) => getBookmarks().includes(blogId);

export const toggleBookmark = (blogId) => {
  const current = getBookmarks();
  const next = current.includes(blogId)
    ? current.filter(id => id !== blogId)
    : [...current, blogId];
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  return next.includes(blogId);
};

/* ── Native share with clipboard fallback ── */
export const shareContent = async ({ title, text, url }) => {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const ok = await copyToClipboard(url);
  return ok ? 'copied' : 'failed';
};

