import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { RoomState, RoomSettings } from './types';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { GameView } from './components/GameView';
import { RevealView } from './components/RevealView';
import { GameOverView } from './components/GameOverView';
import { ChatDrawer } from './components/ChatDrawer';
import { sounds } from './utils/sounds';
import { Plus, Users, Sparkles, AlertCircle } from 'lucide-react';

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin
);

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [trainerName, setTrainerName] = useState<string>('Red');
  const [avatar, setAvatar] = useState<string>('pikachu');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Settings
  const [isAsciiMode, setIsAsciiMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Guess feedback state
  const [guessFeedback, setGuessFeedback] = useState<{
    status: 'correct' | 'close' | 'wrong' | 'already' | null;
    message?: string;
  }>({ status: null });

  // Initialize Socket.io connection
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Connected to game server. Socket ID:', s.id);
    });

    s.on('room_state', (state: RoomState) => {
      setRoomState((prevState) => {
        // If phase transitioned to revealed, trigger Pokémon cry
        if (prevState?.phase !== 'revealed' && state.phase === 'revealed') {
          if (state.revealPokemon?.cryUrl) {
            sounds.playPokemonCry(state.revealPokemon.cryUrl);
          }
        }
        return state;
      });
    });

    s.on('timer_tick', ({ timer, phase }: { timer: number; phase: string }) => {
      setRoomState((prev) => (prev ? { ...prev, timer, phase: phase as any } : null));
      if (phase === 'countdown' || (phase === 'playing' && timer <= 5 && timer > 0)) {
        sounds.playTick();
      }
    });

    s.on('player_guessed', ({ playerId }: { playerId: string }) => {
      if (playerId === s.id) {
        sounds.playCorrect();
      }
    });

    s.on('chat_message', (msg) => {
      setRoomState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          chatMessages: [...prev.chatMessages, msg].slice(-50)
        };
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socket) return;
    setJoinError(null);
    socket.emit('create_room', { name: trainerName, avatar }, (res: any) => {
      if (res.success) {
        setRoomState(res.room);
      } else {
        setJoinError(res.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !joinCodeInput.trim()) return;
    setJoinError(null);
    socket.emit(
      'join_room',
      { code: joinCodeInput.trim().toUpperCase(), name: trainerName, avatar },
      (res: any) => {
        if (res.success) {
          setRoomState(res.room);
        } else {
          setJoinError(res.error || 'Room not found');
        }
      }
    );
  };

  const handleSoloPractice = () => {
    // Solo practice creates a room with just the player
    handleCreateRoom();
  };

  const handleUpdateSettings = (settings: Partial<RoomSettings>) => {
    if (!socket || !roomState) return;
    socket.emit('update_settings', { code: roomState.code, settings });
  };

  const handleToggleReady = () => {
    if (!socket || !roomState) return;
    socket.emit('toggle_ready', { code: roomState.code });
  };

  const handleStartGame = () => {
    if (!socket || !roomState) return;
    socket.emit('start_game', { code: roomState.code });
  };

  const handleSubmitGuess = (guess: string) => {
    if (!socket || !roomState) return;
    socket.emit('submit_guess', { code: roomState.code, guess }, (res: any) => {
      if (res.status === 'correct') {
        setGuessFeedback({ status: 'correct', message: `Correct! (+${res.points} pts)` });
      } else if (res.status === 'close') {
        sounds.playWrong();
        setGuessFeedback({ status: 'close', message: res.message });
      } else if (res.status === 'already') {
        setGuessFeedback({ status: 'already', message: res.message });
      } else {
        sounds.playWrong();
        setGuessFeedback({ status: 'wrong', message: res.message || 'Incorrect' });
      }
    });
  };

  const handleSendMessage = (text?: string, emoji?: string) => {
    if (!socket || !roomState) return;
    socket.emit('send_chat', { code: roomState.code, text, emoji });
  };

  const handlePlayAgain = () => {
    if (!socket || !roomState) return;
    socket.emit('play_again', { code: roomState.code });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const currentSocketId = socket?.id || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        roomCode={roomState?.code}
        playerCount={roomState ? Object.keys(roomState.players).length : 0}
        isAsciiMode={isAsciiMode}
        onToggleAsciiMode={() => setIsAsciiMode(!isAsciiMode)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        phase={roomState?.phase || 'landing'}
      />

      <main className="flex-1 flex flex-col items-center justify-center py-4">
        {!roomState ? (
          /* Landing Screen (Join or Create Room) */
          <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-600 shadow-xl shadow-red-600/40 animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Ready to Battle?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Guess the Pokémon from their silhouettes or retro ASCII prints in live multiplayer!
              </p>
            </div>

            {/* Trainer Name Input */}
            <div className="flex flex-col gap-2 rounded-3xl bg-slate-900/90 p-5 border border-slate-800 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enter Your Trainer Nickname
              </label>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                maxLength={15}
                placeholder="Trainer Name"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-base font-bold text-white border border-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Action Buttons: Host vs Join */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleCreateRoom}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-red-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 transition cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Host New Multiplayer Room</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-bold text-slate-500 uppercase">OR JOIN WITH CODE</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="ROOM CODE"
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-center text-lg font-mono font-black uppercase tracking-widest text-amber-400 placeholder-slate-600 border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-slate-800 px-6 py-3 font-bold text-white hover:bg-slate-700 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  <span>Join</span>
                </button>
              </form>

              {joinError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-950/80 p-3 text-xs font-bold text-rose-300 border border-rose-500/40">
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <span>{joinError}</span>
                </div>
              )}

              <button
                onClick={handleSoloPractice}
                className="mt-2 text-xs font-bold text-slate-500 hover:text-amber-400 transition cursor-pointer"
              >
                🎮 Solo Practice Mode (Instant Play)
              </button>
            </div>
          </div>
        ) : roomState.phase === 'lobby' ? (
          <LobbyView
            roomCode={roomState.code}
            players={roomState.players}
            currentPlayerId={currentSocketId}
            settings={roomState.settings}
            isHost={roomState.players[currentSocketId]?.isHost || false}
            onUpdateSettings={handleUpdateSettings}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            trainerName={trainerName}
            setTrainerName={setTrainerName}
            avatar={avatar}
            setAvatar={setAvatar}
          />
        ) : roomState.phase === 'countdown' || roomState.phase === 'playing' ? (
          <GameView
            currentRound={roomState.currentRound}
            totalRounds={roomState.totalRounds}
            timer={roomState.timer}
            roundDuration={roomState.settings.roundDuration}
            phase={roomState.phase}
            pokemon={roomState.currentPokemon}
            players={roomState.players}
            currentPlayerId={currentSocketId}
            onSubmitGuess={handleSubmitGuess}
            guessFeedback={guessFeedback}
            isAsciiMode={isAsciiMode}
            onToggleAsciiMode={() => setIsAsciiMode(!isAsciiMode)}
          />
        ) : roomState.phase === 'revealed' ? (
          <RevealView
            pokemon={roomState.revealPokemon}
            players={roomState.players}
            currentPlayerId={currentSocketId}
            nextTimer={roomState.timer}
            currentRound={roomState.currentRound}
            totalRounds={roomState.totalRounds}
          />
        ) : roomState.phase === 'gameover' ? (
          <GameOverView
            players={roomState.players}
            currentPlayerId={currentSocketId}
            roundHistory={roomState.roundHistory}
            isHost={roomState.players[currentSocketId]?.isHost || false}
            onPlayAgain={handlePlayAgain}
          />
        ) : null}
      </main>

      {/* Floating Room Chat & Reaction Drawer */}
      {roomState && (
        <ChatDrawer
          messages={roomState.chatMessages}
          onSendMessage={handleSendMessage}
          currentPlayerId={currentSocketId}
        />
      )}
    </div>
  );
}

export default App;
