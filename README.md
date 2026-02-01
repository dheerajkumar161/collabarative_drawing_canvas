# Collaborative Drawing Canvas

A real-time collaborative drawing application built with Node.js, Express, and Socket.io.

## Features

- 🎨 Real-time synchronized drawing across multiple users
- 🖌️ Adjustable brush colors and stroke widths
- ↩️ Global undo/redo functionality
- 👥 User indicators showing online users
- 📱 Touch and mouse support
- ✏️ Eraser tool

## Quick Start

### Local Development

```bash
npm install
npm start
```

Visit `http://localhost:3000` and open multiple browser windows to test real-time collaboration.

### Deploy to Railway

1. Push code to GitHub
2. Connect your GitHub repo to Railway: https://railway.app
3. Railway will auto-detect and deploy

## Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Communication**: WebSockets (Socket.io)

## Architecture

- Server maintains a global stroke history
- Clients emit drawing segments which are broadcast to all connected users
- Undo/Redo is managed server-side, ensuring consistency
- Each user gets a unique color for identification

## Usage

1. **Draw**: Click and drag on the canvas
2. **Change Color**: Use the color picker
3. **Adjust Size**: Use the size slider
4. **Erase**: Click the Eraser button
5. **Undo/Redo**: Click Undo or Redo buttons
6. **Clear**: Click Clear to start fresh

## Known Limitations

- Undo is global (removes last stroke globally)
- No persistence across server restarts
- Basic cursor tracking
