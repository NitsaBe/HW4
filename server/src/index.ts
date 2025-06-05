import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";

import { GameRoomManager } from "./GameRoomManager";
import { GameSession } from "./GameSession";
import type { ClientToServerEvents, ServerToClientEvents } from "../shared/types/GameTypes";

const app = express();
const httpServer = createServer(app);

const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: "*" },
});

const PORT = 3000;
const roomManager = new GameRoomManager();
const sessions: Record<string, GameSession> = {};

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("joinGame", ({ roomId }) => {
    const playerNumber = roomManager.joinRoom(roomId, socket.id);

    if (!playerNumber) {
      socket.emit("roomFull");
      return;
    }

    socket.join(roomId);
    socket.emit("playerNumber", playerNumber);
    console.log(` Player ${playerNumber} joined room ${roomId}`);

    // If room now has 2 players, start the game session
    if (roomManager.isRoomFull(roomId)) {
      const players = roomManager.getPlayers(roomId);
      const playerSockets = players.map((p, index) => ({
        socket: io.sockets.sockets.get(p.id)!,
        number: (index + 1) as 1 | 2,
      }));

      const session = new GameSession(io, roomId, playerSockets);
      sessions[roomId] = session;

      console.log(`Game session started in room ${roomId}`);
    }
  });

  socket.on("paddleMove", ({ roomId, posY }) => {
    const session = sessions[roomId];
    if (!session) return;

    const player = roomManager.getPlayers(roomId).find(p => p.id === socket.id);
    if (!player) return;

    const playerNumber = session["players"].find(p => p.socket.id === socket.id)?.number;
    if (playerNumber) {
      session.updatePaddle(playerNumber, posY);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);

  });
});

httpServer.listen(PORT, () => {
  console.log(`🟢 Server running at http://localhost:${PORT}`);
});
