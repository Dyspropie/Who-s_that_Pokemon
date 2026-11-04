import React from 'react';
import type { Player, PokemonData } from '../types';
import { getMascot } from '../data/mascots';
import { Volume2, Trophy, Sparkles, Zap } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface RevealViewProps {
  pokemon?: PokemonData;
  players: Record<string, Player>;
  currentPlayerId: string;
  nextTimer: number;
  currentRound: number;
  totalRounds: number;
}

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-stone-500 text-stone-100',
  fire: 'bg-orange-600 text-orange-100',
  water: 'bg-blue-600 text-blue-100',
  grass: 'bg-emerald-600 text-emerald-100',
  electric: 'bg-amber-400 text-amber-950 font-black',
  ice: 'bg-cyan-400 text-cyan-950 font-black',
  fighting: 'bg-red-800 text-red-100',
  poison: 'bg-purple-700 text-purple-100',
  ground: 'bg-amber-700 text-amber-100',
  flying: 'bg-indigo-400 text-indigo-950',
  psychic: 'bg-pink-600 text-pink-100',
  bug: 'bg-lime-600 text-lime-950 font-bold',
  rock: 'bg-stone-600 text-stone-100',
  ghost: 'bg-purple-900 text-purple-100',
  dragon: 'bg-indigo-700 text-indigo-100',
  steel: 'bg-slate-500 text-slate-100',
  dark: 'bg-neutral-800 text-neutral-100',
  fairy: 'bg-pink-400 text-pink-950'
};

export const RevealView: React.FC<RevealViewProps> = ({
  pokemon,
  players,
  currentPlayerId,
  nextTimer,
  currentRound,
  totalRounds
}) => {
  const playerList = Object.values(players).sort((a, b) => b.score - a.score);
  const imageUrl = pokemon?.artwork || pokemon?.sprite;

  const playCry = () => {
    if (pokemon?.cryUrl) {
      sounds.playPokemonCry(pokemon.cryUrl);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-3 sm:p-6 animate-fadeIn">
      {/* Top Banner: Reveal Announcement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-4 border-amber-400/80 bg-gradient-to-r from-red-950/95 via-slate-900 to-indigo-950/95 p-6 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>Target Identified</span>
          </div>
          <h2 className="pokemon-title-text mt-1 text-3xl sm:text-5xl font-black uppercase tracking-wider drop-shadow-md">
            It's {pokemon?.displayName || 'Unknown Pokémon'}!
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-slate-800 px-3 py-1 font-mono text-xs font-black text-amber-300 border border-slate-700">
              Gen {pokemon?.generation || 1} • #{pokemon?.id}
            </span>
            {pokemon?.types.map((type) => (
              <span
                key={type}
                className={`rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider shadow-md ${
                  TYPE_COLORS[type] || 'bg-slate-700 text-white'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Cry Trigger & Next Round Gauge */}
        <div className="flex items-center gap-3">
          <button
            onClick={playCry}
            title="Hear authentic Pokémon cry"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 px-5 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/30 transition active:scale-95 cursor-pointer"
          >
            <Volume2 className="h-4 w-4" />
            <span>Hear Cry</span>
          </button>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 border-2 border-red-500 text-red-400 shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Next Round</span>
            <span className="font-mono text-xl font-black text-white">{nextTimer}s</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Round Scoreboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Revealed Pokémon Showcase with Seamless Background */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative flex min-h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-700 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-6 shadow-2xl">
            {/* SEAMLESS Rotating Rays: Giant circle with origin-center and overflow-hidden */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
              <div className="absolute h-[380%] w-[380%] rounded-full opacity-45 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,#f59e0b_0deg_15deg,#fbbf24_15deg_30deg)] animate-spin-slow origin-center" />
              <div className="absolute inset-0 bg-radial from-white/30 via-transparent to-amber-900/30" />
              <div className="absolute h-64 w-64 rounded-full bg-white/40 blur-2xl" />
            </div>

            <img
              src={imageUrl}
              alt={pokemon?.displayName}
              className="relative z-10 max-h-72 max-w-[280px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] animate-bounce"
            />

            <div className="relative z-10 mt-4 flex gap-4 rounded-2xl bg-black/60 px-5 py-2 text-xs font-black text-white backdrop-blur-md border border-white/10">
              <span>Height: {pokemon ? (pokemon.height / 10).toFixed(1) : 0} m</span>
              <span className="text-amber-400">•</span>
              <span>Weight: {pokemon ? (pokemon.weight / 10).toFixed(1) : 0} kg</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tournament Standings with Companion Pokémon Icons */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                Tournament Standings
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                Round {currentRound} / {totalRounds}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {playerList.map((player, idx) => {
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
                      <span className={`font-mono text-sm font-black ${idx === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                      <img
                        src={mascot.spriteUrl}
                        alt={mascot.name}
                        className="h-9 w-9 object-contain pokemon-sprite-icon"
                      />
                      <div>
                        <span className="font-black text-sm text-white">{player.name}</span>
                        {player.hasGuessed ? (
                          <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
                            <Zap className="h-3 w-3" />
                            <span>+{player.roundScore || 100} pts</span>
                            <span className="text-slate-400 font-normal">({player.guessTime}s)</span>
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-rose-400">
                            Timed Out
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-black text-white">
                        {player.score}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase ml-1">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
