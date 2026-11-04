import React from 'react';
import type { Player, RoomSettings } from '../types';
import { MASCOTS, getMascot } from '../data/mascots';
import { Crown, CheckCircle2, Circle, Play, Settings, Sparkles, User, Shield } from 'lucide-react';

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-6">
      {/* Lobby Hero Arena Card */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-red-700 bg-gradient-to-r from-red-950/90 via-slate-900 to-indigo-950/90 p-5 sm:p-7 shadow-[0_15px_35px_rgba(0,0,0,0.7)] backdrop-blur-md">
        {/* Subtle Background Pokeball Watermark */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full border-[18px] border-white/5 opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Multiplayer Battle Lobby</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">
              Room Code: <span className="font-mono text-amber-400 tracking-widest drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">{roomCode}</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Share the code with friends or open on your phone to join the battle!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={playerList.length < 1}
                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 px-7 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Start Match ({playerList.length} In Room)</span>
              </button>
            ) : (
              <button
                onClick={onToggleReady}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm sm:text-base font-black uppercase tracking-wider shadow-lg transition active:scale-95 cursor-pointer ${
                  currentPlayer?.isReady
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-500'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                {currentPlayer?.isReady ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span>Ready for Battle!</span>
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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Trainer Setup & Mascot Picker (NO EMOJIS - REAL POKÉMON SPRITES WITH BLACK OUTLINE!) */}
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-black text-amber-400 uppercase tracking-wider">
            <User className="h-4 w-4" />
            <span>Trainer Card</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Nickname</label>
            <input
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              maxLength={15}
              placeholder="e.g. Ash, Red, Cynthia"
              className="mt-1.5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white border-2 border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Mascot Companion
              </label>
              <span className="text-[11px] font-bold text-amber-300">
                {getMascot(avatar).name}
              </span>
            </div>

            {/* Mascot Grid: Authentic Sprites with Black Outline */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {MASCOTS.map((m) => {
                const isSelected = avatar === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAvatar(m.id)}
                    className={`relative flex flex-col items-center justify-center rounded-2xl p-2 transition cursor-pointer border-2 ${
                      isSelected
                        ? 'border-amber-400 bg-gradient-to-b from-amber-400/20 to-amber-600/10 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-105'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={m.spriteUrl}
                      alt={m.name}
                      className="h-14 w-14 object-contain pokemon-sprite-icon"
                    />
                    <span className="text-[10px] font-black text-slate-200 mt-0.5">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Active Trainers in Arena */}
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between text-sm font-black text-slate-200 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Trainers Ready
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-amber-400 font-bold">
              {playerList.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[360px] pr-1">
            {playerList.map((player) => {
              const mascot = getMascot(player.avatar);
              const isCurrent = player.id === currentPlayerId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl p-3 border-2 transition ${
                    isCurrent
                      ? 'border-amber-400/60 bg-amber-400/10 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Companion Sprite with Black Outline */}
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 shadow-inner">
                      <img
                        src={mascot.spriteUrl}
                        alt={mascot.name}
                        className="h-10 w-10 object-contain pokemon-sprite-icon"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-white">{player.name}</span>
                        {player.isHost && (
                          <span title="Room Host">
                            <Crown className="h-3.5 w-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {isCurrent ? 'You (Trainer)' : mascot.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    {player.isHost ? (
                      <span className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-[10px] font-black text-amber-300 border border-amber-400/30">
                        HOST
                      </span>
                    ) : player.isReady ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Ready
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">Waiting</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Match Configuration */}
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-black text-slate-200 uppercase tracking-wider">
            <Settings className="h-4 w-4 text-rose-500" />
            <span>Rules {isHost ? '(Host Only)' : '(Locked)'}</span>
          </div>

          {/* Difficulty / Gens */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generation Scope</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                { id: 'easy', label: 'Gen 1 (Kanto)' },
                { id: 'medium', label: 'Gen 1-2 (Johto)' },
                { id: 'hard', label: 'Gen 1-4 (Sinnoh)' },
                { id: 'all', label: 'Gen 1-9 (All 1,025)' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ difficulty: diff.id as any })}
                  className={`rounded-xl px-2.5 py-2.5 text-xs font-bold border-2 transition ${
                    settings.difficulty === diff.id
                      ? 'border-red-500 bg-red-600/25 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seconds per round */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Round Countdown</label>
            <div className="mt-1.5 flex gap-2">
              {[10, 15, 20].map((sec) => (
                <button
                  key={sec}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ roundDuration: sec })}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-black border-2 transition ${
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rounds</label>
            <div className="mt-1.5 flex gap-2">
              {[5, 10, 15].map((rounds) => (
                <button
                  key={rounds}
                  disabled={!isHost}
                  onClick={() => onUpdateSettings({ totalRounds: rounds })}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-black border-2 transition ${
                    settings.totalRounds === rounds
                      ? 'border-indigo-400 bg-indigo-400/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  {rounds} Rounds
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
