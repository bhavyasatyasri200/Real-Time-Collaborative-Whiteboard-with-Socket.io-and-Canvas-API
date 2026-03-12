import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import BoardPage from './pages/BoardPage';
import { getSession, loginWithGoogle, createBoard } from './services/api';
import './App.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSession()
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { boardId } = await createBoard();
      navigate(`/board/${boardId}`);
    } catch {
      // If not authenticated, create a demo board with random ID
      const demoId = 'demo-' + Math.random().toString(36).slice(2, 8);
      navigate(`/board/${demoId}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
      </div>
    );
  }

  return (
    <div style={styles.home}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>✨ Real-Time Collaboration</div>
          <h1 style={styles.title}>
            Collaborative<br />
            <span style={styles.highlight}>Whiteboard</span>
          </h1>
          <p style={styles.subtitle}>
            Draw, sketch, and brainstorm together in real-time. 
            No installs required — just click and start creating.
          </p>

          <div style={styles.actions}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={styles.primaryBtn}
            >
              {creating ? '⏳ Creating...' : '🎨 Start Drawing'}
            </button>
            {!user && (
              <button onClick={loginWithGoogle} style={styles.secondaryBtn}>
                🔐 Sign in with Google
              </button>
            )}
          </div>

          {user && (
            <div style={styles.userWelcome}>
              Welcome back, <strong>{user.name}</strong>! 👋
            </div>
          )}
        </div>

        {/* Feature cards */}
        <div style={styles.features}>
          {[
            { icon: '⚡', title: 'Real-Time Sync', desc: 'See changes instantly as teammates draw' },
            { icon: '🖌️', title: 'Rich Tools', desc: 'Pen, shapes, colors, and more' },
            { icon: '↩️', title: 'Undo / Redo', desc: 'Full history per user' },
            { icon: '💾', title: 'Auto-Save', desc: 'Your work is always preserved' },
          ].map((f) => (
            <div key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#1e1b4b',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: '4px solid #818cf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  home: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  hero: {
    maxWidth: 900,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 48,
  },
  heroContent: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  badge: {
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.5)',
    color: '#a5b4fc',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(36px, 6vw, 64px)',
    fontWeight: 800,
    lineHeight: 1.1,
    margin: 0,
  },
  highlight: {
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 18,
    lineHeight: 1.6,
    maxWidth: 480,
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(79,70,229,0.5)',
    transition: 'transform 0.15s',
  },
  secondaryBtn: {
    padding: '14px 32px',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  userWelcome: {
    color: '#a5b4fc',
    fontSize: 15,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    width: '100%',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '20px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94a3b8',
    fontSize: 13,
  },
};