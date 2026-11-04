import React, { useState } from 'react';
import type { Player, PokemonData } from '../types';
import { AsciiDisplay } from './AsciiDisplay';
import { Volume2, Trophy, Sparkles, Terminal } from 'lucide-react';
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
  electric: 'bg-amber-500 text-amber-950 font-black',
  ice: 'bg-cyan-500 text-cyan-950',
  fighting: 'bg-red-800 text-red-100',
  poison: 'bg-purple-700 text-purple-100',
  ground: 'bg-amber-700 text-amber-100',
  flying: 'bg-indigo-400 text-indigo-950',
  psychic: 'bg-pink-600 text-pink-100',
  bug: 'bg-lime-600 text-lime-950',
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
  const [activeTab, setActiveTab] = useState<'visual' | 'ascii'>('visual');
  const playerList = Object.values(players).sort((a, b) => b.score - a.score);
  const imageUrl = pokemon?.artwork || pokemon?.sprite;

  const playCry = () => {
    if (pokemon?.cryUrl) {
      sounds.playPokemonCry(pokemon.cryUrl);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 animate-fadeIn">
      {/* Top Banner: Reveal Announcement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900/95 p-6 border-2 border-amber-500/40 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>It's...</span>
          </div>
          <h2 className="mt-1 text-3xl font-black text-white sm:text-4xl drop-shadow-md">
            {pokemon?.displayName || 'Unknown Pokémon'}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
              Gen {pokemon?.generation || 1}
            </span>
            {pokemon?.types.map((type) => (
              <span
                key={type}
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
                  TYPE_COLORS[type] || 'bg-slate-700 text-white'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Next Round Countdown Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={playCry}
            title="Play Pokémon Cry"
            className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-white border border-slate-700 transition cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-amber-400" />
            <span>Hear Cry</span>
          </button>

          <div className="flex items-center gap-2 rounded-2xl bg-amber-400/20 px-4 py-3 border border-amber-400/40 text-amber-300">
            <span className="text-xs font-bold uppercase">Next Round in</span>
            <span className="font-mono text-lg font-black">{nextTimer}s</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Card & Round Scoreboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Artwork / ASCII Dual View */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* View Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 shadow-md">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Artwork</span>
            </button>
            <button
              onClick={() => setActiveTab('ascii')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                activeTab === 'ascii'
                  ? 'bg-emerald-600 text-white shadow-md font-mono'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Terminal ASCII Spec</span>
            </button>
          </div>

          {activeTab === 'visual' ? (
            <div className="relative flex min-h-[350px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-700 bg-radial from-amber-400 via-amber-500 to-amber-600 p-6 shadow-2xl">
              <div className="absolute inset-0 opacity-40 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,#f59e0b_0deg_15deg,#fbbf24_15deg_30deg)] animate-spin-slow" />
              <img
                src={imageUrl}
                alt={pokemon?.displayName}
                className="relative z-10 max-h-72 max-w-[280px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] animate-bounce"
              />
              <div className="relative z-10 mt-4 flex gap-4 rounded-xl bg-black/50 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                <span>Height: {pokemon ? (pokemon.height / 10).toFixed(1) : 0} m</span>
                <span>•</span>
                <span>Weight: {pokemon ? (pokemon.weight / 10).toFixed(1) : 0} kg</span>
              </div>
            </div>
          ) : (
            <AsciiDisplay
              imageUrl={imageUrl}
              isSilhouette={false}
              cols={46}
              className="w-full min-h-[350px]"
            />
          )}
        </div>

        {/* Right Column: Round Scores & Leaderboard */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-3xl bg-slate-900/90 p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                Tournament Standings
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Round {currentRound} of {totalRounds}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {playerList.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl p-3 border transition ${
                    player.id === currentPlayerId
                      ? 'border-amber-400/50 bg-amber-400/10'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-black ${idx === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-white">{player.name}</span>
                      {player.hasGuessed ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <span>+{player.roundScore || 100} pts</span>
                          <span className="text-slate-500">• {player.guessTime}s</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-rose-400">
                          Missed this round
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-mono text-base font-black text-white">
                      {player.score}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
