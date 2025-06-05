import { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents
} from "../shared/types/GameTypes";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, {}>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, {}>;

type Vector2 = { x: number; y: number };

interface Player {
  socket: TypedSocket;
  number: 1 | 2;
}

export class GameSession {
  private roomId: string;
  private io: TypedServer;
  private players: Player[];

  private interval: NodeJS.Timeout | null = null;

  private ball: Vector2 = { x: 300, y: 200 };
  private ballVelocity: Vector2 = { x: 4, y: 4 };
  private paddle1Y = 150;
  private paddle2Y = 150;
  private score1 = 0;
  private score2 = 0;

  // Game constants
  private readonly PADDLE_THICKNESS = 10;
  private readonly PADDLE_HEIGHT = 100;
  private readonly PADDLE1_X = 20;
  private readonly PADDLE2_X = 580;
  private readonly CANVAS_WIDTH = 600;
  private readonly CANVAS_HEIGHT = 400;

  constructor(io: TypedServer, roomId: string, players: Player[]) {
    this.io = io;
    this.roomId = roomId;
    this.players = players;

    // Set up disconnect handlers for both players
    players.forEach(player => {
      player.socket.on("disconnect", () => this.handleDisconnect(player.socket.id));
    });

    this.start();
  }

  private start() {
    console.log(`🎮 Game starting in room ${this.roomId}`);
    this.interval = setInterval(() => this.update(), 1000 / 60);
  }

  private update() {
    this.ball.x += this.ballVelocity.x;
    this.ball.y += this.ballVelocity.y;

    // Wall collisions (top and bottom)
    if (this.ball.y <= 0 || this.ball.y >= this.CANVAS_HEIGHT) {
      this.ballVelocity.y *= -1;
    }

    // Paddle collisions with improved detection
    // Player 1 paddle (left side)
    if (
      this.ball.x - this.PADDLE_THICKNESS <= this.PADDLE1_X &&
      this.ball.y >= this.paddle1Y &&
      this.ball.y <= this.paddle1Y + this.PADDLE_HEIGHT
    ) {
      this.ballVelocity.x *= -1;
    }

    // Player 2 paddle (right side)
    if (
      this.ball.x + this.PADDLE_THICKNESS >= this.PADDLE2_X &&
      this.ball.y >= this.paddle2Y &&
      this.ball.y <= this.paddle2Y + this.PADDLE_HEIGHT
    ) {
      this.ballVelocity.x *= -1;
    }

    // Scoring
    if (this.ball.x < 0) {
      this.score2++;
      this.resetBall();
    }
    if (this.ball.x > this.CANVAS_WIDTH) {
      this.score1++;
      this.resetBall();
    }

    // Emit game state
    this.io.to(this.roomId).emit("gameState", {
      ball: this.ball,
      paddle1Y: this.paddle1Y,
      paddle2Y: this.paddle2Y,
      score1: this.score1,
      score2: this.score2,
    });
  }

  private resetBall() {
    this.ball = { x: 300, y: 200 };
    this.ballVelocity = { x: -this.ballVelocity.x, y: 4 };
  }

  public updatePaddle(playerNum: 1 | 2, posY: number) {
    if (playerNum === 1) this.paddle1Y = posY;
    else this.paddle2Y = posY;
  }

  public handleDisconnect(socketId: string) {
    if (this.players.some(p => p.socket.id === socketId)) {
      this.stop();
      this.io.to(this.roomId).emit("gameOver", 2);
    }
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
