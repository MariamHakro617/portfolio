/* ============================================================
   API CLIENT
   Talks to the Express backend. Public content is loaded once
   into an in-memory cache on page load; getData(key) reads from
   that cache synchronously (so existing render code barely
   changes). setData(key, value) is now async and requires an
   admin auth token.
   ============================================================ */

// If the frontend is deployed separately from the backend (e.g. frontend on
// Vercel, backend on Render/Railway), set window.PORTFOLIO_API_BASE to the
// full backend URL before this script loads, e.g.:
//   <script>window.PORTFOLIO_API_BASE = "https://your-backend.onrender.com/api";</script>
// If both are served from the same origin, leave it unset — "/api" just works.
const API_BASE = window.PORTFOLIO_API_BASE || "/api";
const TOKEN_KEY = "portfolio:token";

let contentCache = {};

/* ---- auth token storage ---- */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
function isAuthed() {
  return !!getToken();
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ---- generic fetch helper ---- */
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    // token missing/expired — bounce to login if we're anywhere under /admin/
    if (window.location.pathname.includes("/admin/")) {
      setToken(null);
      window.location.href = "login.html";
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Not authorized.");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

/* ---- content (profile, skills, projects, ...) ---- */
async function loadAllContent() {
  contentCache = await apiFetch("/content");
  return contentCache;
}

function getData(key) {
  return contentCache[key];
}

async function setData(key, value) {
  await apiFetch(`/content/${key}`, { method: "PUT", body: JSON.stringify(value) });
  contentCache[key] = value; // keep local cache in sync after a confirmed save
  return value;
}

async function resetData() {
  await apiFetch("/data/reset", { method: "POST" });
  return loadAllContent();
}

/* ---- auth ---- */
async function login(username, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  setToken(data.token);
  return data;
}
function logout() {
  setToken(null);
}

/* ---- messages ---- */
async function submitContactMessage(msg) {
  return apiFetch("/messages", { method: "POST", body: JSON.stringify(msg) });
}
async function fetchMessages() {
  return apiFetch("/messages");
}
async function markMessageRead(id) {
  return apiFetch(`/messages/${id}`, { method: "PATCH" });
}
async function deleteMessage(id) {
  return apiFetch(`/messages/${id}`, { method: "DELETE" });
}
