//from c to s
export type ClientToServerEvents = {
  joinGame: (data: { roomId: string }) => void;
  paddleMove: (data: { roomId: string; posY: number }) => void;
};
//from s to c
export type ServerToClientEvents = {
  playerNumber: (num: 1 | 2) => void;
  roomFull: () => void;
  gameOver: (winner: 1 | 2) => void;
  gameState: (state: {
    ball: { x: number; y: number };
    paddle1Y: number;
    paddle2Y: number;
    score1: number;
    score2: number;
  }) => void;
};

export interface PaddleMovePayload {
  y: number;
  playerId: string;
}

export interface GameState {
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  paddles: {
    [playerId: string]: {
      y: number;
    };
  };
  score: {
    1: number;
    2: number;
  };
}
