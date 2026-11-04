import React, { useState, useEffect, useRef } from 'react';
import type { Player, PokemonData } from '../types';
import { SilhouetteViewer } from './SilhouetteViewer';
import { getMascot } from '../data/mascots';
import { Send, Zap, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface GameViewProps {
  currentRound: number;
  totalRounds: number;
  timer: number;
  roundDuration: number;
  phase: string;
  pokemon?: PokemonData;
  players: Record<string, Player>;
  currentPlayerId: string;
  onSubmitGuess: (guess: string) => void;
  guessFeedback: { status: 'correct' | 'close' | 'wrong' | 'already' | null; message?: string };
}

export const GameView: React.FC<GameViewProps> = ({
  currentRound,
  totalRounds,
  timer,
  roundDuration,
  phase,
  pokemon,
  players,
  currentPlayerId,
  onSubmitGuess,
  guessFeedback
}) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const playerList = Object.values(players);
  const currentPlayer = players[currentPlayerId];

  // Auto-focus input when playing phase starts
  useEffect(() => {
    if (phase === 'playing') {
      setInputVal('');
      inputRef.current?.focus();
    }
  }, [phase, currentRound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || currentPlayer?.hasGuessed) return;
    onSubmitGuess(inputVal.trim());
    setInputVal('');
  };

  const progressPercent = Math.max(0, Math.min(100, (timer / roundDuration) * 100));

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6 p-3 sm:p-6">
      {/* Authentic Anime Countdown Overlay */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-3xl bg-slate-950/90 backdrop-blur-md p-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="pokemon-title-text text-xl sm:text-2xl font-black uppercase tracking-widest drop-shadow-lg">
              WHO'S THAT POKÉMON?!
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              ROUND {currentRound} OF {totalRounds}
            </span>
            <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 border-yellow-400 bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse">
              <span className="text-6xl sm:text-7xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {timer}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              Get ready to buzz in!
            </span>
          </div>
        </div>
      )}

      {/* Round & Timer Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-4 sm:px-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-black text-lg shadow-md shadow-red-600/30 border border-red-400">
            {currentRound}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Round</span>
            <h3 className="text-base sm:text-lg font-black text-white">Round {currentRound} / {totalRounds}</h3>
          </div>
        </div>

        {/* High-Tech Animated Timer Gauge */}
        <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[220px]">
          <Clock className={`h-5 w-5 ${timer <= 5 ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">Buzzer Window</span>
              <span className={`font-mono text-sm font-black ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {timer}s
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timer <= 5 ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Player Streak Badge */}
        {currentPlayer && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-400/15 px-3.5 py-2 border border-amber-400/30">
            <Zap className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <span className="block text-[10px] font-black text-amber-300 uppercase">Combo Streak</span>
              <span className="font-mono text-xs font-black text-white">{currentPlayer.streak}x</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Classic Pokédex Screen with Seamless Rotating Backdrop */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <SilhouetteViewer
            pokemon={pokemon}
            isRevealed={false}
            className="w-full"
          />
        </div>

        {/* Right: Guess Console & Live Trainer Standings */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Guess Input Card */}
          <div className="flex flex-col gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Identify Target
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Press Enter to Buzz In</span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                disabled={currentPlayer?.hasGuessed || phase !== 'playing'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={currentPlayer?.hasGuessed ? 'Answer Locked In!' : 'Enter Pokémon name...'}
                autoComplete="off"
                spellCheck="false"
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm sm:text-base font-bold text-white placeholder-slate-500 border-2 border-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={currentPlayer?.hasGuessed || !inputVal.trim() || phase !== 'playing'}
                className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 sm:px-6 py-3.5 font-black uppercase text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Guess Status Feedback (Only visible if status exists for current round) */}
            {guessFeedback.status && (
              <div
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs sm:text-sm font-bold transition animate-bounce ${
                  guessFeedback.status === 'correct'
                    ? 'bg-emerald-950 text-emerald-300 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : guessFeedback.status === 'close'
                    ? 'bg-amber-950 text-amber-300 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-rose-950 text-rose-300 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              >
                {guessFeedback.status === 'correct' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : guessFeedback.status === 'close' ? (
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-rose-400 shrink-0" />
                )}
                <span>
                  {guessFeedback.status === 'correct'
                    ? `🎉 Correct! (+${currentPlayer?.roundScore || 100} pts)`
                    : guessFeedback.message || 'Incorrect, keep guessing!'}
                </span>
              </div>
            )}
          </div>

          {/* Live Trainer Buzz-In Status with Authentic Pokémon Sprites */}
          <div className="flex flex-1 flex-col gap-2 rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
              Live Trainer Standings
            </span>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {playerList.map((player) => {
                const mascot = getMascot(player.avatar);
                const isCurrent = player.id === currentPlayerId;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-2xl p-2.5 border-2 transition ${
                      player.hasGuessed
                        ? 'border-emerald-500/50 bg-emerald-950/30'
                        : 'border-slate-800 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mascot.spriteUrl}
                        alt={mascot.name}
                        className="h-8 w-8 object-contain pokemon-sprite-icon"
                      />
                      <span className="font-bold text-sm text-white">{player.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-400 font-bold">(You)</span>
                      )}
                    </div>

                    <div>
                      {player.hasGuessed ? (
                        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Locked In ({player.guessTime}s)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 animate-spin" />
                          <span>Thinking...</span>
                        </span>
                      )}
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
