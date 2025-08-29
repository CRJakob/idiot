// server.js
const express = require('express');
const http = require('http');      // use https if you want TLS
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// --- CONFIG ---
const PORT = process.env.PORT || 8080;

// If you want HTTPS instead, uncomment this:
// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };
// const server = https.createServer(options, app);

const app = express();

// Don’t aggressively cache HTML (dev convenience)
app.use((req, res, next) => {
  if (req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// Serve static files (your client pages/scripts)
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and attach WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- WEBSOCKET HANDLING ---
wss.on('connection', (ws) => {
  console.log('New WS connection');

  ws.on('message', (msg) => {
    console.log('Message:', msg.toString());
    // echo back
    ws.send(`Server received: ${msg}`);
  });

  ws.on('close', () => console.log('WS connection closed'));
});

// --- START SERVER ---
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- GAME ---
let Game = require('./public/game.js');

