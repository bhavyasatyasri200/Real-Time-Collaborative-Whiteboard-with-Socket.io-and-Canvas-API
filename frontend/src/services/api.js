const API_BASE = "http://localhost:3001";

// ── Health ──────────────────────────────────────────────
export const getHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};

// ── Auth ────────────────────────────────────────────────
export const getSession = async () => {
  const res = await fetch(`${API_BASE}/api/auth/session`, {
    credentials: "include",        // sends session cookie your backend sets
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const loginWithGoogle = () => {
  window.location.href = `${API_BASE}/api/auth/google`;
};

export const logout = async () => {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};

// ── Boards ──────────────────────────────────────────────
export const createBoard = async () => {
  const res = await fetch(`${API_BASE}/api/boards`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

export const getBoard = async (boardId) => {
  const res = await fetch(`${API_BASE}/api/boards/${boardId}`, {
    credentials: "include",
  });
  return res.json();
};

// alias so CanvasBoard.js import works without changes
export const loadBoard = getBoard;

export const saveBoard = async (boardId, objects) => {
  const res = await fetch(`${API_BASE}/api/boards/${boardId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objects }),
  });
  return res.json();
};