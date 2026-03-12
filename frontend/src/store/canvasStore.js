// // import { create } from 'zustand';

// // const useCanvasStore = create((set, get) => ({
// //   // Tool state
// //   activeTool: 'pen',
// //   brushColor: '#000000',
// //   brushSize: 3,
  
// //   // Canvas state
// //   stage: null,
// //   layer: null,
  
// //   // Undo/Redo stacks (per user)
// //   undoStack: [],
// //   redoStack: [],
  
// //   // Users in room
// //   users: [],
  
// //   // Remote cursors
// //   remoteCursors: {},

// //   // Actions
// //   setActiveTool: (tool) => set({ activeTool: tool }),
// //   setBrushColor: (color) => set({ brushColor: color }),
// //   setBrushSize: (size) => set({ brushSize: size }),
// //   setStage: (stage) => set({ stage }),
// //   setLayer: (layer) => set({ layer }),
// //   setUsers: (users) => set({ users }),

// //   updateRemoteCursor: (userId, x, y, name) =>
// //     set((state) => ({
// //       remoteCursors: {
// //         ...state.remoteCursors,
// //         [userId]: { x, y, name },
// //       },
// //     })),

// //   removeRemoteCursor: (userId) =>
// //     set((state) => {
// //       const cursors = { ...state.remoteCursors };
// //       delete cursors[userId];
// //       return { remoteCursors: cursors };
// //     }),

// //   pushUndo: (snapshot) =>
// //     set((state) => ({
// //       undoStack: [...state.undoStack, snapshot],
// //       redoStack: [], // clear redo on new action
// //     })),

// //   undo: () => {
// //     const { undoStack, redoStack, stage } = get();
// //     if (undoStack.length === 0) return null;
// //     const previous = undoStack[undoStack.length - 1];
// //     const current = stage?.toJSON() || null;
// //     set({
// //       undoStack: undoStack.slice(0, -1),
// //       redoStack: current ? [...redoStack, current] : redoStack,
// //     });
// //     return previous;
// //   },

// //   redo: () => {
// //     const { undoStack, redoStack, stage } = get();
// //     if (redoStack.length === 0) return null;
// //     const next = redoStack[redoStack.length - 1];
// //     const current = stage?.toJSON() || null;
// //     set({
// //       redoStack: redoStack.slice(0, -1),
// //       undoStack: current ? [...undoStack, current] : undoStack,
// //     });
// //     return next;
// //   },

// //   canUndo: () => get().undoStack.length > 0,
// //   canRedo: () => get().redoStack.length > 0,
// // }));

// // export default useCanvasStore;

// import { create } from 'zustand';

// const useCanvasStore = create((set, get) => ({
//   // Tool state
//   activeTool: 'pen',
//   brushColor: '#000000',
//   brushSize: 3,

//   // Undo/Redo stacks — each entry is { lines, rects }
//   undoStack: [],
//   redoStack: [],

//   // Users in room
//   users: [],

//   // Remote cursors { [userId]: { x, y, name } }
//   remoteCursors: {},

//   // ── Actions ───────────────────────────────────────────────────────────────
//   setActiveTool: (tool) => set({ activeTool: tool }),
//   setBrushColor: (color) => set({ brushColor: color }),
//   setBrushSize:  (size)  => set({ brushSize: size }),
//   setUsers:      (users) => set({ users }),

//   updateRemoteCursor: (userId, x, y, name) =>
//     set((state) => ({
//       remoteCursors: { ...state.remoteCursors, [userId]: { x, y, name } },
//     })),

//   removeRemoteCursor: (userId) =>
//     set((state) => {
//       const cursors = { ...state.remoteCursors };
//       delete cursors[userId];
//       return { remoteCursors: cursors };
//     }),

//   // ── Undo / Redo ───────────────────────────────────────────────────────────
//   // snapshot = { lines: [...], rects: [...] }
//   pushUndo: (snapshot) =>
//     set((state) => ({
//       undoStack: [...state.undoStack, snapshot],
//       redoStack: [], // any new action clears redo history
//     })),

//   // Returns the snapshot to restore, or null if stack is empty
//   undo: (currentSnapshot) => {
//     const { undoStack, redoStack } = get();
//     if (undoStack.length === 0) return null;

//     const previous = undoStack[undoStack.length - 1];

//     set({
//       undoStack: undoStack.slice(0, -1),
//       // push current state onto redo so we can restore it
//       redoStack: currentSnapshot
//         ? [...redoStack, currentSnapshot]
//         : redoStack,
//     });

//     return previous;
//   },

//   // Returns the snapshot to restore, or null if stack is empty
//   redo: (currentSnapshot) => {
//     const { undoStack, redoStack } = get();
//     if (redoStack.length === 0) return null;

//     const next = redoStack[redoStack.length - 1];

//     set({
//       redoStack: redoStack.slice(0, -1),
//       // push current state onto undo so we can undo the redo
//       undoStack: currentSnapshot
//         ? [...undoStack, currentSnapshot]
//         : undoStack,
//     });

//     return next;
//   },

//   canUndo: () => get().undoStack.length > 0,
//   canRedo: () => get().redoStack.length > 0,
// }));

// export default useCanvasStore;

import { create } from 'zustand';

const useCanvasStore = create((set, get) => ({
  // Tool state
  activeTool: 'pen',
  brushColor: '#000000',
  brushSize:  3,

  // Undo/Redo stacks — each entry is { lines: [], rects: [] }
  undoStack: [],
  redoStack: [],

  // Users in room
  users: [],

  // Remote cursors { [userId]: { x, y, name } }
  remoteCursors: {},

  // ── Tool actions ───────────────────────────────────────────────────────────
  setActiveTool: (tool)  => set({ activeTool: tool }),
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushSize:  (size)  => set({ brushSize: size }),
  setUsers:      (users) => set({ users }),

  updateRemoteCursor: (userId, x, y, name) =>
    set((state) => ({
      remoteCursors: { ...state.remoteCursors, [userId]: { x, y, name } },
    })),

  removeRemoteCursor: (userId) =>
    set((state) => {
      const cursors = { ...state.remoteCursors };
      delete cursors[userId];
      return { remoteCursors: cursors };
    }),

  // ── History ────────────────────────────────────────────────────────────────
  // Call BEFORE making a change — saves current state to undoStack
  // and clears redoStack (new action breaks redo chain)
  pushUndo: (snapshot) =>
    set((state) => ({
      undoStack: [...state.undoStack, snapshot],
      redoStack: [],   // new drawing action always clears redo
    })),

  // ── Undo ───────────────────────────────────────────────────────────────────
  // currentSnapshot = the current canvas state BEFORE reverting
  // Returns the state to restore, or null
  undo: (currentSnapshot) => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return null;

    const previous = undoStack[undoStack.length - 1];

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],  // save current for redo
    });

    return previous;
  },

  // ── Redo ───────────────────────────────────────────────────────────────────
  // currentSnapshot = the current canvas state BEFORE re-applying
  // Returns the state to restore, or null
  redo: (currentSnapshot) => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;

    const next = redoStack[redoStack.length - 1];

    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, currentSnapshot],  // save current for undo
    });

    return next;
  },

  // ── Helpers ────────────────────────────────────────────────────────────────
  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));

export default useCanvasStore;