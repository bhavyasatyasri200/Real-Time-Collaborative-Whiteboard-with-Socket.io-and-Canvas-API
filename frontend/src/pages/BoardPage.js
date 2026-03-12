import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CanvasBoard from '../components/CanvasBoard';
import { getSession } from '../services/api';

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        // Allow guest access but show login prompt
        setUser({ name: 'Guest', id: 'guest-' + Date.now(), email: '' });
      });
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading board...</p>
      </div>
    );
  }

  return <CanvasBoard boardId={boardId} user={user} />;
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#1e1b4b',
    gap: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    border: '4px solid rgba(255,255,255,0.2)',
    borderTop: '4px solid #818cf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#a5b4fc',
    fontSize: 16,
    fontWeight: 600,
  },
};