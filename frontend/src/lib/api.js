export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const TOKEN_KEY = 'ew_token';

/** Server-side fetch with ISR caching. Returns null instead of throwing so pages still render. */
export async function getJSON(path, { revalidate = 60 } = {}) {
  try {
    const res = await fetch(`${API_URL}/api${path}`, {
      next: { revalidate, tags: ['blog'] },
      signal: AbortSignal.timeout(60000), // Render free instances can take ~50s to wake
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

/** Browser-side request that attaches the signed-in user's token. */
export async function api(path, { method = 'GET', body, form } = {}) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !form) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const { url } = await api('/media', { method: 'POST', form });
  return url;
}

/** Ask the Next.js server to refresh cached pages after the admin publishes. */
export async function refreshSite() {
  try {
    await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } });
  } catch { /* pages refresh within a minute anyway */ }
}
