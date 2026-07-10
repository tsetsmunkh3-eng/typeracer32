/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { DEFAULT_QUOTES } from "./src/data";

function logToFile(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), "server.log"), line);
  } catch (err) {
    console.error("Failed to write log to file:", err);
  }
  console.log(msg);
}

interface Player {
  id: string;
  name: string;
  avatar: string; // Tailwind color or emoji
  progress: number; // 0-100
  wpm: number;
  accuracy: number;
  isHost: boolean;
  isReady: boolean;
  finished: boolean;
  finishTime?: number;
}

interface Lobby {
  id: string;
  lang: 'mn' | 'en';
  difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  quote: typeof DEFAULT_QUOTES[0];
  state: 'waiting' | 'countdown' | 'playing' | 'finished';
  countdown: number;
  players: Record<string, Player>;
  startTime?: number;
}

const lobbies: Record<string, Lobby> = {};

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const PORT = 3000;

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Handle WS upgrade
  server.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    logToFile(`Received upgrade request for URL: ${url}`);
    
    const pathname = url.split("?")[0];
    if (pathname === "/" || pathname === "/ws") {
      logToFile("Handling upgrade for multiplayer socket...");
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      logToFile(`Ignored upgrade request for pathname: ${pathname}`);
      socket.destroy();
    }
  });

  // Map of client WS to player info
  const clients = new Map<WebSocket, { lobbyId: string; playerId: string }>();

  wss.on("connection", (ws: WebSocket, request) => {
    logToFile(`WebSocket connection established! Remote address: ${request.socket.remoteAddress}`);
    
    ws.on("message", (messageStr: string) => {
      try {
        const event = JSON.parse(messageStr);
        const { type, payload } = event;
        logToFile(`WS Msg Recv: type=${type}`);

        if (type === "join") {
          const { lobbyId, playerName, avatar, lang, difficulty } = payload;
          const playerId = Math.random().toString(36).substring(2, 9);
          
          let lobby = lobbies[lobbyId];
          let isHost = false;

          if (!lobby) {
            // Filter quotes by initial host preferences
            const selectedLang = lang || 'mn';
            const selectedDiff = difficulty || 'medium';
            const filtered = DEFAULT_QUOTES.filter(q => q.lang === selectedLang && q.difficulty === selectedDiff);
            const quote = filtered.length > 0 
              ? filtered[Math.floor(Math.random() * filtered.length)]
              : DEFAULT_QUOTES[0];

            // Create new lobby
            lobby = {
              id: lobbyId,
              lang: selectedLang,
              difficulty: selectedDiff,
              quote,
              state: 'waiting',
              countdown: 5,
              players: {}
            };
            lobbies[lobbyId] = lobby;
            isHost = true;
          }

          // Check if game is already in progress
          if (lobby.state !== 'waiting') {
            ws.send(JSON.stringify({ type: "error", payload: "Уралдаан аль хэдийн эхэлсэн байна!" }));
            return;
          }

          const player: Player = {
            id: playerId,
            name: playerName || `Уралдагч-${playerId.substring(0, 4)}`,
            avatar: avatar || "🚗",
            progress: 0,
            wpm: 0,
            accuracy: 100,
            isHost,
            isReady: isHost, // Host is ready by default
            finished: false
          };

          lobby.players[playerId] = player;
          clients.set(ws, { lobbyId, playerId });

          // Broadcast lobby state to everyone in the lobby
          broadcastLobbyState(lobbyId);

          // Send confirmation to the joining client
          ws.send(JSON.stringify({ 
            type: "joined", 
            payload: { playerId, lobbyId, isHost, quote: lobby.quote } 
          }));
        }

        else if (type === "ready") {
          const clientInfo = clients.get(ws);
          if (!clientInfo) return;
          const { lobbyId, playerId } = clientInfo;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;

          if (lobby.players[playerId]) {
            lobby.players[playerId].isReady = payload.isReady;
            broadcastLobbyState(lobbyId);
          }
        }

        else if (type === "config_change") {
          const clientInfo = clients.get(ws);
          if (!clientInfo) return;
          const { lobbyId, playerId } = clientInfo;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;

          // Only host can configure
          if (!lobby.players[playerId]?.isHost) return;

          const { lang, difficulty } = payload;
          if (lang) lobby.lang = lang;
          if (difficulty) lobby.difficulty = difficulty;

          // Select a new matching quote
          const filtered = DEFAULT_QUOTES.filter(q => q.lang === lobby.lang && q.difficulty === lobby.difficulty);
          lobby.quote = filtered.length > 0 
            ? filtered[Math.floor(Math.random() * filtered.length)]
            : DEFAULT_QUOTES[0];

          broadcastLobbyState(lobbyId);
        }

        else if (type === "start_race") {
          const clientInfo = clients.get(ws);
          if (!clientInfo) return;
          const { lobbyId, playerId } = clientInfo;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;

          // Only host can start
          if (!lobby.players[playerId]?.isHost) return;

          // Set state to countdown
          lobby.state = 'countdown';
          lobby.countdown = 5;
          
          // Select a fresh quote just in case
          const filtered = DEFAULT_QUOTES.filter(q => q.lang === lobby.lang && q.difficulty === lobby.difficulty);
          lobby.quote = filtered.length > 0 
            ? filtered[Math.floor(Math.random() * filtered.length)]
            : DEFAULT_QUOTES[0];

          broadcastLobbyState(lobbyId);

          // Reset player progress/states for the race
          Object.values(lobby.players).forEach(p => {
            p.progress = 0;
            p.wpm = 0;
            p.accuracy = 100;
            p.finished = false;
            delete p.finishTime;
          });

          // Countdown timer
          let currentCount = 5;
          const intervalId = setInterval(() => {
            currentCount--;
            if (!lobbies[lobbyId]) {
              clearInterval(intervalId);
              return;
            }
            if (currentCount <= 0) {
              clearInterval(intervalId);
              lobby.state = 'playing';
              lobby.countdown = 0;
              lobby.startTime = Date.now();
              broadcastEvent(lobbyId, "race_started", { startTime: lobby.startTime, quote: lobby.quote });
              broadcastLobbyState(lobbyId);
            } else {
              lobby.countdown = currentCount;
              broadcastLobbyState(lobbyId);
            }
          }, 1000);
        }

        else if (type === "progress") {
          const clientInfo = clients.get(ws);
          if (!clientInfo) return;
          const { lobbyId, playerId } = clientInfo;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;
          if (lobby.state !== 'playing') return;

          const player = lobby.players[playerId];
          if (!player) return;

          const { progress, wpm, accuracy } = payload;
          player.progress = Math.min(100, Math.max(0, progress));
          player.wpm = wpm;
          player.accuracy = accuracy;

          // Check if player finished
          if (player.progress >= 100 && !player.finished) {
            player.finished = true;
            player.finishTime = Date.now() - (lobby.startTime || Date.now());
          }

          // Check if all players are finished
          const allFinished = Object.values(lobby.players).every(p => p.finished);
          if (allFinished) {
            lobby.state = 'finished';
          }

          broadcastLobbyState(lobbyId);
        }

        else if (type === "leave") {
          handleDisconnect(ws);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    });

    ws.on("close", (code, reason) => {
      logToFile(`WebSocket closed: code=${code}, reason=${reason}`);
      handleDisconnect(ws);
    });

    ws.on("error", (err) => {
      logToFile(`WebSocket error: ${err}`);
      handleDisconnect(ws);
    });
  });

  function broadcastLobbyState(lobbyId: string) {
    const lobby = lobbies[lobbyId];
    if (!lobby) return;

    broadcastEvent(lobbyId, "lobby_state", lobby);
  }

  function broadcastEvent(lobbyId: string, type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    clients.forEach((info, clientWs) => {
      if (info.lobbyId === lobbyId && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(message);
      }
    });
  }

  function handleDisconnect(ws: WebSocket) {
    const clientInfo = clients.get(ws);
    if (!clientInfo) return;

    const { lobbyId, playerId } = clientInfo;
    clients.delete(ws);

    const lobby = lobbies[lobbyId];
    if (!lobby) return;

    const wasHost = lobby.players[playerId]?.isHost;
    delete lobby.players[playerId];

    // If lobby is empty, delete it
    if (Object.keys(lobby.players).length === 0) {
      delete lobbies[lobbyId];
      return;
    }

    // If host left, assign a new host
    if (wasHost) {
      const remainingPlayerIds = Object.keys(lobby.players);
      if (remainingPlayerIds.length > 0) {
        const newHostId = remainingPlayerIds[0];
        lobby.players[newHostId].isHost = true;
        lobby.players[newHostId].isReady = true; // Host is always ready
      }
    }

    broadcastLobbyState(lobbyId);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
