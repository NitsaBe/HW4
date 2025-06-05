
import { Server, Socket } from "socket.io";

type Vector2 = { x: number; y: number };

interface Player {
  socket: Socket;
  number: 1 | 2;
}

export class GameSession {
  private roomId: string;
  private io: Server;
  private players: Player[];

  private interval: NodeJS.Timeout | null = null;

  private ball: Vector2 = { x: 300, y: 200 };
  private ballVelocity: Vector2 = { x: 4, y: 4 };
  private paddle1Y = 150;
  private paddle2Y = 150;
  private score1 = 0;
  private score2 = 0;

  constructor(io: Server, roomId: string, players: Player[]) {
    this.io = io;
    this.roomId = roomId;
    this.players = players;

    this.start();
  }

  private start() {
    console.log(`🎮 Game starting in room ${this.roomId}`);
    this.interval = setInterval(() => this.update(), 1000 / 60);
  }

  private update() {

    this.ball.x += this.ballVelocity.x;
    this.ball.y += this.ballVelocity.y;

 
    if (this.ball.y <= 0 || this.ball.y >= 400) {
      this.ballVelocity.y *= -1;
    }

    if (this.ball.x <= 20 && this.ball.y >= this.paddle1Y && this.ball.y <= this.paddle1Y + 100) {
      this.ballVelocity.x *= -1;
    }
    if (this.ball.x >= 580 && this.ball.y >= this.paddle2Y && this.ball.y <= this.paddle2Y + 100) {
      this.ballVelocity.x *= -1;
    }


    if (this.ball.x < 0) {
      this.score2++;
      this.resetBall();
    }
    if (this.ball.x > 600) {
      this.score1++;
      this.resetBall();
    }

  
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

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
