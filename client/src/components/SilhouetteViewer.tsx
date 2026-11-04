import React from 'react';
import type { PokemonData } from '../types';

interface SilhouetteViewerProps {
  pokemon?: PokemonData;
  isRevealed: boolean;
  className?: string;
}

export const SilhouetteViewer: React.FC<SilhouetteViewerProps> = ({
  pokemon,
  isRevealed,
  className = ''
}) => {
  const imageUrl = pokemon?.artwork || pokemon?.sprite;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Pokédex Outer Screen Bezel (Classic GameBoy / Pokédex Metallic Grey) */}
      <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-[2.5rem] border-[10px] border-slate-300 bg-slate-900 p-3 sm:p-4 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8),0_20px_35px_rgba(0,0,0,0.6)]">
        {/* Top Bezel Accents: Twin Red LEDs & Screw Rivets */}
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-600 border border-slate-700 shadow-[0_0_6px_#ef4444]" />
            <div className="h-2.5 w-2.5 rounded-full bg-red-600 border border-slate-700 shadow-[0_0_6px_#ef4444]" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-emerald-400 font-bold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            {isRevealed ? 'DATA_UNMASKED' : 'SCANNING_SILHOUETTE'}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-slate-600" />
            <div className="h-2 w-2 rounded-full bg-slate-600" />
          </div>
        </div>

        {/* The Screen: Authentic Anime Sunburst Backdrop */}
        <div className="relative flex min-h-[290px] sm:min-h-[340px] w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-800 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]">
          {/* SEAMLESS Rotating Rays: A giant circle with diameter 350% that rotates continuously with NO cut corners */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <div className="absolute h-[360%] w-[360%] rounded-full opacity-45 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,#f59e0b_0deg_15deg,#fbbf24_15deg_30deg)] animate-spin-slow origin-center" />
            {/* Center radial highlight vignette */}
            <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-amber-900/30" />
            <div className="absolute h-56 w-56 rounded-full bg-white/40 blur-2xl" />
          </div>

          {/* Silhouette / Revealed Pokémon Artwork */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Mystery Pokémon"
              className={`relative z-10 max-h-56 sm:max-h-64 max-w-[240px] sm:max-w-[280px] object-contain transition-all duration-700 ${
                isRevealed
                  ? 'pokemon-revealed scale-110 drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]'
                  : 'pokemon-silhouette scale-100 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'
              }`}
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-2 text-slate-900">
              <span className="text-6xl font-black drop-shadow">?</span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                Awaiting Target...
              </span>
            </div>
          )}

          {/* Authentic Watermark Badge in Corner */}
          <div className="absolute bottom-2 right-2 rounded-lg bg-black/40 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest text-amber-200 backdrop-blur-sm">
            #POKÉDEX
          </div>
        </div>

        {/* Lower Bezel Controls & GameBoy Styling Details */}
        <div className="mt-3 flex items-center justify-between px-3">
          {/* Status Red LED Light */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-600 border-2 border-slate-700 shadow-[0_0_8px_#ef4444]" />
            <div className="h-3 w-8 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          {/* Speaker Slits */}
          <div className="flex gap-1.5">
            <div className="h-1.5 w-7 rounded-full bg-slate-700 shadow-inner" />
            <div className="h-1.5 w-7 rounded-full bg-slate-700 shadow-inner" />
            <div className="h-1.5 w-7 rounded-full bg-slate-700 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};
