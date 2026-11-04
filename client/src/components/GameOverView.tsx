import React, { useEffect } from 'react';
import type { Player, RoundResult } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw } from 'lucide-react';

interface GameOverViewProps {
  players: Record<string, Player>;
  currentPlayerId: string;
  roundHistory: RoundResult[];
  isHost: boolean;
  onPlayAgain: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  players,
  currentPlayerId,
  isHost,
  onPlayAgain
}) => {
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 p-4 sm:p-6 animate-fadeIn">
      {/* Champion Banner */}
      <div className="flex w-full flex-col items-center justify-center rounded-3xl bg-slate-900/90 p-8 border-2 border-amber-400 shadow-2xl backdrop-blur-md text-center">
        <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/30">
          <Crown className="h-10 w-10 fill-current animate-bounce" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          Pokémon League Champion
        </span>
        <h2 className="mt-1 text-4xl font-black text-white sm:text-5xl">
          {winner ? winner.name : 'Unknown Trainer'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Finished with an impressive <span className="font-mono font-bold text-amber-300">{winner?.score}</span> points!
        </p>

        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-red-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Play Again (Return to Lobby)</span>
          </button>
        ) : (
          <p className="mt-6 text-xs text-slate-500 italic">
            Waiting for host to start a new match...
          </p>
        )}
      </div>

      {/* Podium & Final Leaderboard */}
      <div className="w-full rounded-3xl bg-slate-900/80 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-4">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Final Tournament Leaderboard</span>
        </div>

        <div className="flex flex-col gap-3">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-2xl p-4 border transition ${
                idx === 0
                  ? 'border-amber-400/60 bg-amber-400/10 shadow-md'
                  : idx === 1
                  ? 'border-slate-400/40 bg-slate-400/5'
                  : idx === 2
                  ? 'border-amber-700/40 bg-amber-700/5'
                  : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-black text-white">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <div>
                  <span className="font-bold text-base text-white">{player.name}</span>
                  {player.id === currentPlayerId && (
                    <span className="ml-2 text-xs text-amber-400 font-bold">(You)</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-lg font-black text-white">{player.score}</span>
                <span className="text-xs text-slate-500 uppercase ml-1">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
