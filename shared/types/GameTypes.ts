//from c to s
export type ClientToServerEvents = {
  paddleMove: (data: PaddleMovePayload) => void;
  joinGame: (data: { roomId: string }) => void;
};

//from s to c
export type ServerToClientEvents = {
  gameState: (state: GameState) => void;
  playerNumber: (num: 1 | 2) => void;
  gameOver: (winner: 1 | 2) => void;
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
