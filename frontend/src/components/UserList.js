import React from 'react';
import useCanvasStore from '../store/canvasStore';

const USER_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function getColor(idx) {
  return USER_COLORS[idx % USER_COLORS.length];
}

export default function UserList() {
  const users = useCanvasStore((s) => s.users);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.title}>Active Users</span>
        <span style={styles.count}>{users.length}</span>
      </div>
      <div data-testid="user-list" style={styles.list}>
        {users.length === 0 ? (
          <div style={styles.empty}>No users yet</div>
        ) : (
          users.map((user, idx) => (
            <div key={user.id} style={styles.userItem}>
              <div style={{ ...styles.avatar, background: getColor(idx) }}>
                {(user.name || 'U')[0].toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user.name || 'Anonymous'}</div>
                <div style={styles.userStatus}>
                  <span style={styles.onlineDot} /> Online
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 200,
    background: '#1e1b4b',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite',
  },
  title: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  count: {
    background: '#4f46e5',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 10,
    padding: '1px 7px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    overflowY: 'auto',
  },
  empty: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  userName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#10b981',
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
  },
};