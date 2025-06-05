import { useEffect } from "react";
import { socket } from "./socket";
import GameCanvas from "../components/GameCanvas"; // Correct relative path

function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.log("✅ Connected to server with ID:", socket.id);
      socket.emit("joinGame", { roomId: "room-1" });
    };

    const handleDisconnect = () => {
      console.log("❌ Disconnected from server");
    };

    const handleRoomFull = () => {
      alert("Room is full. Please try again later.");
    };

    const handlePlayerNumber = (num: 1 | 2) => {
      console.log(`🎮 You are Player ${num}`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomFull", handleRoomFull);
    socket.on("playerNumber", handlePlayerNumber);

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("roomFull", handleRoomFull);
      socket.off("playerNumber", handlePlayerNumber);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1 style={{ color: "white" }}>🎮 Real-Time Pong Game</h1>
      <p>Open the dev console to see socket connection logs.</p>
      <GameCanvas />
    </div>
  );
}

export default App;
