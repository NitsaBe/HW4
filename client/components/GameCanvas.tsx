import React, { useEffect, useRef } from "react";
import { socket } from "../../client/src/socket";

interface GameState {
  ball: { x: number; y: number };
  paddle1Y: number;
  paddle2Y: number;
  score1: number;
  score2: number;
}

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Draw loop (60 FPS)
    const draw = () => {
      if (!ctx || !gameStateRef.current) return;

      const { ball, paddle1Y, paddle2Y, score1, score2 } = gameStateRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // Draw paddles
      ctx.fillStyle = "#fff";
      ctx.fillRect(10, paddle1Y, 10, 100); // Left paddle
      ctx.fillRect(canvas.width - 20, paddle2Y, 10, 100); // Right paddle

      // Draw scores
      ctx.font = "24px Arial";
      ctx.fillText(`${score1}`, canvas.width / 2 - 50, 30);
      ctx.fillText(`${score2}`, canvas.width / 2 + 30, 30);

      requestAnimationFrame(draw);
    };

    draw(); // Start animation

    // Listen to server updates
    socket.on("gameState", (data: GameState) => {
      gameStateRef.current = data;
    });

    return () => {
      socket.off("gameState");
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: "2px solid white", backgroundColor: "black" }}
      />
    </div>
  );
};

export default GameCanvas;
