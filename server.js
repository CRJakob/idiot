// server.js
const express = require('express');
const https = require('https');      // use https if you want TLS
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// --- CONFIG ---
const PORT = process.env.PORT || 8090;

const app = express();

const http = require('http');
const server = http.createServer(app);

// Don’t aggressively cache HTML (dev convenience)
app.use((req, res, next) => {
    if (req.url.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store');
    }
    next();
});

// Serve static files (your client pages/scripts)
app.use(express.static(path.join(__dirname, 'public')));


const wss = new WebSocket.Server({ server });

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    });
}

let host;

// --- GAME ---
let Game = require('./public/game.js');
let Player = require('./public/Player.js');
let Card = require('./public/Card.js').default;
let game = new Game();

const bypassTurn = true;

// --- WEBSOCKET HANDLING ---
wss.on('connection', (ws) => {
    console.log('New WS connection');
    game.addPlayer(new Player(ws));
    console.log(wss.clients.size);
    if (wss.clients.size === 1) {
        host = ws;
        ws.send(JSON.stringify({ type: "info", string: "HOST" }));
    }

    ws.on('message', (msg) => {
        let { type, string, data } = JSON.parse(msg);
        console.log(`${type} ${string}${data !== undefined ? ': ' + JSON.stringify(data) : ''}`);
        switch(`${type} ${string}`) {
            case "command drawCard": {
                if ((game && game.players[game.turn] && ws === game.players[game.turn].ws) || bypassTurn) {
                    if (game.stock.length > 0) {
                        const card = game.stock.pop();
                        game.players[game.turn].addCard(card);
                        ws.send(JSON.stringify({ type: "command", string: "addCard hand", data: { card } }));
                    } else {
                        ws.send(JSON.stringify({ type: "error", string: "Stock is empty" }));
                    }
                } else { ws.send(JSON.stringify({ type: "error", string: "Not your turn" })); }
                game.players.forEach((player) => informCounters(player.ws));
                break;
            }

            case "command playCard": {
                if ((game && game.players[game.turn] && ws === game.players[game.turn].ws) || bypassTurn) {
                    if (data && Number.isInteger(data.index)) {
                        const player = game.fromWS(ws);
                        const card = player.hand[data.index];
                        if (game.playCard(player, data.index)) {
                            const index = data.index;
                            broadcast(JSON.stringify({ type: "info", string: "Card played", data: { card, index } }));
                        } else {
                            ws.send(JSON.stringify({ type: "error", string: "Cannot play that card" }));
                        }
                    }
                } else { ws.send(JSON.stringify({ type: "error", string: "Not your turn" })); }
                game.players.forEach((player) => informCounters(player.ws));
                break;
            }

            case "command startGame": {
                if ((ws === host) || bypassTurn) {
                    console.log("Starting game");
                    game.dealCards();
                    console.log(game);
                    game.players.forEach((player, index) => {
                        player.hand.forEach(card => {
                            player.ws.send(JSON.stringify({ type: "command", string: "addCard hand", data: { card: card } }));
                        });
                        player.ws.send(JSON.stringify({ type: "command", string: "setClosed", data: { cards: player.closed } }));
                        player.ws.send(JSON.stringify({ type: "command", string: "setOpen", data: { cards: player.open } }));
                        player.ready = true;
                    });
                    broadcast(JSON.stringify({ type: "info", string: "Game started" }));
                } else {
                    ws.send(JSON.stringify({ type: "error", string: "Only host can start the game" }));
                }
                break;
            }
        }
    });

    ws.on('close', () => { 
        console.log('WS connection closed');
        game.removePlayer(ws);
        if (ws === host && wss.clients.size !== 0) {
            host = wss.clients.values().next().value;
            host.send(JSON.stringify({ type: "info", string: "HOST" }));
        } 
    });
});

// --- START SERVER ---
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function informCounters(ws) {
    ws.send(JSON.stringify({ type: "info", string: "Counters", data: { pile: game.pile.length, stock: game.stock.length } }));
    console.log(`${game.pile.length} cards in stock, ${game.stock.length} cards on pile`)
}

