const env = import.meta.env;

/** Marketing site — Buy me a coffee / support links only. */
export const WEB_BASE =
  (typeof env !== 'undefined' && env.VITE_WEB_URL) || 'http://localhost:3001';

export function webUrl(path = '/') {
  const base = WEB_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const API_BASE = 
  (typeof env !== 'undefined' && env.VITE_API_URL) || 'http://localhost:3000';

export function apiUrl(path = '/') {
  const base = API_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
