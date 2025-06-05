export interface ServerToClientEvents {
  gameState: (state: {
    ball: { x: number; y: number };
    paddle1Y: number;
    paddle2Y: number;
    score1: number;
    score2: number;
  }) => void;
  gameOver: (data: { reason: string }) => void;
}

export interface ClientToServerEvents {
  updatePaddle: (data: { playerNum: 1 | 2; posY: number }) => void;
} 