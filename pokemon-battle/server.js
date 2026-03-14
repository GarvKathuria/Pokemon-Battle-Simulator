/**
 * ============================================================
 *  Pokémon Battle Arena — Real-time WebSocket Server
 *  Node.js + ws
 * ============================================================
 *
 *  SETUP:
 *    npm init -y
 *    npm install ws
 *    node server.js
 *
 *  CLIENTS connect to: ws://localhost:3001
 *
 *  PROTOCOL (JSON messages):
 *
 *  CLIENT → SERVER:
 *    { type: "join_room",  roomId: "abc123",  pokemon: <PokemonObject> }
 *    { type: "use_move",   move: <MoveObject>, damage: <number> }
 *
 *  SERVER → CLIENT:
 *    { type: "room_joined",   roomId }
 *    { type: "battle_start",  opponentPokemon, firstTurn: bool }
 *    { type: "opponent_move", move, damage }
 *    { type: "battle_result", winner: "you" | "opponent" }
 *    { type: "opponent_left" }
 *    { type: "error",         message }
 * ============================================================
 */

const { WebSocketServer, WebSocket } = require("ws");

const PORT = 3001;
const wss  = new WebSocketServer({ port: PORT });

/** Map<roomId, { players: [ws, ws?], pokemon: [pokemon, pokemon?] }> */
const rooms = new Map();

/** Map<ws, { roomId, playerIndex }> */
const clients = new Map();

function send(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function getOpponent(roomId, myWs) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return room.players.find(p => p !== myWs) || null;
}

wss.on("connection", (ws) => {
  console.log(`[+] Client connected. Total: ${wss.clients.size}`);

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); }
    catch { return send(ws, { type: "error", message: "Invalid JSON" }); }

    switch (msg.type) {

      // ── JOIN / CREATE ROOM ──────────────────────────────────────────────
      case "join_room": {
        const { roomId, pokemon } = msg;
        if (!roomId || !pokemon) {
          return send(ws, { type: "error", message: "roomId and pokemon required" });
        }

        // Clean up any previous room membership
        const prev = clients.get(ws);
        if (prev) leaveRoom(ws, prev.roomId);

        if (!rooms.has(roomId)) {
          // Create new room
          rooms.set(roomId, { players: [ws], pokemon: [pokemon] });
          clients.set(ws, { roomId, playerIndex: 0 });
          send(ws, { type: "room_joined", roomId });
          console.log(`[Room] Created: ${roomId}`);
        } else {
          const room = rooms.get(roomId);

          if (room.players.length >= 2) {
            return send(ws, { type: "error", message: "Room is full" });
          }

          // Second player joins → start battle
          room.players.push(ws);
          room.pokemon.push(pokemon);
          clients.set(ws, { roomId, playerIndex: 1 });

          const [p1, p2] = room.players;
          const [pk1, pk2] = room.pokemon;

          // Randomly decide who goes first
          const p1First = Math.random() < 0.5;

          send(p1, { type: "battle_start", opponentPokemon: pk2, firstTurn: p1First });
          send(p2, { type: "battle_start", opponentPokemon: pk1, firstTurn: !p1First });

          console.log(`[Room] Battle started in ${roomId}. ${p1First ? "P1" : "P2"} goes first.`);
        }
        break;
      }

      // ── USE MOVE ────────────────────────────────────────────────────────
      case "use_move": {
        const { move, damage } = msg;
        const meta = clients.get(ws);
        if (!meta) return;

        const opponent = getOpponent(meta.roomId, ws);
        if (!opponent) return;

        // Forward move + damage to opponent
        send(opponent, { type: "opponent_move", move, damage });

        // Check if this move ends the battle (damage server-side tracking)
        const room = rooms.get(meta.roomId);
        if (!room) return;

        // Track HP server-side
        if (!room.hp) room.hp = [null, null];
        const oppIdx = meta.playerIndex === 0 ? 1 : 0;
        if (room.hp[oppIdx] === null) {
          room.hp[oppIdx] = room.pokemon[oppIdx].hp * 2;
        }
        room.hp[oppIdx] = Math.max(0, room.hp[oppIdx] - damage);

        if (room.hp[oppIdx] <= 0) {
          send(ws,       { type: "battle_result", winner: "you" });
          send(opponent, { type: "battle_result", winner: "opponent" });
          console.log(`[Room] Battle over in ${meta.roomId}. Player ${meta.playerIndex} wins.`);
          cleanupRoom(meta.roomId);
        }
        break;
      }

      default:
        send(ws, { type: "error", message: `Unknown message type: ${msg.type}` });
    }
  });

  ws.on("close", () => {
    const meta = clients.get(ws);
    if (meta) {
      const opponent = getOpponent(meta.roomId, ws);
      if (opponent) send(opponent, { type: "opponent_left" });
      leaveRoom(ws, meta.roomId);
    }
    clients.delete(ws);
    console.log(`[-] Client disconnected. Total: ${wss.clients.size}`);
  });

  ws.on("error", (err) => console.error("[WS Error]", err.message));
});

function leaveRoom(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.players = room.players.filter(p => p !== ws);
  if (room.players.length === 0) {
    rooms.delete(roomId);
    console.log(`[Room] Deleted empty room: ${roomId}`);
  }
}

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const p of room.players) clients.delete(p);
  rooms.delete(roomId);
}

console.log(`
╔══════════════════════════════════════╗
║   Pokémon Battle Server running      ║
║   ws://localhost:${PORT}               ║
╚══════════════════════════════════════╝
`);
