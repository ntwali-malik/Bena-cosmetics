// Auth service (no tokens). Assumes backend uses cookie/session auth.
// - All requests send credentials so server-set cookies are included.
// - API base from REACT_APP_API_URL (fallback http://localhost:5000/api)

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USER_KEY = 'auth.user';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === 'string' ? data : data?.error || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Auth endpoints (adjust paths to match your backend)
export async function login({ email, password }) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password } });
  if (data?.user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(data.user)); } catch (e) {}
  }
  return data;
}

// Create a new user
export async function register(payload) {
  // Usually: { username, email, password }
  return request('/users', { method: 'POST', body: payload });
}

// Get current user
export async function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Optional: hit backend if session-based endpoint exists
  // return request('/auth/me');
  return null;
}

export function logout() {
  try { localStorage.removeItem(USER_KEY); } catch (e) {}
  // Optional: notify backend if needed
  // return request('/auth/logout', { method: 'POST' });
}

export { API_BASE };


