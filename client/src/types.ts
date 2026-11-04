export type Difficulty = 'easy' | 'medium' | 'hard' | 'all';
export type GameMode = 'classic' | 'retro-ascii' | 'blur' | 'cry';
export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'revealed' | 'gameover';

export interface PokemonData {
  id: number;
  name: string;
  displayName: string;
  types: string[];
  height: number;
  weight: number;
  sprite: string;
  artwork: string;
  cryUrl?: string;
  asciiArt?: string;
  generation: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isHost: boolean;
  isReady: boolean;
  hasGuessed: boolean;
  guessTime?: number;
  roundScore?: number;
  lastGuessCorrect?: boolean;
}

export interface RoomSettings {
  difficulty: Difficulty;
  roundDuration: number;
  totalRounds: number;
  gameMode: GameMode;
  allowSuggestions: boolean;
}

export interface RoundResult {
  round: number;
  pokemon: PokemonData;
  winners: {
    playerId: string;
    playerName: string;
    points: number;
    timeTaken: number;
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text?: string;
  emoji?: string;
  isSystem?: boolean;
  timestamp: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  players: Record<string, Player>;
  settings: RoomSettings;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  timer: number;
  currentPokemon?: PokemonData;
  revealPokemon?: PokemonData;
  chatMessages: ChatMessage[];
  roundHistory: RoundResult[];
}
