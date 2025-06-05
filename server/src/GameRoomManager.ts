interface PlayerInfo {
  id: string;
}

export class GameRoomManager {
  private rooms: Map<string, PlayerInfo[]> = new Map();

  joinRoom(roomId: string, playerId: string): 1 | 2 | null {
    const players = this.rooms.get(roomId) || [];

    if (players.length >= 2) return null; 

    players.push({ id: playerId });
    this.rooms.set(roomId, players);

    return players.length as 1 | 2; 
  }

  leaveRoom(roomId: string, playerId: string): void {
    const players = this.rooms.get(roomId);
    if (!players) return;

    const updatedPlayers = players.filter((p) => p.id !== playerId);
    if (updatedPlayers.length === 0) {
      this.rooms.delete(roomId);
    } else {
      this.rooms.set(roomId, updatedPlayers);
    }
  }

  getPlayers(roomId: string): PlayerInfo[] {
    return this.rooms.get(roomId) || [];
  }

  isRoomFull(roomId: string): boolean {
    return (this.rooms.get(roomId)?.length ?? 0) === 2;
  }
}
