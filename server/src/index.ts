import { Server as IOServer } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { GameRoomManager } from "./GameRoomManager";
const roomManager = new GameRoomManager();


import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types/GameTypes';

const app = express();
const httpServer = createServer(app);


const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
  },
});


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinGame", ({ roomId }) => {
    const playerNumber = roomManager.joinRoom(roomId, socket.id);

    if (!playerNumber) {
      socket.emit("gameOver", 0); 
      return;
    }

    socket.join(roomId);
    socket.emit("playerNumber", playerNumber);
    console.log(`🎮 Player ${playerNumber} joined room ${roomId}`);

    if (roomManager.isRoomFull(roomId)) {
      const players = roomManager.getPlayers(roomId);
      console.log(`Room ${roomId} is ready! Players:`, players.map(p => p.id));
      
      // TODO: Start game loop here in next task
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Optional: loop through rooms and clean up
  });
});


const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
