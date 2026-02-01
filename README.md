# Collaborative Canvas

Run locally:

1. Install dependencies

```bash
npm install
```

2. Start server

```bash
npm start
```

Open `http://localhost:3000` in two browser windows to test real-time drawing.

Features implemented:
- Real-time drawing via Socket.io
- Color, size, eraser
- Global undo (removes last stroke)

Known limitations:
- Undo is implemented as "remove last stroke globally" (not per-user)
- No persistence across server restarts
- Cursor ghosts minimal
