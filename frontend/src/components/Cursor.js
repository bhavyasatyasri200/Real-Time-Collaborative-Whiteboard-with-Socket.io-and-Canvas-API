import React from 'react';
import useCanvasStore from '../store/canvasStore';

const CURSOR_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
let colorIndex = 0;
const colorMap = {};

function getCursorColor(userId) {
  if (!colorMap[userId]) {
    colorMap[userId] = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
    colorIndex++;
  }
  return colorMap[userId];
}

export default function RemoteCursors({ stageRef }) {
  const remoteCursors = useCanvasStore((s) => s.remoteCursors);

  return (
    <>
      {Object.entries(remoteCursors).map(([userId, cursor]) => {
        const color = getCursorColor(userId);
        const stageEl = stageRef?.current?.container();
        if (!stageEl) return null;
        const rect = stageEl.getBoundingClientRect();
        const left = rect.left + cursor.x;
        const top = rect.top + cursor.y;

        return (
          <div
            key={userId}
            data-testid="remote-cursor"
            data-userid={userId}
            style={{
              position: 'fixed',
              left,
              top,
              pointerEvents: 'none',
              zIndex: 9999,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor arrow */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 2L18 8L10 10L8 18L2 2Z" fill={color} stroke="white" strokeWidth="1.5" />
            </svg>
            {/* Name label */}
            <div
              style={{
                background: color,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 10,
                marginTop: 2,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              {cursor.name || 'User'}
            </div>
          </div>
        );
      })}
    </>
  );
}