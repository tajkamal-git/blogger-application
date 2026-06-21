// In the browser, on the deployed site, call the API on the SAME domain (relative path),
// which Vercel routes to the serverless server.js function — see vercel.json.
// Locally (npm start on :3000 + node server.js on :5000), call localhost:5000 directly.
// You can also override this entirely by setting REACT_APP_API_BASE in your environment.
const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE =
  process.env.REACT_APP_API_BASE || (isLocalhost ? 'http://localhost:5000' : '');

