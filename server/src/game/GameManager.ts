import { Server } from 'socket.io';
import { 
  Difficulty, 
  GameMode, 
  GamePhase, 
  Player, 
  PokemonData, 
  RoomSettings, 
  RoomState, 
  RoundResult 
} from '../types.js';
import { getRandomPokemon } from '../data/pokemon.js';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Levenshtein distance algorithm for fuzzy spelling tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function cleanPokemonName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export class GameManager {
  private io: Server;
  private rooms: Map<string, RoomState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(hostSocketId: string, hostName: string, avatar: string): RoomState {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    const hostPlayer: Player = {
      id: hostSocketId,
      name: hostName || 'Red',
      avatar: avatar || 'pikachu',
      score: 0,
      streak: 0,
      isHost: true,
      isReady: true,
      hasGuessed: false
    };

    const roomState: RoomState = {
      code,
      hostId: hostSocketId,
      players: { [hostSocketId]: hostPlayer },
      settings: {
        difficulty: 'easy',
        roundDuration: 15,
        totalRounds: 10,
        gameMode: 'classic',
        allowSuggestions: true
      },
      phase: 'lobby',
      currentRound: 0,
      totalRounds: 10,
      timer: 0,
      chatMessages: [
        {
          id: Math.random().toString(36).substring(2, 9),
          senderId: 'system',
          senderName: 'Professor Oak',
          senderAvatar: 'oak',
          text: `Welcome to Room ${code}! Share the code with friends to battle.`,
          isSystem: true,
          timestamp: Date.now()
        }
      ],
      roundHistory: []
    };

    this.rooms.set(code, roomState);
    return roomState;
  }

  public joinRoom(code: string, socketId: string, name: string, avatar: string): RoomState | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;

    if (room.phase !== 'lobby' && !room.players[socketId]) {
      // Spectator or late joiner
    }

    const newPlayer: Player = {
      id: socketId,
      name: name || `Trainer_${Object.keys(room.players).length + 1}`,
      avatar: avatar || 'pikachu',
      score: 0,
      streak: 0,
      isHost: Object.keys(room.players).length === 0,
      isReady: false,
      hasGuessed: false
    };

    room.players[socketId] = newPlayer;
    if (!room.hostId) {
      room.hostId = socketId;
      newPlayer.isHost = true;
    }

    this.addSystemMessage(room, `${newPlayer.name} joined the room!`);
    this.broadcastRoomState(room);
    return room;
  }

  public leaveRoom(socketId: string): void {
    for (const [code, room] of this.rooms.entries()) {
      if (room.players[socketId]) {
        const playerName = room.players[socketId].name;
        delete room.players[socketId];

        const remainingPlayerIds = Object.keys(room.players);
        if (remainingPlayerIds.length === 0) {
          // Cleanup empty room
          this.clearRoomTimer(code);
          this.rooms.delete(code);
        } else {
          // Reassign host if host left
          if (room.hostId === socketId) {
            room.hostId = remainingPlayerIds[0];
            room.players[room.hostId].isHost = true;
            this.addSystemMessage(room, `${room.players[room.hostId].name} is now the host.`);
          }
          this.addSystemMessage(room, `${playerName} left the room.`);
          this.broadcastRoomState(room);
        }
        break;
      }
    }
  }

  public updateSettings(code: string, socketId: string, settings: Partial<RoomSettings>): boolean {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== socketId || room.phase !== 'lobby') return false;

    room.settings = { ...room.settings, ...settings };
    room.totalRounds = room.settings.totalRounds;
    this.broadcastRoomState(room);
    return true;
  }

  public toggleReady(code: string, socketId: string): boolean {
    const room = this.rooms.get(code);
    if (!room || !room.players[socketId] || room.phase !== 'lobby') return false;

    room.players[socketId].isReady = !room.players[socketId].isReady;
    this.broadcastRoomState(room);
    return true;
  }

  public sendChat(code: string, socketId: string, text?: string, emoji?: string): boolean {
    const room = this.rooms.get(code);
    if (!room || !room.players[socketId]) return false;

    const player = room.players[socketId];
    const message = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: player.id,
      senderName: player.name,
      senderAvatar: player.avatar,
      text: text?.slice(0, 100),
      emoji,
      timestamp: Date.now()
    };

    room.chatMessages.push(message);
    if (room.chatMessages.length > 50) {
      room.chatMessages.shift();
    }

    this.io.to(code).emit('chat_message', message);
    return true;
  }

  public async startGame(code: string, socketId: string): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== socketId || room.phase !== 'lobby') return false;

    // Reset scores & streaks
    Object.values(room.players).forEach(p => {
      p.score = 0;
      p.streak = 0;
      p.hasGuessed = false;
      p.roundScore = 0;
      p.guessTime = undefined;
    });

    room.currentRound = 0;
    room.roundHistory = [];
    this.startCountdown(room);
    return true;
  }

  private startCountdown(room: string | RoomState): void {
    const currentRoom = typeof room === 'string' ? this.rooms.get(room) : room;
    if (!currentRoom) return;

    this.clearRoomTimer(currentRoom.code);
    currentRoom.phase = 'countdown';
    currentRoom.timer = 3;
    currentRoom.currentRound += 1;

    // Reset round states
    Object.values(currentRoom.players).forEach(p => {
      p.hasGuessed = false;
      p.roundScore = 0;
      p.guessTime = undefined;
      p.lastGuessCorrect = undefined;
    });

    this.broadcastRoomState(currentRoom);

    const interval = setInterval(async () => {
      currentRoom.timer -= 1;
      this.io.to(currentRoom.code).emit('timer_tick', { timer: currentRoom.timer, phase: 'countdown' });

      if (currentRoom.timer <= 0) {
        clearInterval(interval);
        await this.startPlayingPhase(currentRoom);
      }
    }, 1000);

    this.timers.set(currentRoom.code, interval);
  }

  private async startPlayingPhase(room: RoomState): Promise<void> {
    this.clearRoomTimer(room.code);
    room.phase = 'playing';
    room.timer = room.settings.roundDuration;

    // Fetch random Pokémon based on difficulty
    const pokemon = await getRandomPokemon(room.settings.difficulty);
    room.revealPokemon = pokemon;

    // Censor pokemon name during playing phase so client doesn't cheat by inspecting network payload!
    room.currentPokemon = {
      ...pokemon,
      name: '???',
      displayName: 'Who\'s That Pokémon?'
    };

    this.broadcastRoomState(room);

    const interval = setInterval(() => {
      room.timer -= 1;
      this.io.to(room.code).emit('timer_tick', { timer: room.timer, phase: 'playing' });

      if (room.timer <= 0) {
        clearInterval(interval);
        this.revealRound(room);
      }
    }, 1000);

    this.timers.set(room.code, interval);
  }

  public submitGuess(code: string, socketId: string, rawGuess: string): { status: 'correct' | 'close' | 'wrong' | 'already'; points?: number; message?: string } {
    const room = this.rooms.get(code);
    if (!room || room.phase !== 'playing' || !room.players[socketId] || !room.revealPokemon) {
      return { status: 'wrong' };
    }

    const player = room.players[socketId];
    if (player.hasGuessed) {
      return { status: 'already', message: 'You have already locked in your answer!' };
    }

    const targetClean = cleanPokemonName(room.revealPokemon.name);
    const guessClean = cleanPokemonName(rawGuess);

    if (!guessClean) {
      return { status: 'wrong' };
    }

    const dist = levenshteinDistance(guessClean, targetClean);
    const isExact = guessClean === targetClean;
    const isClose = !isExact && dist <= (targetClean.length > 5 ? 2 : 1);

    if (isExact) {
      const timeTaken = Math.max(0.1, room.settings.roundDuration - room.timer);
      const speedRatio = Math.max(0, room.timer / room.settings.roundDuration);
      
      const basePoints = 100;
      const speedBonus = Math.floor(speedRatio * 100);
      const streakBonus = player.streak * 25;
      const totalPoints = basePoints + speedBonus + streakBonus;

      player.hasGuessed = true;
      player.guessTime = parseFloat(timeTaken.toFixed(1));
      player.score += totalPoints;
      player.roundScore = totalPoints;
      player.streak += 1;
      player.lastGuessCorrect = true;

      // Broadcast to all players that this trainer guessed correctly
      this.io.to(code).emit('player_guessed', {
        playerId: player.id,
        playerName: player.name,
        timeTaken: player.guessTime,
        points: totalPoints
      });

      // Check if all players have guessed
      const allGuessed = Object.values(room.players).every(p => p.hasGuessed);
      if (allGuessed) {
        this.clearRoomTimer(code);
        setTimeout(() => this.revealRound(room), 600);
      } else {
        this.broadcastRoomState(room);
      }

      return { status: 'correct', points: totalPoints };
    } else if (isClose) {
      return { status: 'close', message: 'So close! Check your spelling!' };
    } else {
      player.lastGuessCorrect = false;
      return { status: 'wrong', message: 'Not quite! Try again!' };
    }
  }

  private revealRound(room: RoomState): void {
    this.clearRoomTimer(room.code);
    room.phase = 'revealed';
    room.timer = 7; // 7 seconds reveal inspection time

    // Uncensor current Pokémon
    room.currentPokemon = room.revealPokemon;

    // Reset streak for players who did not guess correctly
    Object.values(room.players).forEach(p => {
      if (!p.hasGuessed) {
        p.streak = 0;
        p.roundScore = 0;
      }
    });

    // Record round result
    if (room.revealPokemon) {
      const winners = Object.values(room.players)
        .filter(p => p.hasGuessed)
        .map(p => ({
          playerId: p.id,
          playerName: p.name,
          points: p.roundScore || 0,
          timeTaken: p.guessTime || 0
        }))
        .sort((a, b) => b.points - a.points);

      room.roundHistory.push({
        round: room.currentRound,
        pokemon: room.revealPokemon,
        winners
      });
    }

    this.broadcastRoomState(room);

    const interval = setInterval(() => {
      room.timer -= 1;
      this.io.to(room.code).emit('timer_tick', { timer: room.timer, phase: 'revealed' });

      if (room.timer <= 0) {
        clearInterval(interval);

        if (room.currentRound >= room.totalRounds) {
          this.endGame(room);
        } else {
          this.startCountdown(room);
        }
      }
    }, 1000);

    this.timers.set(room.code, interval);
  }

  private endGame(room: RoomState): void {
    this.clearRoomTimer(room.code);
    room.phase = 'gameover';
    this.broadcastRoomState(room);
  }

  public resetToLobby(code: string, socketId: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.hostId !== socketId) return false;

    this.clearRoomTimer(code);
    room.phase = 'lobby';
    room.currentRound = 0;
    room.currentPokemon = undefined;
    room.revealPokemon = undefined;
    room.roundHistory = [];

    Object.values(room.players).forEach(p => {
      p.score = 0;
      p.streak = 0;
      p.isReady = p.isHost;
      p.hasGuessed = false;
      p.roundScore = 0;
    });

    this.broadcastRoomState(room);
    return true;
  }

  private addSystemMessage(room: RoomState, text: string): void {
    const msg = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: 'system',
      senderName: 'System',
      senderAvatar: 'pokeball',
      text,
      isSystem: true,
      timestamp: Date.now()
    };
    room.chatMessages.push(msg);
    if (room.chatMessages.length > 50) room.chatMessages.shift();
    this.io.to(room.code).emit('chat_message', msg);
  }

  private clearRoomTimer(code: string): void {
    const timer = this.timers.get(code);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(code);
    }
  }

  public getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code);
  }

  public broadcastRoomState(room: RoomState): void {
    this.io.to(room.code).emit('room_state', room);
  }
}
