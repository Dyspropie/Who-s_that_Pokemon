import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Users } from 'lucide-react';

interface HeaderProps {
  roomCode?: string;
  playerCount?: number;
  isMuted: boolean;
  onToggleMute: () => void;
  phase: string;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  playerCount = 1,
  isMuted,
  onToggleMute,
  phase
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 border-b-4 border-red-950 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
      {/* Top Pokédex Hinge / Curve Notch */}
      <div className="absolute -bottom-3.5 left-8 hidden sm:block h-3.5 w-40 rounded-b-xl bg-red-700 border-x-4 border-b-4 border-red-950 shadow-md" />

      {/* Pokedex Sensor & Logo */}
      <div className="flex items-center gap-3">
        {/* Large Blue Optical Camera Lens with Gloss & Specular Glow */}
        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-4 border-slate-200 bg-radial from-cyan-300 via-sky-500 to-blue-800 shadow-[0_0_20px_rgba(56,189,248,0.9),inset_0_2px_4px_rgba(255,255,255,0.8)]">
          <div className="absolute top-1.5 left-2 h-3.5 w-3.5 rounded-full bg-white opacity-85 blur-[0.5px]" />
          <div className="h-4 w-4 rounded-full bg-cyan-200/50 animate-ping" />
        </div>

        {/* Triple Status LEDs */}
        <div className="flex items-center gap-2">
          <div className={`h-4 w-4 rounded-full border-2 border-slate-900 shadow-md transition-all ${phase === 'playing' ? 'bg-red-400 shadow-[0_0_10px_#ef4444] animate-pulse' : 'bg-red-900'}`} />
          <div className={`h-4 w-4 rounded-full border-2 border-slate-900 shadow-md transition-all ${phase === 'countdown' ? 'bg-yellow-300 shadow-[0_0_10px_#fde047] animate-pulse' : 'bg-yellow-800'}`} />
          <div className={`h-4 w-4 rounded-full border-2 border-slate-900 shadow-md transition-all ${phase === 'revealed' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-emerald-900'}`} />
        </div>

        <div className="ml-1 sm:ml-2">
          <h1 className="pokemon-title-text text-xl sm:text-2xl font-black uppercase tracking-wider drop-shadow-md">
            Who's That Pokémon?
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-yellow-200 drop-shadow">
              Pokédex Arena
            </span>
            <span className="hidden sm:inline-block rounded bg-red-900/60 px-1.5 py-0.2 text-[10px] font-mono text-red-200 border border-red-800">
              LIVE BATTLE
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Room Code Badge (Styled like an official Pokémon Gym Badge) */}
        {roomCode && (
          <button
            onClick={copyRoomCode}
            title="Click to copy room code"
            className="flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3.5 py-2 text-xs font-mono font-black tracking-widest text-amber-400 hover:bg-black transition border-2 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] active:scale-95 cursor-pointer"
          >
            <span className="text-slate-400 font-sans tracking-normal font-bold hidden sm:inline">ROOM:</span>
            <span className="text-sm">{roomCode}</span>
            {copied ? (
              <span className="text-emerald-400 flex items-center gap-1 font-sans text-[11px]">
                <Check className="h-3.5 w-3.5" /> Copied!
              </span>
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-70" />
            )}
          </button>
        )}

        {/* Connected Players Count */}
        {roomCode && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/40 px-3 py-2 text-xs font-bold text-white border border-white/10">
            <Users className="h-3.5 w-3.5 text-amber-300" />
            <span>{playerCount}</span>
          </div>
        )}

        {/* Audio Mute Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
          className="rounded-2xl bg-black/40 p-2.5 text-white hover:bg-black/60 transition border border-white/20 active:scale-95 cursor-pointer"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-300" />}
        </button>
      </div>
    </header>
  );
};
