import React from 'react';
import useCanvasStore from '../store/canvasStore';

const COLORS = ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#ffffff'];
const SIZES = [2, 4, 8, 14];

const tools = [
  { id: 'pen', label: '✏️', title: 'Pen', testid: 'tool-pen' },
  { id: 'rectangle', label: '▭', title: 'Rectangle', testid: 'tool-rectangle' },
  { id: 'select', label: '↖', title: 'Select', testid: 'tool-select' },
  { id: 'eraser', label: '🧹', title: 'Eraser', testid: 'tool-eraser' },
];

export default function Toolbar({ onUndo, onRedo, onSave, onClear, canUndo, canRedo, saving }) {
  const { activeTool, brushColor, brushSize, setActiveTool, setBrushColor, setBrushSize } =
    useCanvasStore();

  return (
    <div style={styles.toolbar}>
      {/* Logo */}
      <div style={styles.logo}>🎨 WhiteBoard</div>

      <div style={styles.divider} />

      {/* Drawing Tools */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Tools</div>
        <div style={styles.toolGroup}>
          {tools.map((t) => (
            <button
              key={t.id}
              data-testid={t.testid}
              title={t.title}
              onClick={() => setActiveTool(t.id)}
              style={{
                ...styles.toolBtn,
                ...(activeTool === t.id ? styles.toolBtnActive : {}),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.divider} />

      {/* Colors */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Color</div>
        <div style={styles.colorRow}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setBrushColor(c)}
              style={{
                ...styles.colorBtn,
                background: c,
                border: brushColor === c ? '3px solid #4f46e5' : '2px solid #ccc',
              }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={styles.colorPicker}
            title="Custom color"
          />
        </div>
      </div>

      <div style={styles.divider} />

      {/* Brush Size */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Size: {brushSize}px</div>
        <div style={styles.sizeRow}>
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              style={{
                ...styles.sizeBtn,
                ...(brushSize === s ? styles.sizeBtnActive : {}),
              }}
              title={`${s}px`}
            >
              <div
                style={{
                  width: s + 4,
                  height: s + 4,
                  borderRadius: '50%',
                  background: brushColor,
                  margin: 'auto',
                }}
              />
            </button>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: '100%', marginTop: 4 }}
        />
      </div>

      <div style={styles.divider} />

      {/* Actions */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Actions</div>
        <div style={styles.actionGroup}>
          <button
            data-testid="undo-button"
            onClick={onUndo}
            disabled={!canUndo}
            style={{ ...styles.actionBtn, ...(canUndo ? {} : styles.disabled) }}
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            data-testid="redo-button"
            onClick={onRedo}
            disabled={!canRedo}
            style={{ ...styles.actionBtn, ...(canRedo ? {} : styles.disabled) }}
            title="Redo (Ctrl+Y)"
          >
            ↪ Redo
          </button>
          <button
            onClick={onSave}
            style={{ ...styles.actionBtn, ...styles.saveBtn }}
            title="Save Board"
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : '💾 Save'}
          </button>
          <button
            onClick={onClear}
            style={{ ...styles.actionBtn, ...styles.clearBtn }}
            title="Clear Canvas"
          >
            🗑 Clear
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    width: 200,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    boxSizing: 'border-box',
    boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  logo: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    padding: '8px 0',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.15)',
    margin: '12px 0',
  },
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#a5b4fc',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  toolGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
  toolBtn: {
    padding: '8px 0',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 18,
    transition: 'all 0.15s',
  },
  toolBtnActive: {
    background: '#4f46e5',
    border: '1px solid #818cf8',
    boxShadow: '0 0 8px rgba(79,70,229,0.6)',
  },
  colorRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center',
  },
  colorBtn: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.1s',
  },
  colorPicker: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    background: 'none',
  },
  sizeRow: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  sizeBtn: {
    width: 32,
    height: 32,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnActive: {
    background: '#4f46e5',
    border: '1px solid #818cf8',
  },
  actionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  actionBtn: {
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  saveBtn: {
    background: 'rgba(16,185,129,0.3)',
    border: '1px solid #10b981',
  },
  clearBtn: {
    background: 'rgba(239,68,68,0.3)',
    border: '1px solid #ef4444',
  },
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};