import React from 'react';
import type { PokemonData } from '../types';
import { AsciiDisplay } from './AsciiDisplay';
import { Sparkles, Terminal } from 'lucide-react';

interface SilhouetteViewerProps {
  pokemon?: PokemonData;
  isRevealed: boolean;
  isAsciiMode: boolean;
  onToggleAsciiMode: () => void;
  className?: string;
}

export const SilhouetteViewer: React.FC<SilhouetteViewerProps> = ({
  pokemon,
  isRevealed,
  isAsciiMode,
  onToggleAsciiMode,
  className = ''
}) => {
  const imageUrl = pokemon?.artwork || pokemon?.sprite;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Mode Switch Pill on Top of Screen */}
      <div className="mb-2 flex items-center gap-1 rounded-full bg-slate-900/80 p-1 border border-slate-700/60 shadow-md">
        <button
          onClick={() => isAsciiMode && onToggleAsciiMode()}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
            !isAsciiMode
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>HD Anime</span>
        </button>
        <button
          onClick={() => !isAsciiMode && onToggleAsciiMode()}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
            isAsciiMode
              ? 'bg-emerald-500 text-neutral-950 shadow-sm font-mono'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Retro ASCII</span>
        </button>
      </div>

      {/* Main Screen Container (Pokédex Screen Bezel) */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-8 border-slate-300 bg-slate-900 p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_15px_30px_rgba(0,0,0,0.5)]">
        {/* Screen Bezel Notches */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
        </div>

        {isAsciiMode ? (
          <AsciiDisplay
            imageUrl={imageUrl}
            isSilhouette={!isRevealed}
            cols={46}
            className="w-full min-h-[320px]"
          />
        ) : (
          <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl bg-radial from-amber-400 via-amber-500 to-amber-600 shadow-inner">
            {/* Retro Pokémon anime sunburst rays background */}
            <div className="absolute inset-0 opacity-40 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,#f59e0b_0deg_15deg,#fbbf24_15deg_30deg)] animate-spin-slow" />

            {/* Glowing circular backdrop */}
            <div className="absolute h-56 w-56 rounded-full bg-white/30 blur-2xl" />

            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Mystery Pokemon"
                className={`relative z-10 max-h-64 max-w-[260px] object-contain transition-all duration-700 ${
                  isRevealed
                    ? 'pokemon-revealed scale-105'
                    : 'pokemon-silhouette scale-100'
                }`}
              />
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-2 text-slate-800">
                <span className="text-5xl font-black">?</span>
                <span className="font-bold tracking-wider">Awaiting Pokémon...</span>
              </div>
            )}
          </div>
        )}

        {/* Lower Speaker Grille Accent */}
        <div className="mt-2 flex items-center justify-between px-3 text-slate-400">
          <div className="h-3 w-3 rounded-full bg-red-600 border border-slate-700" />
          <div className="flex gap-1.5">
            <div className="h-1 w-6 rounded bg-slate-600" />
            <div className="h-1 w-6 rounded bg-slate-600" />
            <div className="h-1 w-6 rounded bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
