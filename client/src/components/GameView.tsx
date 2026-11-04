import React, { useState, useEffect, useRef } from 'react';
import type { Player, PokemonData } from '../types';
import { SilhouetteViewer } from './SilhouetteViewer';
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
  isAsciiMode: boolean;
  onToggleAsciiMode: () => void;
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
  guessFeedback,
  isAsciiMode,
  onToggleAsciiMode
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
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6">
      {/* Countdown Overlay (3, 2, 1) */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-slate-950/85 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-black uppercase tracking-widest text-amber-400 drop-shadow">
              ROUND {currentRound} STARTING IN
            </span>
            <span className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-ping">
              {timer}
            </span>
            <span className="text-sm font-semibold text-slate-400">Get your fingers ready!</span>
          </div>
        </div>
      )}

      {/* Round & Timer Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-900/90 p-4 sm:px-6 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white font-black shadow-md shadow-red-600/30">
            {currentRound}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Round</span>
            <h3 className="text-lg font-black text-white">Round {currentRound} of {totalRounds}</h3>
          </div>
        </div>

        {/* Timer Gauge */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Clock className={`h-5 w-5 ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">TIME REMAINING</span>
              <span className={`font-mono text-sm ${timer <= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                {timer}s
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timer <= 5 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Player Streak */}
        {currentPlayer && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-400/10 px-3.5 py-2 border border-amber-400/20">
            <Zap className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-amber-300 uppercase">Streak</span>
              <span className="font-mono text-xs font-black text-white">{currentPlayer.streak}x combo</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Center Pokédex Screen */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <SilhouetteViewer
            pokemon={pokemon}
            isRevealed={false}
            isAsciiMode={isAsciiMode}
            onToggleAsciiMode={onToggleAsciiMode}
            className="w-full"
          />
        </div>

        {/* Right Guessing Controls & Live Roster */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Guess Input Card */}
          <div className="flex flex-col gap-3 rounded-3xl bg-slate-900/90 p-5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Identify The Pokémon
              </span>
              <span className="text-xs text-slate-500 font-mono">Press Enter to lock in</span>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                disabled={currentPlayer?.hasGuessed || phase !== 'playing'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={currentPlayer?.hasGuessed ? 'Answer Locked In!' : "Type Pokémon name..."}
                autoComplete="off"
                spellCheck="false"
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white placeholder-slate-600 border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={currentPlayer?.hasGuessed || !inputVal.trim() || phase !== 'playing'}
                className="flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Guess Status Feedback Pill */}
            {guessFeedback.status && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold transition animate-bounce ${
                  guessFeedback.status === 'correct'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : guessFeedback.status === 'close'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {guessFeedback.status === 'correct' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : guessFeedback.status === 'close' ? (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                ) : (
                  <HelpCircle className="h-4 w-4 text-rose-400" />
                )}
                <span>
                  {guessFeedback.status === 'correct'
                    ? `🎉 Correct! (+${currentPlayer?.roundScore || 100} pts)`
                    : guessFeedback.message || 'Incorrect, keep guessing!'}
                </span>
              </div>
            )}
          </div>

          {/* Live Trainer Status (Who has guessed) */}
          <div className="flex flex-1 flex-col gap-2 rounded-3xl bg-slate-900/80 p-4 border border-slate-800 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Live Trainer Status
            </span>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {playerList.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl p-2.5 border transition ${
                    player.hasGuessed
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-white">{player.name}</span>
                    {player.id === currentPlayerId && (
                      <span className="text-[10px] text-slate-500">(You)</span>
                    )}
                  </div>

                  <div>
                    {player.hasGuessed ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Locked In ({player.guessTime}s)</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 animate-spin" />
                        <span>Thinking...</span>
                      </span>
                    )}
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
