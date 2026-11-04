import React, { useEffect } from 'react';
import type { Player, RoundResult } from '../types';
import { getMascot } from '../data/mascots';
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
  const winnerMascot = winner ? getMascot(winner.avatar) : null;

  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 3 * 1000;
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
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
      <div className="relative overflow-hidden w-full flex flex-col items-center justify-center rounded-3xl border-4 border-amber-400 bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 p-6 sm:p-10 shadow-2xl text-center backdrop-blur-md">
        <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-xl shadow-amber-400/40">
          <Crown className="h-12 w-12 fill-current animate-bounce" />
        </div>

        {winnerMascot && (
          <div className="my-2">
            <img
              src={winnerMascot.spriteUrl}
              alt={winnerMascot.name}
              className="h-20 w-20 object-contain pokemon-sprite-icon mx-auto"
            />
          </div>
        )}

        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          Pokémon League Champion
        </span>
        <h2 className="pokemon-title-text mt-1 text-3xl sm:text-5xl font-black uppercase tracking-wider">
          {winner ? winner.name : 'Unknown Trainer'}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Victory achieved with an outstanding score of <span className="font-mono font-black text-amber-300">{winner?.score}</span> points!
        </p>

        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 px-8 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Play Again (Return to Lobby)</span>
          </button>
        ) : (
          <p className="mt-6 text-xs text-slate-400 italic">
            Waiting for room host to initiate a rematch...
          </p>
        )}
      </div>

      {/* Tournament Final Leaderboard */}
      <div className="w-full rounded-3xl border-2 border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-black text-slate-200 uppercase tracking-wider mb-4">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Final Tournament Leaderboard</span>
        </div>

        <div className="flex flex-col gap-3">
          {sortedPlayers.map((player, idx) => {
            const mascot = getMascot(player.avatar);
            const isCurrent = player.id === currentPlayerId;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-2xl p-4 border-2 transition ${
                  idx === 0
                    ? 'border-amber-400 bg-amber-400/10 shadow-md'
                    : idx === 1
                    ? 'border-slate-400/50 bg-slate-400/5'
                    : idx === 2
                    ? 'border-amber-700/50 bg-amber-700/5'
                    : 'border-slate-800 bg-slate-950/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-black text-white">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <img
                    src={mascot.spriteUrl}
                    alt={mascot.name}
                    className="h-10 w-10 object-contain pokemon-sprite-icon"
                  />
                  <div>
                    <span className="font-black text-base text-white">{player.name}</span>
                    {isCurrent && (
                      <span className="ml-2 text-xs text-amber-400 font-bold">(You)</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-black text-white">{player.score}</span>
                  <span className="text-xs text-slate-500 uppercase ml-1">PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
