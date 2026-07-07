// In development, this is empty so fetch('/api/...') goes through the Vite
// proxy defined in vite.config.js. In production, set VITE_API_URL to your
// deployed backend's URL (e.g. https://kgbhsian-backend.onrender.com) and
// every API call will point there instead.
export const API_BASE = import.meta.env.VITE_API_URL || '';
