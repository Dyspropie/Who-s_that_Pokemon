import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Terminal, Sparkles, Users } from 'lucide-react';

interface HeaderProps {
  roomCode?: string;
  playerCount?: number;
  isAsciiMode: boolean;
  onToggleAsciiMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  phase: string;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  playerCount = 1,
  isAsciiMode,
  onToggleAsciiMode,
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
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-red-800/60 bg-red-600 px-4 py-3 text-white shadow-xl">
      {/* Pokedex Sensor & Logo */}
      <div className="flex items-center gap-3">
        {/* Large Blue Sensor Lens */}
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-radial from-cyan-300 via-sky-500 to-blue-700 shadow-[0_0_15px_rgba(56,189,248,0.8)]">
          <div className="h-3 w-3 rounded-full bg-white opacity-80 animate-ping" />
        </div>

        {/* Small Indicator Lights */}
        <div className="hidden sm:flex items-center gap-2">
          <div className={`h-3.5 w-3.5 rounded-full border border-black/30 shadow-inner ${phase === 'playing' ? 'bg-red-400 animate-pulse' : 'bg-red-800'}`} />
          <div className={`h-3.5 w-3.5 rounded-full border border-black/30 shadow-inner ${phase === 'countdown' ? 'bg-yellow-300 animate-pulse' : 'bg-yellow-700'}`} />
          <div className={`h-3.5 w-3.5 rounded-full border border-black/30 shadow-inner ${phase === 'revealed' ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-800'}`} />
        </div>

        <div className="ml-1">
          <h1 className="text-lg font-black tracking-wider uppercase sm:text-xl drop-shadow-md">
            Who's That Pokémon?
          </h1>
          <p className="text-xs font-semibold text-red-200">Full-Stack Multiplayer Edition</p>
        </div>
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Room Code Badge */}
        {roomCode && (
          <button
            onClick={copyRoomCode}
            title="Click to copy room code"
            className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-amber-300 hover:bg-black/60 transition border border-amber-400/40"
          >
            <span className="text-slate-300 font-sans tracking-normal font-medium">ROOM:</span>
            <span>{roomCode}</span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
          </button>
        )}

        {/* Player Count */}
        {roomCode && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-black/30 px-2.5 py-1.5 text-xs font-semibold text-red-100">
            <Users className="h-3.5 w-3.5" />
            <span>{playerCount}</span>
          </div>
        )}

        {/* Retro ASCII View Mode Toggle */}
        <button
          onClick={onToggleAsciiMode}
          title={isAsciiMode ? 'Switch to HD Anime View' : 'Switch to Retro Terminal ASCII View'}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
            isAsciiMode
              ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'bg-black/30 text-white border-white/20 hover:bg-black/50'
          }`}
        >
          {isAsciiMode ? <Terminal className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isAsciiMode ? 'ASCII Mode' : 'HD Mode'}</span>
        </button>

        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="rounded-xl bg-black/30 p-2 text-white hover:bg-black/50 transition border border-white/20"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-red-300" /> : <Volume2 className="h-4 w-4 text-white" />}
        </button>
      </div>
    </header>
  );
};
