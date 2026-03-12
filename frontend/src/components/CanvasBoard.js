// // // // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // // // import Konva from 'konva';
// // // // import { Stage, Layer, Line, Rect, Transformer } from 'react-konva';
// // // // import useCanvasStore from '../store/canvasStore';
// // // // import { connectSocket, disconnectSocket } from '../socket.js';
// // // // import { saveBoard, loadBoard } from '../services/api';
// // // // import Toolbar from './Toolbar';
// // // // import UserList from './UserList';
// // // // import RemoteCursors from './Cursor';

// // // // const DEBOUNCE_CURSOR = 30; // ms

// // // // export default function CanvasBoard({ boardId, user }) {
// // // //   const stageRef = useRef(null);
// // // //   const layerRef = useRef(null);
// // // //   const isDrawing = useRef(false);
// // // //   const currentLine = useRef(null);
// // // //   const rectStart = useRef(null);
// // // //   const currentRect = useRef(null);
// // // //   const lastCursorEmit = useRef(0);

// // // //   const [lines, setLines] = useState([]);
// // // //   const [rects, setRects] = useState([]);
// // // //   const [selectedId, setSelectedId] = useState(null);
// // // //   const [saving, setSaving] = useState(false);
// // // //   const [notification, setNotification] = useState('');

// // // //   const {
// // // //     activeTool,
// // // //     brushColor,
// // // //     brushSize,
// // // //     setUsers,
// // // //     updateRemoteCursor,
// // // //     removeRemoteCursor,
// // // //     pushUndo,
// // // //     undo,
// // // //     redo,
// // // //     canUndo,
// // // //     canRedo,
// // // //   } = useCanvasStore();

// // // //   // ---- Socket Setup ----
// // // //   useEffect(() => {
// // // //     const socket = connectSocket();

// // // //     socket.on('connect', () => {
// // // //       console.log('Socket connected:', socket.id);
// // // //       socket.emit('joinRoom', { boardId });
// // // //     });

// // // //     socket.on('roomUsers', ({ users }) => {
// // // //       setUsers(users);
// // // //     });

// // // //     socket.on('cursorUpdate', ({ userId, x, y, name }) => {
// // // //       if (userId !== socket.id) updateRemoteCursor(userId, x, y, name);
// // // //     });

// // // //     socket.on('drawUpdate', (data) => {
// // // //       if (data.socketId !== socket.id) {
// // // //         setLines((prev) => [...prev, data]);
// // // //       }
// // // //     });

// // // //     socket.on('objectAdded', (data) => {
// // // //       if (data.socketId !== socket.id) {
// // // //         if (data.type === 'rectangle') {
// // // //           setRects((prev) => [...prev, data]);
// // // //         }
// // // //       }
// // // //     });

// // // //     socket.on('canvasCleared', () => {
// // // //       setLines([]);
// // // //       setRects([]);
// // // //     });

// // // //     socket.on('boardState', ({ objects }) => {
// // // //       if (!objects) return;
// // // //       const loadedLines = objects.filter((o) => o.type === 'line');
// // // //       const loadedRects = objects.filter((o) => o.type === 'rectangle');
// // // //       setLines(loadedLines);
// // // //       setRects(loadedRects);
// // // //     });

// // // //     socket.on('userLeft', ({ userId }) => {
// // // //       removeRemoteCursor(userId);
// // // //     });

// // // //     return () => {
// // // //       socket.off('connect');
// // // //       socket.off('roomUsers');
// // // //       socket.off('cursorUpdate');
// // // //       socket.off('drawUpdate');
// // // //       socket.off('objectAdded');
// // // //       socket.off('canvasCleared');
// // // //       socket.off('boardState');
// // // //       socket.off('userLeft');
// // // //     };
// // // //   }, [boardId]);

// // // //   // ---- Load board on mount ----
// // // //   useEffect(() => {
// // // //     loadBoard(boardId)
// // // //       .then(({ objects }) => {
// // // //         if (!objects) return;
// // // //         setLines(objects.filter((o) => o.type === 'line'));
// // // //         setRects(objects.filter((o) => o.type === 'rectangle'));
// // // //       })
// // // //       .catch(() => {}); // board may not exist yet
// // // //   }, [boardId]);

// // // //   // ---- Expose getCanvasAsJSON on window for testing ----
// // // //   useEffect(() => {
// // // //     window.getCanvasAsJSON = () => {
// // // //       return JSON.parse(JSON.stringify([...lines, ...rects]));
// // // //     };
// // // //     return () => {
// // // //       delete window.getCanvasAsJSON;
// // // //     };
// // // //   }, [lines, rects]);

// // // //   // ---- Keyboard shortcuts ----
// // // //   useEffect(() => {
// // // //     const handleKey = (e) => {
// // // //       if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
// // // //         e.preventDefault();
// // // //         if (e.shiftKey) handleRedo();
// // // //         else handleUndo();
// // // //       }
// // // //       if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
// // // //         e.preventDefault();
// // // //         handleRedo();
// // // //       }
// // // //       if (e.key === 'Escape') setSelectedId(null);
// // // //     };
// // // //     window.addEventListener('keydown', handleKey);
// // // //     return () => window.removeEventListener('keydown', handleKey);
// // // //   });

// // // //   // Snapshot helper
// // // //   const takeSnapshot = useCallback(() => {
// // // //     pushUndo(JSON.parse(JSON.stringify({ lines, rects })));
// // // //   }, [lines, rects, pushUndo]);

// // // //   // ---- Mouse Handlers ----
// // // //   const handleMouseDown = (e) => {
// // // //     const pos = e.target.getStage().getPointerPosition();
// // // //     if (!pos) return;

// // // //     if (activeTool === 'select') {
// // // //       return; // let transformer handle it
// // // //     }

// // // //     isDrawing.current = true;
// // // //     takeSnapshot();

// // // //     if (activeTool === 'pen' || activeTool === 'eraser') {
// // // //       const newLine = {
// // // //         id: `line-${Date.now()}-${Math.random()}`,
// // // //         type: 'line',
// // // //         tool: activeTool,
// // // //         points: [pos.x, pos.y],
// // // //         color: activeTool === 'eraser' ? '#ffffff' : brushColor,
// // // //         brushSize: activeTool === 'eraser' ? 20 : brushSize,
// // // //         socketId: getSocket()?.id,
// // // //       };
// // // //       currentLine.current = newLine;
// // // //       setLines((prev) => [...prev, newLine]);
// // // //     }

// // // //     if (activeTool === 'rectangle') {
// // // //       rectStart.current = pos;
// // // //       const newRect = {
// // // //         id: `rect-${Date.now()}-${Math.random()}`,
// // // //         type: 'rectangle',
// // // //         x: pos.x,
// // // //         y: pos.y,
// // // //         width: 0,
// // // //         height: 0,
// // // //         fill: brushColor + '44',
// // // //         stroke: brushColor,
// // // //         strokeWidth: brushSize,
// // // //         socketId: getSocket()?.id,
// // // //       };
// // // //       currentRect.current = newRect;
// // // //       setRects((prev) => [...prev, newRect]);
// // // //     }
// // // //   };

// // // //   const handleMouseMove = (e) => {
// // // //     const stage = e.target.getStage();
// // // //     const pos = stage.getPointerPosition();
// // // //     if (!pos) return;

// // // //     // Emit cursor
// // // //     const now = Date.now();
// // // //     if (now - lastCursorEmit.current > DEBOUNCE_CURSOR) {
// // // //       lastCursorEmit.current = now;
// // // //       getSocket()?.emit('cursorMove', { x: pos.x, y: pos.y });
// // // //     }

// // // //     if (!isDrawing.current) return;

// // // //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// // // //       const newPoints = [...currentLine.current.points, pos.x, pos.y];
// // // //       currentLine.current = { ...currentLine.current, points: newPoints };
// // // //       setLines((prev) =>
// // // //         prev.map((l) => (l.id === currentLine.current.id ? currentLine.current : l))
// // // //       );
// // // //     }

// // // //     if (activeTool === 'rectangle' && rectStart.current && currentRect.current) {
// // // //       const updated = {
// // // //         ...currentRect.current,
// // // //         x: Math.min(pos.x, rectStart.current.x),
// // // //         y: Math.min(pos.y, rectStart.current.y),
// // // //         width: Math.abs(pos.x - rectStart.current.x),
// // // //         height: Math.abs(pos.y - rectStart.current.y),
// // // //       };
// // // //       currentRect.current = updated;
// // // //       setRects((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
// // // //     }
// // // //   };

// // // //   const handleMouseUp = () => {
// // // //     if (!isDrawing.current) return;
// // // //     isDrawing.current = false;
// // // //     const socket = getSocket();

// // // //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// // // //       socket?.emit('draw', currentLine.current);
// // // //       currentLine.current = null;
// // // //     }

// // // //     if (activeTool === 'rectangle' && currentRect.current) {
// // // //       socket?.emit('addObject', currentRect.current);
// // // //       currentRect.current = null;
// // // //       rectStart.current = null;
// // // //     }
// // // //   };

// // // //   // ---- Undo / Redo ----
// // // //   const handleUndo = () => {
// // // //     const snapshot = undo();
// // // //     if (snapshot) {
// // // //       setLines(snapshot.lines || []);
// // // //       setRects(snapshot.rects || []);
// // // //       getSocket()?.emit('canvasUpdate', snapshot);
// // // //     }
// // // //   };

// // // //   const handleRedo = () => {
// // // //     const snapshot = redo();
// // // //     if (snapshot) {
// // // //       setLines(snapshot.lines || []);
// // // //       setRects(snapshot.rects || []);
// // // //       getSocket()?.emit('canvasUpdate', snapshot);
// // // //     }
// // // //   };

// // // //   // ---- Save ----
// // // //   const handleSave = async () => {
// // // //     setSaving(true);
// // // //     try {
// // // //       await saveBoard(boardId, [...lines, ...rects]);
// // // //       showNotification('Board saved! ✅');
// // // //     } catch {
// // // //       showNotification('Save failed ❌');
// // // //     } finally {
// // // //       setSaving(false);
// // // //     }
// // // //   };

// // // //   // ---- Clear ----
// // // //   const handleClear = () => {
// // // //     takeSnapshot();
// // // //     setLines([]);
// // // //     setRects([]);
// // // //     setSelectedId(null);
// // // //     getSocket()?.emit('clearCanvas', { boardId });
// // // //     showNotification('Canvas cleared');
// // // //   };

// // // //   const showNotification = (msg) => {
// // // //     setNotification(msg);
// // // //     setTimeout(() => setNotification(''), 2500);
// // // //   };

// // // //   // Cursor style based on tool
// // // //   const cursorStyle =
// // // //     activeTool === 'pen'
// // // //       ? 'crosshair'
// // // //       : activeTool === 'eraser'
// // // //       ? 'cell'
// // // //       : activeTool === 'rectangle'
// // // //       ? 'crosshair'
// // // //       : 'default';

// // // //   return (
// // // //     <div style={styles.root}>
// // // //       {/* Left Toolbar */}
// // // //       <Toolbar
// // // //         onUndo={handleUndo}
// // // //         onRedo={handleRedo}
// // // //         onSave={handleSave}
// // // //         onClear={handleClear}
// // // //         canUndo={canUndo()}
// // // //         canRedo={canRedo()}
// // // //         saving={saving}
// // // //       />

// // // //       {/* Canvas Area */}
// // // //       <div style={styles.canvasWrapper}>
// // // //         {/* Top bar */}
// // // //         <div style={styles.topBar}>
// // // //           <div style={styles.boardTitle}>
// // // //             📋 Board: <code style={styles.boardId}>{boardId}</code>
// // // //           </div>
// // // //           {user && (
// // // //             <div style={styles.userChip}>
// // // //               <div style={styles.userAvatar}>{(user.name || 'U')[0].toUpperCase()}</div>
// // // //               <span>{user.name}</span>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {/* Notification */}
// // // //         {notification && <div style={styles.notification}>{notification}</div>}

// // // //         {/* Konva Stage */}
// // // //         <Stage
// // // //           ref={stageRef}
// // // //           width={window.innerWidth - 420}
// // // //           height={window.innerHeight - 56}
// // // //           style={{ cursor: cursorStyle, background: '#fff' }}
// // // //           onMouseDown={handleMouseDown}
// // // //           onMouseMove={handleMouseMove}
// // // //           onMouseUp={handleMouseUp}
// // // //           onTouchStart={handleMouseDown}
// // // //           onTouchMove={handleMouseMove}
// // // //           onTouchEnd={handleMouseUp}
// // // //         >
// // // //           <Layer ref={layerRef}>
// // // //             {/* Render lines */}
// // // //             {lines.map((line) => (
// // // //               <Line
// // // //                 key={line.id}
// // // //                 points={line.points}
// // // //                 stroke={line.color}
// // // //                 strokeWidth={line.brushSize}
// // // //                 tension={0.4}
// // // //                 lineCap="round"
// // // //                 lineJoin="round"
// // // //                 globalCompositeOperation={
// // // //                   line.tool === 'eraser' ? 'destination-out' : 'source-over'
// // // //                 }
// // // //               />
// // // //             ))}

// // // //             {/* Render rectangles */}
// // // //             {rects.map((rect) => (
// // // //               <Rect
// // // //                 key={rect.id}
// // // //                 x={rect.x}
// // // //                 y={rect.y}
// // // //                 width={rect.width}
// // // //                 height={rect.height}
// // // //                 fill={rect.fill}
// // // //                 stroke={rect.stroke}
// // // //                 strokeWidth={rect.strokeWidth}
// // // //                 draggable={activeTool === 'select'}
// // // //                 onClick={() => activeTool === 'select' && setSelectedId(rect.id)}
// // // //                 onDragEnd={(e) => {
// // // //                   const updated = {
// // // //                     ...rect,
// // // //                     x: e.target.x(),
// // // //                     y: e.target.y(),
// // // //                   };
// // // //                   setRects((prev) => prev.map((r) => (r.id === rect.id ? updated : r)));
// // // //                   getSocket()?.emit('objectMoved', updated);
// // // //                 }}
// // // //               />
// // // //             ))}
// // // //           </Layer>
// // // //         </Stage>
// // // //       </div>

// // // //       {/* Right User Panel */}
// // // //       <UserList />

// // // //       {/* Remote Cursors Overlay */}
// // // //       <RemoteCursors stageRef={stageRef} />
// // // //     </div>
// // // //   );
// // // // }

// // // // function getSocket() {
// // // //   try {
// // // //     const { getSocket: gs } = require('../services/socket');
// // // //     return gs();
// // // //   } catch {
// // // //     return null;
// // // //   }
// // // // }

// // // // const styles = {
// // // //   root: {
// // // //     display: 'flex',
// // // //     height: '100vh',
// // // //     overflow: 'hidden',
// // // //     background: '#f0f0f0',
// // // //   },
// // // //   canvasWrapper: {
// // // //     flex: 1,
// // // //     display: 'flex',
// // // //     flexDirection: 'column',
// // // //     overflow: 'hidden',
// // // //     position: 'relative',
// // // //   },
// // // //   topBar: {
// // // //     height: 56,
// // // //     background: '#1e1b4b',
// // // //     display: 'flex',
// // // //     alignItems: 'center',
// // // //     padding: '0 20px',
// // // //     justifyContent: 'space-between',
// // // //     boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
// // // //     flexShrink: 0,
// // // //   },
// // // //   boardTitle: {
// // // //     color: '#a5b4fc',
// // // //     fontSize: 14,
// // // //     fontWeight: 600,
// // // //   },
// // // //   boardId: {
// // // //     background: 'rgba(255,255,255,0.1)',
// // // //     padding: '2px 8px',
// // // //     borderRadius: 6,
// // // //     fontSize: 12,
// // // //     color: '#c7d2fe',
// // // //   },
// // // //   userChip: {
// // // //     display: 'flex',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //     color: '#fff',
// // // //     fontSize: 14,
// // // //     fontWeight: 600,
// // // //     background: 'rgba(255,255,255,0.1)',
// // // //     padding: '4px 12px',
// // // //     borderRadius: 20,
// // // //   },
// // // //   userAvatar: {
// // // //     width: 28,
// // // //     height: 28,
// // // //     borderRadius: '50%',
// // // //     background: '#4f46e5',
// // // //     color: '#fff',
// // // //     display: 'flex',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     fontSize: 13,
// // // //     fontWeight: 700,
// // // //   },
// // // //   notification: {
// // // //     position: 'absolute',
// // // //     top: 66,
// // // //     left: '50%',
// // // //     transform: 'translateX(-50%)',
// // // //     background: '#1e1b4b',
// // // //     color: '#fff',
// // // //     padding: '8px 20px',
// // // //     borderRadius: 20,
// // // //     fontSize: 13,
// // // //     fontWeight: 600,
// // // //     zIndex: 1000,
// // // //     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
// // // //     animation: 'fadeIn 0.2s ease',
// // // //   },
// // // // };

// // // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // // import { Stage, Layer, Line, Rect } from 'react-konva';
// // // import { io } from 'socket.io-client';
// // // import useCanvasStore from '../store/canvasStore';
// // // import { saveBoard, loadBoard } from '../services/api';
// // // import Toolbar from './Toolbar';
// // // import UserList from './UserList';
// // // import RemoteCursors from './Cursor';

// // // // ── Socket singleton inlined — no external socket.js import needed ──────────
// // // let _socket = null;

// // // const connectSocket = () => {
// // //   if (!_socket) {
// // //     _socket = io('http://localhost:3001', {
// // //       withCredentials: true,
// // //       autoConnect: true,
// // //     });
// // //   }
// // //   return _socket;
// // // };

// // // const getSocket = () => _socket;
// // // // ───────────────────────────────────────────────────────────────────────────

// // // const DEBOUNCE_CURSOR = 30;

// // // export default function CanvasBoard({ boardId, user }) {
// // //   const stageRef       = useRef(null);
// // //   const layerRef       = useRef(null);
// // //   const isDrawing      = useRef(false);
// // //   const currentLine    = useRef(null);
// // //   const rectStart      = useRef(null);
// // //   const currentRect    = useRef(null);
// // //   const lastCursorEmit = useRef(0);

// // //   const [lines,        setLines]        = useState([]);
// // //   const [rects,        setRects]        = useState([]);
// // //   const [selectedId,   setSelectedId]   = useState(null);
// // //   const [saving,       setSaving]       = useState(false);
// // //   const [notification, setNotification] = useState('');

// // //   // ✅ Fixed: use state for dimensions instead of raw window values
// // //   const [dimensions, setDimensions] = useState({
// // //     width:  Math.max(window.innerWidth  - 420, 300),
// // //     height: Math.max(window.innerHeight -  56, 300),
// // //   });

// // //   const {
// // //     activeTool, brushColor, brushSize,
// // //     setUsers, updateRemoteCursor, removeRemoteCursor,
// // //     pushUndo, undo, redo, canUndo, canRedo,
// // //   } = useCanvasStore();

// // //   // ── Window resize handler ──────────────────────────────────────────────────
// // //   useEffect(() => {
// // //     const onResize = () => {
// // //       setDimensions({
// // //         width:  Math.max(window.innerWidth  - 420, 300),
// // //         height: Math.max(window.innerHeight -  56, 300),
// // //       });
// // //     };
// // //     window.addEventListener('resize', onResize);
// // //     return () => window.removeEventListener('resize', onResize);
// // //   }, []);

// // //   // ── Socket setup ───────────────────────────────────────────────────────────
// // //   useEffect(() => {
// // //     const socket = connectSocket();

// // //     const onConnect       = () => socket.emit('joinRoom', { boardId });
// // //     const onRoomUsers     = ({ users }) => setUsers(users);
// // //     const onCursorUpdate  = ({ userId, x, y, name }) => {
// // //       if (userId !== socket.id) updateRemoteCursor(userId, x, y, name);
// // //     };
// // //     const onDrawUpdate    = (data) => {
// // //       if (data.socketId !== socket.id) setLines(prev => [...prev, data]);
// // //     };
// // //     const onObjectAdded   = (data) => {
// // //       if (data.socketId !== socket.id && data.type === 'rectangle')
// // //         setRects(prev => [...prev, data]);
// // //     };
// // //     const onCanvasCleared = () => { setLines([]); setRects([]); };
// // //     const onBoardState    = ({ objects }) => {
// // //       if (!objects) return;
// // //       setLines(objects.filter(o => o.type === 'line'));
// // //       setRects(objects.filter(o => o.type === 'rectangle'));
// // //     };
// // //     const onUserLeft = ({ userId }) => removeRemoteCursor(userId);

// // //     socket.on('connect',       onConnect);
// // //     socket.on('roomUsers',     onRoomUsers);
// // //     socket.on('cursorUpdate',  onCursorUpdate);
// // //     socket.on('drawUpdate',    onDrawUpdate);
// // //     socket.on('objectAdded',   onObjectAdded);
// // //     socket.on('canvasCleared', onCanvasCleared);
// // //     socket.on('boardState',    onBoardState);
// // //     socket.on('userLeft',      onUserLeft);

// // //     // join immediately if already connected
// // //     if (socket.connected) socket.emit('joinRoom', { boardId });

// // //     return () => {
// // //       socket.off('connect',       onConnect);
// // //       socket.off('roomUsers',     onRoomUsers);
// // //       socket.off('cursorUpdate',  onCursorUpdate);
// // //       socket.off('drawUpdate',    onDrawUpdate);
// // //       socket.off('objectAdded',   onObjectAdded);
// // //       socket.off('canvasCleared', onCanvasCleared);
// // //       socket.off('boardState',    onBoardState);
// // //       socket.off('userLeft',      onUserLeft);
// // //     };
// // //   }, [boardId]);

// // //   // ── Load board on mount ────────────────────────────────────────────────────
// // //   useEffect(() => {
// // //     loadBoard(boardId)
// // //       .then(({ objects }) => {
// // //         if (!objects) return;
// // //         setLines(objects.filter(o => o.type === 'line'));
// // //         setRects(objects.filter(o => o.type === 'rectangle'));
// // //       })
// // //       .catch(() => {});
// // //   }, [boardId]);

// // //   // ── Expose window.getCanvasAsJSON for automated tests ─────────────────────
// // //   useEffect(() => {
// // //     window.getCanvasAsJSON = () =>
// // //       JSON.parse(JSON.stringify([...lines, ...rects]));
// // //     return () => { delete window.getCanvasAsJSON; };
// // //   }, [lines, rects]);

// // //   // ── Keyboard shortcuts ─────────────────────────────────────────────────────
// // //   useEffect(() => {
// // //     const onKey = (e) => {
// // //       if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
// // //         e.preventDefault();
// // //         e.shiftKey ? handleRedo() : handleUndo();
// // //       }
// // //       if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
// // //         e.preventDefault();
// // //         handleRedo();
// // //       }
// // //       if (e.key === 'Escape') setSelectedId(null);
// // //     };
// // //     window.addEventListener('keydown', onKey);
// // //     return () => window.removeEventListener('keydown', onKey);
// // //   });

// // //   // ── Snapshot helper ────────────────────────────────────────────────────────
// // //   const takeSnapshot = useCallback(() => {
// // //     pushUndo(JSON.parse(JSON.stringify({ lines, rects })));
// // //   }, [lines, rects, pushUndo]);

// // //   // ── Mouse handlers ─────────────────────────────────────────────────────────
// // //   const handleMouseDown = (e) => {
// // //     const pos = e.target.getStage().getPointerPosition();
// // //     if (!pos || activeTool === 'select') return;

// // //     isDrawing.current = true;
// // //     takeSnapshot();

// // //     if (activeTool === 'pen' || activeTool === 'eraser') {
// // //       const newLine = {
// // //         id:        `line-${Date.now()}-${Math.random()}`,
// // //         type:      'line',
// // //         tool:      activeTool,
// // //         points:    [pos.x, pos.y],
// // //         color:     activeTool === 'eraser' ? '#ffffff' : brushColor,
// // //         brushSize: activeTool === 'eraser' ? 20 : brushSize,
// // //         socketId:  getSocket()?.id,
// // //       };
// // //       currentLine.current = newLine;
// // //       setLines(prev => [...prev, newLine]);
// // //     }

// // //     if (activeTool === 'rectangle') {
// // //       rectStart.current = pos;
// // //       const newRect = {
// // //         id:          `rect-${Date.now()}-${Math.random()}`,
// // //         type:        'rectangle',
// // //         x:           pos.x,
// // //         y:           pos.y,
// // //         width:       0,
// // //         height:      0,
// // //         fill:        brushColor + '44',
// // //         stroke:      brushColor,
// // //         strokeWidth: brushSize,
// // //         socketId:    getSocket()?.id,
// // //       };
// // //       currentRect.current = newRect;
// // //       setRects(prev => [...prev, newRect]);
// // //     }
// // //   };

// // //   const handleMouseMove = (e) => {
// // //     const pos = e.target.getStage().getPointerPosition();
// // //     if (!pos) return;

// // //     const now = Date.now();
// // //     if (now - lastCursorEmit.current > DEBOUNCE_CURSOR) {
// // //       lastCursorEmit.current = now;
// // //       getSocket()?.emit('cursorMove', { x: pos.x, y: pos.y });
// // //     }

// // //     if (!isDrawing.current) return;

// // //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// // //       const updated = {
// // //         ...currentLine.current,
// // //         points: [...currentLine.current.points, pos.x, pos.y],
// // //       };
// // //       currentLine.current = updated;
// // //       setLines(prev => prev.map(l => l.id === updated.id ? updated : l));
// // //     }

// // //     if (activeTool === 'rectangle' && rectStart.current && currentRect.current) {
// // //       const updated = {
// // //         ...currentRect.current,
// // //         x:      Math.min(pos.x, rectStart.current.x),
// // //         y:      Math.min(pos.y, rectStart.current.y),
// // //         width:  Math.abs(pos.x - rectStart.current.x),
// // //         height: Math.abs(pos.y - rectStart.current.y),
// // //       };
// // //       currentRect.current = updated;
// // //       setRects(prev => prev.map(r => r.id === updated.id ? updated : r));
// // //     }
// // //   };

// // //   const handleMouseUp = () => {
// // //     if (!isDrawing.current) return;
// // //     isDrawing.current = false;
// // //     const socket = getSocket();

// // //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// // //       socket?.emit('draw', currentLine.current);
// // //       currentLine.current = null;
// // //     }
// // //     if (activeTool === 'rectangle' && currentRect.current) {
// // //       socket?.emit('addObject', currentRect.current);
// // //       currentRect.current = null;
// // //       rectStart.current   = null;
// // //     }
// // //   };

// // //   // ── Undo / Redo ────────────────────────────────────────────────────────────
// // //   const handleUndo = () => {
// // //     const snapshot = undo();
// // //     if (snapshot) {
// // //       setLines(snapshot.lines || []);
// // //       setRects(snapshot.rects || []);
// // //       getSocket()?.emit('canvasUpdate', snapshot);
// // //     }
// // //   };

// // //   const handleRedo = () => {
// // //     const snapshot = redo();
// // //     if (snapshot) {
// // //       setLines(snapshot.lines || []);
// // //       setRects(snapshot.rects || []);
// // //       getSocket()?.emit('canvasUpdate', snapshot);
// // //     }
// // //   };

// // //   // ── Save ───────────────────────────────────────────────────────────────────
// // //   const handleSave = async () => {
// // //     setSaving(true);
// // //     try {
// // //       await saveBoard(boardId, [...lines, ...rects]);
// // //       showNotification('Board saved! ✅');
// // //     } catch {
// // //       showNotification('Save failed ❌');
// // //     } finally {
// // //       setSaving(false);
// // //     }
// // //   };

// // //   // ── Clear ──────────────────────────────────────────────────────────────────
// // //   const handleClear = () => {
// // //     takeSnapshot();
// // //     setLines([]);
// // //     setRects([]);
// // //     setSelectedId(null);
// // //     getSocket()?.emit('clearCanvas', { boardId });
// // //     showNotification('Canvas cleared');
// // //   };

// // //   const showNotification = (msg) => {
// // //     setNotification(msg);
// // //     setTimeout(() => setNotification(''), 2500);
// // //   };

// // //   const cursorStyle =
// // //     activeTool === 'pen'       ? 'crosshair' :
// // //     activeTool === 'eraser'    ? 'cell'      :
// // //     activeTool === 'rectangle' ? 'crosshair' : 'default';

// // //   // ── Render ─────────────────────────────────────────────────────────────────
// // //   return (
// // //     <div style={styles.root}>
// // //       <Toolbar
// // //         onUndo={handleUndo}
// // //         onRedo={handleRedo}
// // //         onSave={handleSave}
// // //         onClear={handleClear}
// // //         canUndo={canUndo()}
// // //         canRedo={canRedo()}
// // //         saving={saving}
// // //       />

// // //       <div style={styles.canvasWrapper}>
// // //         <div style={styles.topBar}>
// // //           <div style={styles.boardTitle}>
// // //             📋 Board: <code style={styles.boardId}>{boardId}</code>
// // //           </div>
// // //           {user && (
// // //             <div style={styles.userChip}>
// // //               <div style={styles.userAvatar}>
// // //                 {(user.name || 'U')[0].toUpperCase()}
// // //               </div>
// // //               <span>{user.name}</span>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {notification && (
// // //           <div style={styles.notification}>{notification}</div>
// // //         )}

// // //         {/* ✅ Fixed: uses dimensions state not raw window values */}
// // //         <Stage
// // //           ref={stageRef}
// // //           width={dimensions.width}
// // //           height={dimensions.height}
// // //           style={{ cursor: cursorStyle, background: '#fff' }}
// // //           onMouseDown={handleMouseDown}
// // //           onMouseMove={handleMouseMove}
// // //           onMouseUp={handleMouseUp}
// // //           onTouchStart={handleMouseDown}
// // //           onTouchMove={handleMouseMove}
// // //           onTouchEnd={handleMouseUp}
// // //         >
// // //           <Layer ref={layerRef}>
// // //             {lines.map((line) => (
// // //               <Line
// // //                 key={line.id}
// // //                 points={line.points}
// // //                 stroke={line.color}
// // //                 strokeWidth={line.brushSize}
// // //                 tension={0.4}
// // //                 lineCap="round"
// // //                 lineJoin="round"
// // //                 globalCompositeOperation={
// // //                   line.tool === 'eraser' ? 'destination-out' : 'source-over'
// // //                 }
// // //               />
// // //             ))}
// // //             {rects.map((rect) => (
// // //               <Rect
// // //                 key={rect.id}
// // //                 x={rect.x}
// // //                 y={rect.y}
// // //                 width={rect.width}
// // //                 height={rect.height}
// // //                 fill={rect.fill}
// // //                 stroke={rect.stroke}
// // //                 strokeWidth={rect.strokeWidth}
// // //                 draggable={activeTool === 'select'}
// // //                 onClick={() => activeTool === 'select' && setSelectedId(rect.id)}
// // //                 onDragEnd={(e) => {
// // //                   const updated = { ...rect, x: e.target.x(), y: e.target.y() };
// // //                   setRects(prev => prev.map(r => r.id === rect.id ? updated : r));
// // //                   getSocket()?.emit('objectMoved', updated);
// // //                 }}
// // //               />
// // //             ))}
// // //           </Layer>
// // //         </Stage>
// // //       </div>

// // //       <UserList />
// // //       <RemoteCursors stageRef={stageRef} />
// // //     </div>
// // //   );
// // // }

// // // const styles = {
// // //   root: {
// // //     display: 'flex',
// // //     height: '100vh',
// // //     overflow: 'hidden',
// // //     background: '#f0f0f0',
// // //   },
// // //   canvasWrapper: {
// // //     flex: 1,
// // //     display: 'flex',
// // //     flexDirection: 'column',
// // //     overflow: 'hidden',
// // //     position: 'relative',
// // //   },
// // //   topBar: {
// // //     height: 56,
// // //     background: '#1e1b4b',
// // //     display: 'flex',
// // //     alignItems: 'center',
// // //     padding: '0 20px',
// // //     justifyContent: 'space-between',
// // //     boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
// // //     flexShrink: 0,
// // //   },
// // //   boardTitle: {
// // //     color: '#a5b4fc',
// // //     fontSize: 14,
// // //     fontWeight: 600,
// // //   },
// // //   boardId: {
// // //     background: 'rgba(255,255,255,0.1)',
// // //     padding: '2px 8px',
// // //     borderRadius: 6,
// // //     fontSize: 12,
// // //     color: '#c7d2fe',
// // //   },
// // //   userChip: {
// // //     display: 'flex',
// // //     alignItems: 'center',
// // //     gap: 8,
// // //     color: '#fff',
// // //     fontSize: 14,
// // //     fontWeight: 600,
// // //     background: 'rgba(255,255,255,0.1)',
// // //     padding: '4px 12px',
// // //     borderRadius: 20,
// // //   },
// // //   userAvatar: {
// // //     width: 28,
// // //     height: 28,
// // //     borderRadius: '50%',
// // //     background: '#4f46e5',
// // //     color: '#fff',
// // //     display: 'flex',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     fontSize: 13,
// // //     fontWeight: 700,
// // //   },
// // //   notification: {
// // //     position: 'absolute',
// // //     top: 66,
// // //     left: '50%',
// // //     transform: 'translateX(-50%)',
// // //     background: '#1e1b4b',
// // //     color: '#fff',
// // //     padding: '8px 20px',
// // //     borderRadius: 20,
// // //     fontSize: 13,
// // //     fontWeight: 600,
// // //     zIndex: 1000,
// // //     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
// // //     animation: 'fadeIn 0.2s ease',
// // //   },
// // // };

// // import React, { useRef, useState, useEffect, useCallback } from 'react';
// // import { Stage, Layer, Line, Rect } from 'react-konva';
// // import { io } from 'socket.io-client';
// // import useCanvasStore from '../store/canvasStore';
// // import { saveBoard, loadBoard } from '../services/api';
// // import Toolbar from './Toolbar';
// // import UserList from './UserList';
// // import RemoteCursors from './Cursor';

// // // ── Socket singleton inlined — no external socket.js import needed ──────────
// // let _socket = null;

// // const connectSocket = () => {
// //   if (!_socket) {
// //     _socket = io('http://localhost:3001', {
// //       withCredentials: true,
// //       autoConnect: true,
// //     });
// //   }
// //   return _socket;
// // };

// // const getSocket = () => _socket;
// // // ───────────────────────────────────────────────────────────────────────────

// // const DEBOUNCE_CURSOR = 30;

// // export default function CanvasBoard({ boardId, user }) {
// //   const stageRef       = useRef(null);
// //   const layerRef       = useRef(null);
// //   const isDrawing      = useRef(false);
// //   const currentLine    = useRef(null);
// //   const rectStart      = useRef(null);
// //   const currentRect    = useRef(null);
// //   const lastCursorEmit = useRef(0);

// //   const [lines,        setLines]        = useState([]);
// //   const [rects,        setRects]        = useState([]);
// //   const [selectedId,   setSelectedId]   = useState(null);
// //   const [saving,       setSaving]       = useState(false);
// //   const [notification, setNotification] = useState('');

// //   // ✅ Fixed: use state for dimensions instead of raw window values
// //   const [dimensions, setDimensions] = useState({
// //     width:  Math.max(window.innerWidth  - 420, 300),
// //     height: Math.max(window.innerHeight -  56, 300),
// //   });

// //   const {
// //     activeTool, brushColor, brushSize,
// //     setUsers, updateRemoteCursor, removeRemoteCursor,
// //     pushUndo, undo, redo, canUndo, canRedo,
// //   } = useCanvasStore();

// //   // ── Window resize handler ──────────────────────────────────────────────────
// //   useEffect(() => {
// //     const onResize = () => {
// //       setDimensions({
// //         width:  Math.max(window.innerWidth  - 420, 300),
// //         height: Math.max(window.innerHeight -  56, 300),
// //       });
// //     };
// //     window.addEventListener('resize', onResize);
// //     return () => window.removeEventListener('resize', onResize);
// //   }, []);

// //   // ── Socket setup ───────────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const socket = connectSocket();

// //     const onConnect       = () => socket.emit('joinRoom', { boardId });
// //     const onRoomUsers     = ({ users }) => setUsers(users);
// //     const onCursorUpdate  = ({ userId, x, y, name }) => {
// //       if (userId !== socket.id) updateRemoteCursor(userId, x, y, name);
// //     };
// //     const onDrawUpdate    = (data) => {
// //       if (data.socketId !== socket.id) setLines(prev => [...prev, data]);
// //     };
// //     const onObjectAdded   = (data) => {
// //       if (data.socketId !== socket.id && data.type === 'rectangle')
// //         setRects(prev => [...prev, data]);
// //     };
// //     const onCanvasCleared = () => { setLines([]); setRects([]); };
// //     const onBoardState    = ({ objects }) => {
// //       if (!objects) return;
// //       setLines(objects.filter(o => o.type === 'line'));
// //       setRects(objects.filter(o => o.type === 'rectangle'));
// //     };
// //     const onUserLeft = ({ userId }) => removeRemoteCursor(userId);

// //     socket.on('connect',       onConnect);
// //     socket.on('roomUsers',     onRoomUsers);
// //     socket.on('cursorUpdate',  onCursorUpdate);
// //     socket.on('drawUpdate',    onDrawUpdate);
// //     socket.on('objectAdded',   onObjectAdded);
// //     socket.on('canvasCleared', onCanvasCleared);
// //     socket.on('boardState',    onBoardState);
// //     socket.on('userLeft',      onUserLeft);

// //     // join immediately if already connected
// //     if (socket.connected) socket.emit('joinRoom', { boardId });

// //     return () => {
// //       socket.off('connect',       onConnect);
// //       socket.off('roomUsers',     onRoomUsers);
// //       socket.off('cursorUpdate',  onCursorUpdate);
// //       socket.off('drawUpdate',    onDrawUpdate);
// //       socket.off('objectAdded',   onObjectAdded);
// //       socket.off('canvasCleared', onCanvasCleared);
// //       socket.off('boardState',    onBoardState);
// //       socket.off('userLeft',      onUserLeft);
// //     };
// //   }, [boardId]);

// //   // ── Load board on mount ────────────────────────────────────────────────────
// //   useEffect(() => {
// //     loadBoard(boardId)
// //       .then(({ objects }) => {
// //         if (!objects) return;
// //         setLines(objects.filter(o => o.type === 'line'));
// //         setRects(objects.filter(o => o.type === 'rectangle'));
// //       })
// //       .catch(() => {});
// //   }, [boardId]);

// //   // ── Expose window.getCanvasAsJSON for automated tests ─────────────────────
// //   useEffect(() => {
// //     window.getCanvasAsJSON = () =>
// //       JSON.parse(JSON.stringify([...lines, ...rects]));
// //     return () => { delete window.getCanvasAsJSON; };
// //   }, [lines, rects]);

// //   // ── Keyboard shortcuts ─────────────────────────────────────────────────────
// //   useEffect(() => {
// //     const onKey = (e) => {
// //       if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
// //         e.preventDefault();
// //         e.shiftKey ? handleRedo() : handleUndo();
// //       }
// //       if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
// //         e.preventDefault();
// //         handleRedo();
// //       }
// //       if (e.key === 'Escape') setSelectedId(null);
// //     };
// //     window.addEventListener('keydown', onKey);
// //     return () => window.removeEventListener('keydown', onKey);
// //   });

// //   // ── Snapshot helper ────────────────────────────────────────────────────────
// //   const takeSnapshot = useCallback(() => {
// //     pushUndo(JSON.parse(JSON.stringify({ lines, rects })));
// //   }, [lines, rects, pushUndo]);

// //   // ── Mouse handlers ─────────────────────────────────────────────────────────
// //   const handleMouseDown = (e) => {
// //     const pos = e.target.getStage().getPointerPosition();
// //     if (!pos || activeTool === 'select') return;

// //     isDrawing.current = true;
// //     takeSnapshot();

// //     if (activeTool === 'pen' || activeTool === 'eraser') {
// //       const newLine = {
// //         id:        `line-${Date.now()}-${Math.random()}`,
// //         type:      'line',
// //         tool:      activeTool,
// //         points:    [pos.x, pos.y],
// //         color:     activeTool === 'eraser' ? '#ffffff' : brushColor,
// //         brushSize: activeTool === 'eraser' ? 20 : brushSize,
// //         socketId:  getSocket()?.id,
// //       };
// //       currentLine.current = newLine;
// //       setLines(prev => [...prev, newLine]);
// //     }

// //     if (activeTool === 'rectangle') {
// //       rectStart.current = pos;
// //       const newRect = {
// //         id:          `rect-${Date.now()}-${Math.random()}`,
// //         type:        'rectangle',
// //         x:           pos.x,
// //         y:           pos.y,
// //         width:       0,
// //         height:      0,
// //         fill:        brushColor + '44',
// //         stroke:      brushColor,
// //         strokeWidth: brushSize,
// //         socketId:    getSocket()?.id,
// //       };
// //       currentRect.current = newRect;
// //       setRects(prev => [...prev, newRect]);
// //     }
// //   };

// //   const handleMouseMove = (e) => {
// //     const pos = e.target.getStage().getPointerPosition();
// //     if (!pos) return;

// //     const now = Date.now();
// //     if (now - lastCursorEmit.current > DEBOUNCE_CURSOR) {
// //       lastCursorEmit.current = now;
// //       getSocket()?.emit('cursorMove', { x: pos.x, y: pos.y });
// //     }

// //     if (!isDrawing.current) return;

// //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// //       const updated = {
// //         ...currentLine.current,
// //         points: [...currentLine.current.points, pos.x, pos.y],
// //       };
// //       currentLine.current = updated;
// //       setLines(prev => prev.map(l => l.id === updated.id ? updated : l));
// //     }

// //     if (activeTool === 'rectangle' && rectStart.current && currentRect.current) {
// //       const updated = {
// //         ...currentRect.current,
// //         x:      Math.min(pos.x, rectStart.current.x),
// //         y:      Math.min(pos.y, rectStart.current.y),
// //         width:  Math.abs(pos.x - rectStart.current.x),
// //         height: Math.abs(pos.y - rectStart.current.y),
// //       };
// //       currentRect.current = updated;
// //       setRects(prev => prev.map(r => r.id === updated.id ? updated : r));
// //     }
// //   };

// //   const handleMouseUp = () => {
// //     if (!isDrawing.current) return;
// //     isDrawing.current = false;
// //     const socket = getSocket();

// //     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
// //       socket?.emit('draw', currentLine.current);
// //       currentLine.current = null;
// //     }
// //     if (activeTool === 'rectangle' && currentRect.current) {
// //       socket?.emit('addObject', currentRect.current);
// //       currentRect.current = null;
// //       rectStart.current   = null;
// //     }
// //   };

// //   // ── Undo / Redo ────────────────────────────────────────────────────────────
// //   const handleUndo = () => {
// //     // pass current state so it can be pushed onto redo stack
// //     const current  = { lines, rects };
// //     const snapshot = undo(current);
// //     if (snapshot) {
// //       setLines(snapshot.lines || []);
// //       setRects(snapshot.rects || []);
// //       getSocket()?.emit('canvasUpdate', snapshot);
// //     }
// //   };

// //   const handleRedo = () => {
// //     // pass current state so it can be pushed onto undo stack
// //     const current  = { lines, rects };
// //     const snapshot = redo(current);
// //     if (snapshot) {
// //       setLines(snapshot.lines || []);
// //       setRects(snapshot.rects || []);
// //       getSocket()?.emit('canvasUpdate', snapshot);
// //     }
// //   };

// //   // ── Save ───────────────────────────────────────────────────────────────────
// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       await saveBoard(boardId, [...lines, ...rects]);
// //       showNotification('Board saved! ✅');
// //     } catch {
// //       showNotification('Save failed ❌');
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   // ── Clear ──────────────────────────────────────────────────────────────────
// //   const handleClear = () => {
// //     takeSnapshot();
// //     setLines([]);
// //     setRects([]);
// //     setSelectedId(null);
// //     getSocket()?.emit('clearCanvas', { boardId });
// //     showNotification('Canvas cleared');
// //   };

// //   const showNotification = (msg) => {
// //     setNotification(msg);
// //     setTimeout(() => setNotification(''), 2500);
// //   };

// //   const cursorStyle =
// //     activeTool === 'pen'       ? 'crosshair' :
// //     activeTool === 'eraser'    ? 'cell'      :
// //     activeTool === 'rectangle' ? 'crosshair' : 'default';

// //   // ── Render ─────────────────────────────────────────────────────────────────
// //   return (
// //     <div style={styles.root}>
// //       <Toolbar
// //         onUndo={handleUndo}
// //         onRedo={handleRedo}
// //         onSave={handleSave}
// //         onClear={handleClear}
// //         canUndo={canUndo()}
// //         canRedo={canRedo()}
// //         saving={saving}
// //       />

// //       <div style={styles.canvasWrapper}>
// //         <div style={styles.topBar}>
// //           <div style={styles.boardTitle}>
// //             📋 Board: <code style={styles.boardId}>{boardId}</code>
// //           </div>
// //           {user && (
// //             <div style={styles.userChip}>
// //               <div style={styles.userAvatar}>
// //                 {(user.name || 'U')[0].toUpperCase()}
// //               </div>
// //               <span>{user.name}</span>
// //             </div>
// //           )}
// //         </div>

// //         {notification && (
// //           <div style={styles.notification}>{notification}</div>
// //         )}

// //         {/* ✅ Fixed: uses dimensions state not raw window values */}
// //         <Stage
// //           ref={stageRef}
// //           width={dimensions.width}
// //           height={dimensions.height}
// //           style={{ cursor: cursorStyle, background: '#fff' }}
// //           onMouseDown={handleMouseDown}
// //           onMouseMove={handleMouseMove}
// //           onMouseUp={handleMouseUp}
// //           onTouchStart={handleMouseDown}
// //           onTouchMove={handleMouseMove}
// //           onTouchEnd={handleMouseUp}
// //         >
// //           <Layer ref={layerRef}>
// //             {lines.map((line) => (
// //               <Line
// //                 key={line.id}
// //                 points={line.points}
// //                 stroke={line.color}
// //                 strokeWidth={line.brushSize}
// //                 tension={0.4}
// //                 lineCap="round"
// //                 lineJoin="round"
// //                 globalCompositeOperation={
// //                   line.tool === 'eraser' ? 'destination-out' : 'source-over'
// //                 }
// //               />
// //             ))}
// //             {rects.map((rect) => (
// //               <Rect
// //                 key={rect.id}
// //                 x={rect.x}
// //                 y={rect.y}
// //                 width={rect.width}
// //                 height={rect.height}
// //                 fill={rect.fill}
// //                 stroke={rect.stroke}
// //                 strokeWidth={rect.strokeWidth}
// //                 draggable={activeTool === 'select'}
// //                 onClick={() => activeTool === 'select' && setSelectedId(rect.id)}
// //                 onDragEnd={(e) => {
// //                   const updated = { ...rect, x: e.target.x(), y: e.target.y() };
// //                   setRects(prev => prev.map(r => r.id === rect.id ? updated : r));
// //                   getSocket()?.emit('objectMoved', updated);
// //                 }}
// //               />
// //             ))}
// //           </Layer>
// //         </Stage>
// //       </div>

// //       <UserList />
// //       <RemoteCursors stageRef={stageRef} />
// //     </div>
// //   );
// // }

// // const styles = {
// //   root: {
// //     display: 'flex',
// //     height: '100vh',
// //     overflow: 'hidden',
// //     background: '#f0f0f0',
// //   },
// //   canvasWrapper: {
// //     flex: 1,
// //     display: 'flex',
// //     flexDirection: 'column',
// //     overflow: 'hidden',
// //     position: 'relative',
// //   },
// //   topBar: {
// //     height: 56,
// //     background: '#1e1b4b',
// //     display: 'flex',
// //     alignItems: 'center',
// //     padding: '0 20px',
// //     justifyContent: 'space-between',
// //     boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
// //     flexShrink: 0,
// //   },
// //   boardTitle: {
// //     color: '#a5b4fc',
// //     fontSize: 14,
// //     fontWeight: 600,
// //   },
// //   boardId: {
// //     background: 'rgba(255,255,255,0.1)',
// //     padding: '2px 8px',
// //     borderRadius: 6,
// //     fontSize: 12,
// //     color: '#c7d2fe',
// //   },
// //   userChip: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: 8,
// //     color: '#fff',
// //     fontSize: 14,
// //     fontWeight: 600,
// //     background: 'rgba(255,255,255,0.1)',
// //     padding: '4px 12px',
// //     borderRadius: 20,
// //   },
// //   userAvatar: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: '50%',
// //     background: '#4f46e5',
// //     color: '#fff',
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     fontSize: 13,
// //     fontWeight: 700,
// //   },
// //   notification: {
// //     position: 'absolute',
// //     top: 66,
// //     left: '50%',
// //     transform: 'translateX(-50%)',
// //     background: '#1e1b4b',
// //     color: '#fff',
// //     padding: '8px 20px',
// //     borderRadius: 20,
// //     fontSize: 13,
// //     fontWeight: 600,
// //     zIndex: 1000,
// //     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
// //     animation: 'fadeIn 0.2s ease',
// //   },
// // };

// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import { Stage, Layer, Line, Rect } from 'react-konva';
// import { io } from 'socket.io-client';
// import useCanvasStore from '../store/canvasStore';
// import { saveBoard, loadBoard } from '../services/api';
// import Toolbar from './Toolbar';
// import UserList from './UserList';
// import RemoteCursors from './Cursor';

// // ── Socket singleton inlined — no external socket.js import needed ──────────
// let _socket = null;

// const connectSocket = () => {
//   if (!_socket) {
//     _socket = io('http://localhost:3001', {
//       withCredentials: true,
//       autoConnect: true,
//     });
//   }
//   return _socket;
// };

// const getSocket = () => _socket;
// // ───────────────────────────────────────────────────────────────────────────

// const DEBOUNCE_CURSOR = 30;

// export default function CanvasBoard({ boardId, user }) {
//   const stageRef       = useRef(null);
//   const layerRef       = useRef(null);
//   const isDrawing      = useRef(false);
//   const currentLine    = useRef(null);
//   const rectStart      = useRef(null);
//   const currentRect    = useRef(null);
//   const lastCursorEmit = useRef(0);

//   const [lines,        setLines]        = useState([]);
//   const [rects,        setRects]        = useState([]);
//   const [selectedId,   setSelectedId]   = useState(null);
//   const [saving,       setSaving]       = useState(false);
//   const [notification, setNotification] = useState('');

//   // ✅ Fixed: use state for dimensions instead of raw window values
//   const [dimensions, setDimensions] = useState({
//     width:  Math.max(window.innerWidth  - 420, 300),
//     height: Math.max(window.innerHeight -  56, 300),
//   });

//   const {
//     activeTool, brushColor, brushSize,
//     setUsers, updateRemoteCursor, removeRemoteCursor,
//     pushUndo, undo, redo, canUndo, canRedo,
//   } = useCanvasStore();

//   // ── Window resize handler ──────────────────────────────────────────────────
//   useEffect(() => {
//     const onResize = () => {
//       setDimensions({
//         width:  Math.max(window.innerWidth  - 420, 300),
//         height: Math.max(window.innerHeight -  56, 300),
//       });
//     };
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);

//   // ── Socket setup ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const socket = connectSocket();

//     const onConnect       = () => socket.emit('joinRoom', { boardId });
//     const onRoomUsers     = ({ users }) => setUsers(users);
//     const onCursorUpdate  = ({ userId, x, y, name }) => {
//       if (userId !== socket.id) updateRemoteCursor(userId, x, y, name);
//     };
//     const onDrawUpdate    = (data) => {
//       if (data.socketId !== socket.id) setLines(prev => [...prev, data]);
//     };
//     const onObjectAdded   = (data) => {
//       if (data.socketId !== socket.id && data.type === 'rectangle')
//         setRects(prev => [...prev, data]);
//     };
//     const onCanvasCleared = () => { setLines([]); setRects([]); };
//     const onBoardState    = ({ objects }) => {
//       if (!objects) return;
//       setLines(objects.filter(o => o.type === 'line'));
//       setRects(objects.filter(o => o.type === 'rectangle'));
//     };
//     const onUserLeft = ({ userId }) => removeRemoteCursor(userId);

//     socket.on('connect',       onConnect);
//     socket.on('roomUsers',     onRoomUsers);
//     socket.on('cursorUpdate',  onCursorUpdate);
//     socket.on('drawUpdate',    onDrawUpdate);
//     socket.on('objectAdded',   onObjectAdded);
//     socket.on('canvasCleared', onCanvasCleared);
//     socket.on('boardState',    onBoardState);
//     socket.on('userLeft',      onUserLeft);

//     // join immediately if already connected
//     if (socket.connected) socket.emit('joinRoom', { boardId });

//     return () => {
//       socket.off('connect',       onConnect);
//       socket.off('roomUsers',     onRoomUsers);
//       socket.off('cursorUpdate',  onCursorUpdate);
//       socket.off('drawUpdate',    onDrawUpdate);
//       socket.off('objectAdded',   onObjectAdded);
//       socket.off('canvasCleared', onCanvasCleared);
//       socket.off('boardState',    onBoardState);
//       socket.off('userLeft',      onUserLeft);
//     };
//   }, [boardId]);

//   // ── Load board on mount ────────────────────────────────────────────────────
//   useEffect(() => {
//     loadBoard(boardId)
//       .then(({ objects }) => {
//         if (!objects) return;
//         setLines(objects.filter(o => o.type === 'line'));
//         setRects(objects.filter(o => o.type === 'rectangle'));
//       })
//       .catch(() => {});
//   }, [boardId]);

//   // ── Expose window.getCanvasAsJSON for automated tests ─────────────────────
//   useEffect(() => {
//     window.getCanvasAsJSON = () =>
//       JSON.parse(JSON.stringify([...lines, ...rects]));
//     return () => { delete window.getCanvasAsJSON; };
//   }, [lines, rects]);

//   // ── Keyboard shortcuts ─────────────────────────────────────────────────────
//   useEffect(() => {
//     const onKey = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
//         e.preventDefault();
//         e.shiftKey ? handleRedo() : handleUndo();
//       }
//       if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
//         e.preventDefault();
//         handleRedo();
//       }
//       if (e.key === 'Escape') setSelectedId(null);
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//   });

//   // ── Snapshot helper ────────────────────────────────────────────────────────
//   const takeSnapshot = useCallback(() => {
//     pushUndo(JSON.parse(JSON.stringify({ lines, rects })));
//   }, [lines, rects, pushUndo]);

//   // ── Mouse handlers ─────────────────────────────────────────────────────────
//   const handleMouseDown = (e) => {
//     const pos = e.target.getStage().getPointerPosition();
//     if (!pos || activeTool === 'select') return;

//     isDrawing.current = true;
//     takeSnapshot();

//     if (activeTool === 'pen' || activeTool === 'eraser') {
//       const newLine = {
//         id:        `line-${Date.now()}-${Math.random()}`,
//         type:      'line',
//         tool:      activeTool,
//         points:    [pos.x, pos.y],
//         color:     activeTool === 'eraser' ? '#ffffff' : brushColor,
//         brushSize: activeTool === 'eraser' ? 20 : brushSize,
//         socketId:  getSocket()?.id,
//       };
//       currentLine.current = newLine;
//       setLines(prev => [...prev, newLine]);
//     }

//     if (activeTool === 'rectangle') {
//       rectStart.current = pos;
//       const newRect = {
//         id:          `rect-${Date.now()}-${Math.random()}`,
//         type:        'rectangle',
//         x:           pos.x,
//         y:           pos.y,
//         width:       0,
//         height:      0,
//         fill:        brushColor + '44',
//         stroke:      brushColor,
//         strokeWidth: brushSize,
//         socketId:    getSocket()?.id,
//       };
//       currentRect.current = newRect;
//       setRects(prev => [...prev, newRect]);
//     }
//   };

//   const handleMouseMove = (e) => {
//     const pos = e.target.getStage().getPointerPosition();
//     if (!pos) return;

//     const now = Date.now();
//     if (now - lastCursorEmit.current > DEBOUNCE_CURSOR) {
//       lastCursorEmit.current = now;
//       getSocket()?.emit('cursorMove', { x: pos.x, y: pos.y });
//     }

//     if (!isDrawing.current) return;

//     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
//       const updated = {
//         ...currentLine.current,
//         points: [...currentLine.current.points, pos.x, pos.y],
//       };
//       currentLine.current = updated;
//       setLines(prev => prev.map(l => l.id === updated.id ? updated : l));
//     }

//     if (activeTool === 'rectangle' && rectStart.current && currentRect.current) {
//       const updated = {
//         ...currentRect.current,
//         x:      Math.min(pos.x, rectStart.current.x),
//         y:      Math.min(pos.y, rectStart.current.y),
//         width:  Math.abs(pos.x - rectStart.current.x),
//         height: Math.abs(pos.y - rectStart.current.y),
//       };
//       currentRect.current = updated;
//       setRects(prev => prev.map(r => r.id === updated.id ? updated : r));
//     }
//   };

//   const handleMouseUp = () => {
//     if (!isDrawing.current) return;
//     isDrawing.current = false;
//     const socket = getSocket();

//     if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
//       socket?.emit('draw', currentLine.current);
//       currentLine.current = null;
//     }
//     if (activeTool === 'rectangle' && currentRect.current) {
//       socket?.emit('addObject', currentRect.current);
//       currentRect.current = null;
//       rectStart.current   = null;
//     }
//   };

//   // ── Undo / Redo ────────────────────────────────────────────────────────────
//   const handleUndo = () => {
//     // pass current state so it can be pushed onto redo stack
//     const current  = { lines, rects };
//     const snapshot = undo(current);
//     if (snapshot) {
//       setLines(snapshot.lines || []);
//       setRects(snapshot.rects || []);
//       getSocket()?.emit('canvasUpdate', snapshot);
//     }
//   };

//   const handleRedo = () => {
//     // pass current state so it can be pushed onto undo stack
//     const current  = { lines, rects };
//     const snapshot = redo(current);
//     if (snapshot) {
//       setLines(snapshot.lines || []);
//       setRects(snapshot.rects || []);
//       getSocket()?.emit('canvasUpdate', snapshot);
//     }
//   };

//   // ── Save ───────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await saveBoard(boardId, [...lines, ...rects]);
//       showNotification('Board saved! ✅');
//     } catch {
//       showNotification('Save failed ❌');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Clear ──────────────────────────────────────────────────────────────────
//   const handleClear = () => {
//     takeSnapshot();
//     setLines([]);
//     setRects([]);
//     setSelectedId(null);
//     getSocket()?.emit('clearCanvas', { boardId });
//     showNotification('Canvas cleared');
//   };

//   const showNotification = (msg) => {
//     setNotification(msg);
//     setTimeout(() => setNotification(''), 2500);
//   };

//   const cursorStyle =
//     activeTool === 'pen'       ? 'crosshair' :
//     activeTool === 'eraser'    ? 'cell'      :
//     activeTool === 'rectangle' ? 'crosshair' : 'default';

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div style={styles.root}>
//       <Toolbar
//         onUndo={handleUndo}
//         onRedo={handleRedo}
//         onSave={handleSave}
//         onClear={handleClear}
//         canUndo={canUndo()}
//         canRedo={canRedo()}
//         saving={saving}
//       />

//       <div style={styles.canvasWrapper}>
//         <div style={styles.topBar}>
//           <div style={styles.boardTitle}>
//             📋 Board: <code style={styles.boardId}>{boardId}</code>
//           </div>
//           {user && (
//             <div style={styles.userChip}>
//               <div style={styles.userAvatar}>
//                 {(user.name || 'U')[0].toUpperCase()}
//               </div>
//               <span>{user.name}</span>
//             </div>
//           )}
//         </div>

//         {notification && (
//           <div style={styles.notification}>{notification}</div>
//         )}

//         {/* ✅ Fixed: uses dimensions state not raw window values */}
//         <Stage
//           ref={stageRef}
//           width={dimensions.width}
//           height={dimensions.height}
//           style={{ cursor: cursorStyle, background: '#fff' }}
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onTouchStart={handleMouseDown}
//           onTouchMove={handleMouseMove}
//           onTouchEnd={handleMouseUp}
//         >
//           <Layer ref={layerRef}>
//             {lines.map((line) => (
//               <Line
//                 key={line.id}
//                 points={line.points}
//                 stroke={line.color}
//                 strokeWidth={line.brushSize}
//                 tension={0.4}
//                 lineCap="round"
//                 lineJoin="round"
//                 globalCompositeOperation={
//                   line.tool === 'eraser' ? 'destination-out' : 'source-over'
//                 }
//               />
//             ))}
//             {rects.map((rect) => (
//               <Rect
//                 key={rect.id}
//                 x={rect.x}
//                 y={rect.y}
//                 width={rect.width}
//                 height={rect.height}
//                 fill={rect.fill}
//                 stroke={rect.stroke}
//                 strokeWidth={rect.strokeWidth}
//                 draggable={activeTool === 'select'}
//                 onClick={() => activeTool === 'select' && setSelectedId(rect.id)}
//                 onDragEnd={(e) => {
//                   const updated = { ...rect, x: e.target.x(), y: e.target.y() };
//                   setRects(prev => prev.map(r => r.id === rect.id ? updated : r));
//                   getSocket()?.emit('objectMoved', updated);
//                 }}
//               />
//             ))}
//           </Layer>
//         </Stage>
//       </div>

//       <UserList />
//       <RemoteCursors stageRef={stageRef} />
//     </div>
//   );
// }

// const styles = {
//   root: {
//     display: 'flex',
//     height: '100vh',
//     overflow: 'hidden',
//     background: '#f0f0f0',
//   },
//   canvasWrapper: {
//     flex: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   topBar: {
//     height: 56,
//     background: '#1e1b4b',
//     display: 'flex',
//     alignItems: 'center',
//     padding: '0 20px',
//     justifyContent: 'space-between',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
//     flexShrink: 0,
//   },
//   boardTitle: {
//     color: '#a5b4fc',
//     fontSize: 14,
//     fontWeight: 600,
//   },
//   boardId: {
//     background: 'rgba(255,255,255,0.1)',
//     padding: '2px 8px',
//     borderRadius: 6,
//     fontSize: 12,
//     color: '#c7d2fe',
//   },
//   userChip: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 8,
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 600,
//     background: 'rgba(255,255,255,0.1)',
//     padding: '4px 12px',
//     borderRadius: 20,
//   },
//   userAvatar: {
//     width: 28,
//     height: 28,
//     borderRadius: '50%',
//     background: '#4f46e5',
//     color: '#fff',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: 13,
//     fontWeight: 700,
//   },
//   notification: {
//     position: 'absolute',
//     top: 66,
//     left: '50%',
//     transform: 'translateX(-50%)',
//     background: '#1e1b4b',
//     color: '#fff',
//     padding: '8px 20px',
//     borderRadius: 20,
//     fontSize: 13,
//     fontWeight: 600,
//     zIndex: 1000,
//     boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//     animation: 'fadeIn 0.2s ease',
//   },
// }; 

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { io } from 'socket.io-client';
import useCanvasStore from '../store/canvasStore';
import { saveBoard, loadBoard } from '../services/api';
import Toolbar from './Toolbar';
import UserList from './UserList';
import RemoteCursors from './Cursor';

// ── Socket singleton inlined — no external socket.js import needed ──────────
let _socket = null;

const connectSocket = () => {
  if (!_socket) {
    _socket = io('http://localhost:3001', {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return _socket;
};

const getSocket = () => _socket;
// ───────────────────────────────────────────────────────────────────────────

const DEBOUNCE_CURSOR = 30;

export default function CanvasBoard({ boardId, user }) {
  const stageRef       = useRef(null);
  const layerRef       = useRef(null);
  const isDrawing      = useRef(false);
  const currentLine    = useRef(null);
  const rectStart      = useRef(null);
  const currentRect    = useRef(null);
  const lastCursorEmit = useRef(0);

  const [lines,        setLines]        = useState([]);
  const [rects,        setRects]        = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [notification, setNotification] = useState('');

  // ✅ Fixed: use state for dimensions instead of raw window values
  const [dimensions, setDimensions] = useState({
    width:  Math.max(window.innerWidth  - 420, 300),
    height: Math.max(window.innerHeight -  56, 300),
  });

  const {
    activeTool, brushColor, brushSize,
    setUsers, updateRemoteCursor, removeRemoteCursor,
    pushUndo, undo, redo, canUndo, canRedo,
  } = useCanvasStore();

  // ── Window resize handler ──────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setDimensions({
        width:  Math.max(window.innerWidth  - 420, 300),
        height: Math.max(window.innerHeight -  56, 300),
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket();

    const onConnect       = () => socket.emit('joinRoom', { boardId });
    const onRoomUsers     = ({ users }) => setUsers(users);
    const onCursorUpdate  = ({ userId, x, y, name }) => {
      if (userId !== socket.id) updateRemoteCursor(userId, x, y, name);
    };
    const onDrawUpdate    = (data) => {
      if (data.socketId !== socket.id) setLines(prev => [...prev, data]);
    };
    const onObjectAdded   = (data) => {
      if (data.socketId !== socket.id && data.type === 'rectangle')
        setRects(prev => [...prev, data]);
    };
    const onCanvasCleared = () => { setLines([]); setRects([]); };
    const onBoardState    = ({ objects }) => {
      if (!objects) return;
      setLines(objects.filter(o => o.type === 'line'));
      setRects(objects.filter(o => o.type === 'rectangle'));
    };
    const onUserLeft = ({ userId }) => removeRemoteCursor(userId);

    socket.on('connect',       onConnect);
    socket.on('roomUsers',     onRoomUsers);
    socket.on('cursorUpdate',  onCursorUpdate);
    socket.on('drawUpdate',    onDrawUpdate);
    socket.on('objectAdded',   onObjectAdded);
    socket.on('canvasCleared', onCanvasCleared);
    socket.on('boardState',    onBoardState);
    socket.on('userLeft',      onUserLeft);

    // join immediately if already connected
    if (socket.connected) socket.emit('joinRoom', { boardId });

    return () => {
      socket.off('connect',       onConnect);
      socket.off('roomUsers',     onRoomUsers);
      socket.off('cursorUpdate',  onCursorUpdate);
      socket.off('drawUpdate',    onDrawUpdate);
      socket.off('objectAdded',   onObjectAdded);
      socket.off('canvasCleared', onCanvasCleared);
      socket.off('boardState',    onBoardState);
      socket.off('userLeft',      onUserLeft);
    };
  }, [boardId]);

  // ── Load board on mount ────────────────────────────────────────────────────
  useEffect(() => {
    loadBoard(boardId)
      .then(({ objects }) => {
        if (!objects) return;
        setLines(objects.filter(o => o.type === 'line'));
        setRects(objects.filter(o => o.type === 'rectangle'));
      })
      .catch(() => {});
  }, [boardId]);

  // ── Expose window.getCanvasAsJSON for automated tests ─────────────────────
  useEffect(() => {
    window.getCanvasAsJSON = () =>
      JSON.parse(JSON.stringify([...lines, ...rects]));
    return () => { delete window.getCanvasAsJSON; };
  }, [lines, rects]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? handleRedo() : handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Snapshot helper ────────────────────────────────────────────────────────
  const takeSnapshot = useCallback(() => {
    pushUndo(JSON.parse(JSON.stringify({ lines, rects })));
  }, [lines, rects, pushUndo]);

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos || activeTool === 'select') return;

    isDrawing.current = true;
    takeSnapshot();

    if (activeTool === 'pen' || activeTool === 'eraser') {
      const newLine = {
        id:        `line-${Date.now()}-${Math.random()}`,
        type:      'line',
        tool:      activeTool,
        points:    [pos.x, pos.y],
        color:     activeTool === 'eraser' ? '#ffffff' : brushColor,
        brushSize: activeTool === 'eraser' ? 20 : brushSize,
        socketId:  getSocket()?.id,
      };
      currentLine.current = newLine;
      setLines(prev => [...prev, newLine]);
    }

    if (activeTool === 'rectangle') {
      rectStart.current = pos;
      const newRect = {
        id:          `rect-${Date.now()}-${Math.random()}`,
        type:        'rectangle',
        x:           pos.x,
        y:           pos.y,
        width:       0,
        height:      0,
        fill:        brushColor + '44',
        stroke:      brushColor,
        strokeWidth: brushSize,
        socketId:    getSocket()?.id,
      };
      currentRect.current = newRect;
      setRects(prev => [...prev, newRect]);
    }
  };

  const handleMouseMove = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    const now = Date.now();
    if (now - lastCursorEmit.current > DEBOUNCE_CURSOR) {
      lastCursorEmit.current = now;
      getSocket()?.emit('cursorMove', { x: pos.x, y: pos.y });
    }

    if (!isDrawing.current) return;

    if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
      const updated = {
        ...currentLine.current,
        points: [...currentLine.current.points, pos.x, pos.y],
      };
      currentLine.current = updated;
      setLines(prev => prev.map(l => l.id === updated.id ? updated : l));
    }

    if (activeTool === 'rectangle' && rectStart.current && currentRect.current) {
      const updated = {
        ...currentRect.current,
        x:      Math.min(pos.x, rectStart.current.x),
        y:      Math.min(pos.y, rectStart.current.y),
        width:  Math.abs(pos.x - rectStart.current.x),
        height: Math.abs(pos.y - rectStart.current.y),
      };
      currentRect.current = updated;
      setRects(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const socket = getSocket();

    if ((activeTool === 'pen' || activeTool === 'eraser') && currentLine.current) {
      socket?.emit('draw', currentLine.current);
      currentLine.current = null;
    }
    if (activeTool === 'rectangle' && currentRect.current) {
      socket?.emit('addObject', currentRect.current);
      currentRect.current = null;
      rectStart.current   = null;
    }
  };

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (!canUndo()) return;
    // capture current state FIRST so it goes onto redoStack
    const current  = JSON.parse(JSON.stringify({ lines, rects }));
    const snapshot = undo(current);
    if (snapshot) {
      setLines(snapshot.lines || []);
      setRects(snapshot.rects || []);
      getSocket()?.emit('canvasUpdate', snapshot);
    }
  };

  const handleRedo = () => {
    if (!canRedo()) return;
    // capture current state FIRST so it goes onto undoStack
    const current  = JSON.parse(JSON.stringify({ lines, rects }));
    const snapshot = redo(current);
    if (snapshot) {
      setLines(snapshot.lines || []);
      setRects(snapshot.rects || []);
      getSocket()?.emit('canvasUpdate', snapshot);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBoard(boardId, [...lines, ...rects]);
      showNotification('Board saved! ✅');
    } catch {
      showNotification('Save failed ❌');
    } finally {
      setSaving(false);
    }
  };

  // ── Clear ──────────────────────────────────────────────────────────────────
  const handleClear = () => {
    takeSnapshot();
    setLines([]);
    setRects([]);
    setSelectedId(null);
    getSocket()?.emit('clearCanvas', { boardId });
    showNotification('Canvas cleared');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  const cursorStyle =
    activeTool === 'pen'       ? 'crosshair' :
    activeTool === 'eraser'    ? 'cell'      :
    activeTool === 'rectangle' ? 'crosshair' : 'default';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onClear={handleClear}
        canUndo={canUndo()}
        canRedo={canRedo()}
        saving={saving}
      />

      <div style={styles.canvasWrapper}>
        <div style={styles.topBar}>
          <div style={styles.boardTitle}>
            📋 Board: <code style={styles.boardId}>{boardId}</code>
          </div>
          {user && (
            <div style={styles.userChip}>
              <div style={styles.userAvatar}>
                {(user.name || 'U')[0].toUpperCase()}
              </div>
              <span>{user.name}</span>
            </div>
          )}
        </div>

        {notification && (
          <div style={styles.notification}>{notification}</div>
        )}

        {/* ✅ Fixed: uses dimensions state not raw window values */}
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ cursor: cursorStyle, background: '#fff' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer ref={layerRef}>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.brushSize}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
            {rects.map((rect) => (
              <Rect
                key={rect.id}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={rect.fill}
                stroke={rect.stroke}
                strokeWidth={rect.strokeWidth}
                draggable={activeTool === 'select'}
                onClick={() => activeTool === 'select' && setSelectedId(rect.id)}
                onDragEnd={(e) => {
                  const updated = { ...rect, x: e.target.x(), y: e.target.y() };
                  setRects(prev => prev.map(r => r.id === rect.id ? updated : r));
                  getSocket()?.emit('objectMoved', updated);
                }}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <UserList />
      <RemoteCursors stageRef={stageRef} />
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: '#f0f0f0',
  },
  canvasWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  topBar: {
    height: 56,
    background: '#1e1b4b',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  boardTitle: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: 600,
  },
  boardId: {
    background: 'rgba(255,255,255,0.1)',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 12,
    color: '#c7d2fe',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    background: 'rgba(255,255,255,0.1)',
    padding: '4px 12px',
    borderRadius: 20,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
  },
  notification: {
    position: 'absolute',
    top: 66,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e1b4b',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    animation: 'fadeIn 0.2s ease',
  },
};