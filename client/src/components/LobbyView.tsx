import React from 'react';
import type { Player, RoomSettings } from '../types';
import { Crown, CheckCircle2, Circle, Play, Settings, Sparkles, User } from 'lucide-react';

interface LobbyViewProps {
  roomCode: string;
  players: Record<string, Player>;
  currentPlayerId: string;
  settings: RoomSettings;
  isHost: boolean;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  trainerName: string;
  setTrainerName: (name: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
}

const AVATARS = [
  { id: 'pikachu', label: 'Pikachu', emoji: '⚡', color: 'from-amber-400 to-yellow-500' },
  { id: 'charmander', label: 'Charmander', emoji: '🔥', color: 'from-orange-500 to-red-600' },
  { id: 'squirtle', label: 'Squirtle', emoji: '💧', color: 'from-sky-400 to-blue-600' },
  { id: 'bulbasaur', label: 'Bulbasaur', emoji: '🍃', color: 'from-emerald-400 to-teal-600' },
  { id: 'eevee', label: 'Eevee', emoji: '🦊', color: 'from-amber-600 to-stone-700' },
  { id: 'gengar', label: 'Gengar', emoji: '👻', color: 'from-purple-600 to-indigo-800' }
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomCode,
  players,
  currentPlayerId,
  settings,
  isHost,
  onUpdateSettings,
  onToggleReady,
  onStartGame,
  trainerName,
  setTrainerName,
  avatar,
  setAvatar
}) => {
  const playerList = Object.values(players);
  const currentPlayer = players[currentPlayerId];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900/90 p-6 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
            <Sparkles className="h-4 w-4" />
            <span>Multiplayer Battle Lobby</span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Room Code: <span className="font-mono text-amber-400 tracking-widest">{roomCode}</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Share this code with other trainers to invite them into the arena!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={playerList.length < 1}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Start Battle ({playerList.length} Ready)</span>
            </button>
          ) : (
            <button
              onClick={onToggleReady}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold shadow-lg transition active:scale-95 cursor-pointer ${
                currentPlayer?.isReady
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {currentPlayer?.isReady ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <span>Ready!</span>
                </>
              ) : (
                <>
                  <Circle className="h-5 w-5 opacity-60" />
                  <span>Click When Ready</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Trainer Customization */}
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-900/80 p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <User className="h-4 w-4 text-amber-400" />
            <span>Trainer Profile</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Your Trainer Name</label>
            <input
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              maxLength={15}
              placeholder="e.g. Red, Ash, Misty"
              className="mt-1 w-full rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white border border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Choose Starter Mascot</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl p-2.5 border transition cursor-pointer ${
                    avatar === av.id
                      ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="mt-1 text-[11px] font-bold text-slate-300">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Connected Players */}
        <div className="flex flex-col gap-3 rounded-3xl bg-slate-900/80 p-5 border border-slate-800 shadow-xl md:col-span-1">
          <div className="flex items-center justify-between text-sm font-bold text-slate-200">
            <span>Trainers in Room</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-amber-400">
              {playerList.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
            {playerList.map((player) => {
              const matchedAvatar = AVATARS.find((a) => a.id === player.avatar) || AVATARS[0];
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl p-3 border transition ${
                    player.id === currentPlayerId
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${matchedAvatar.color} text-lg shadow-sm`}>
                      {matchedAvatar.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{player.name}</span>
                        {player.isHost && (
                          <span title="Room Host">
                            <Crown className="h-3.5 w-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {player.id === currentPlayerId ? 'You' : 'Trainer'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {player.isHost ? (
                      <span className="rounded-md bg-amber-400/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/20">
                        HOST
                      </span>
                    ) : player.isReady ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Ready
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">Waiting</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Room Settings (Host configures) */}
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-900/80 p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Settings className="h-4 w-4 text-rose-400" />
            <span>Match Rules {isHost ? '(Host Controls)' : '(Read Only)'}</span>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Generation / Difficulty</label>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {[
                { id: 'easy', label: 'Easy (Gen 1)' },
                { id: 'medium', label: 'Medium (Gen 1-2)' },
                { id: 'hard', label: 'Hard (Gen 1-4)' },
                { id: 'all', label: 'Master (Gen 1-9)' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ difficulty: diff.id as any })}
                  className={`rounded-xl px-2.5 py-2 text-xs font-bold border transition ${
                    settings.difficulty === diff.id
                      ? 'border-red-500 bg-red-600/20 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Per Round */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Timer Per Round</label>
            <div className="mt-1.5 flex gap-2">
              {[10, 15, 20].map((sec) => (
                <button
                  key={sec}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ roundDuration: sec })}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                    settings.roundDuration === sec
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Total Rounds */}
          <div>
            <label className="text-xs font-semibold text-slate-400">Total Rounds</label>
            <div className="mt-1.5 flex gap-2">
              {[5, 10, 15].map((rounds) => (
                <button
                  key={rounds}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ totalRounds: rounds })}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                    settings.totalRounds === rounds
                      ? 'border-indigo-400 bg-indigo-400/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  {rounds} Rds
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
