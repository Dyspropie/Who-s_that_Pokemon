import React, { useState, useEffect, useRef } from 'react';
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
import { getMascot, MASCOTS } from './data/mascots';
import { Plus, Users, AlertCircle, Play } from 'lucide-react';

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

// LocalStorage Keys (just like jklm.fun)
const STORAGE_KEY_NAME = 'pokegame_trainer_name';
const STORAGE_KEY_AVATAR = 'pokegame_trainer_avatar';

export function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  // Load saved trainer name & avatar from localStorage, or sensible defaults
  const [trainerName, setTrainerNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_NAME) || 'Red';
  });
  const [avatar, setAvatarState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_AVATAR) || 'pikachu';
  });

  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Guess feedback state
  const [guessFeedback, setGuessFeedback] = useState<{
    status: 'correct' | 'close' | 'wrong' | 'already' | null;
    message?: string;
  }>({ status: null });

  const prevRoundRef = useRef<number>(0);
  const prevPhaseRef = useRef<string>('landing');

  // Custom setters that sync with localStorage (like jklm.fun)
  const setTrainerName = (name: string) => {
    setTrainerNameState(name);
    localStorage.setItem(STORAGE_KEY_NAME, name);
  };

  const setAvatar = (newAvatar: string) => {
    setAvatarState(newAvatar);
    localStorage.setItem(STORAGE_KEY_AVATAR, newAvatar);
  };

  // Check URL parameters for shareable invite link (e.g. ?room=PIKA)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('r');
    if (roomParam && roomParam.trim().length === 4) {
      setJoinCodeInput(roomParam.trim().toUpperCase());
    }
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Connected to game server at', SOCKET_SERVER_URL, 'Socket ID:', s.id);
    });

    s.on('room_state', (state: RoomState) => {
      // Clear previous guess feedback on new round
      if (
        state.currentRound !== prevRoundRef.current ||
        (state.phase === 'countdown' && prevPhaseRef.current !== 'countdown')
      ) {
        setGuessFeedback({ status: null });
        prevRoundRef.current = state.currentRound;
      }

      // Play original sound on countdown
      if (prevPhaseRef.current !== 'countdown' && state.phase === 'countdown') {
        sounds.playWhosThatPokemon();
      }

      // Trigger Pokémon cry on reveal
      if (prevPhaseRef.current !== 'revealed' && state.phase === 'revealed') {
        if (state.revealPokemon?.cryUrl) {
          sounds.playPokemonCry(state.revealPokemon.cryUrl);
        }
      }

      prevPhaseRef.current = state.phase;
      setRoomState(state);

      // Keep browser address bar in sync with room code for easy bookmarking
      if (state.code) {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get('room') !== state.code) {
          currentUrl.searchParams.set('room', state.code);
          window.history.replaceState({}, '', currentUrl.toString());
        }
      }
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

  const handleJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!socket || !joinCodeInput.trim()) return;
    setJoinError(null);
    socket.emit(
      'join_room',
      { code: joinCodeInput.trim().toUpperCase(), name: trainerName, avatar },
      (res: any) => {
        if (res.success) {
          setRoomState(res.room);
        } else {
          setJoinError(res.error || 'Room not found. Check code!');
        }
      }
    );
  };

  const handleSoloPractice = () => {
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
    setGuessFeedback({ status: null });
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
    setGuessFeedback({ status: null });
    socket.emit('play_again', { code: roomState.code });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  // Generate 1-click shareable invite link (e.g. https://domain.vercel.app/?room=PIKA)
  const getInviteUrl = (code?: string): string => {
    const currentCode = code || roomState?.code;
    if (!currentCode) return window.location.href;
    return `${window.location.origin}${window.location.pathname}?room=${currentCode}`;
  };

  const handleCopyInviteLink = () => {
    const url = getInviteUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentSocketId = socket?.id || '';
  const currentMascot = getMascot(avatar);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <Header
        roomCode={roomState?.code}
        playerCount={roomState ? Object.keys(roomState.players).length : 0}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        phase={roomState?.phase || 'landing'}
        onCopyInvite={handleCopyInviteLink}
        copiedLink={copiedLink}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4">
        {!roomState ? (
          /* Classic Pokémon Landing Screen */
          <div className="mx-auto flex w-full max-w-lg flex-col gap-5 p-3 sm:p-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-3xl bg-radial from-amber-400 via-amber-500 to-amber-600 p-2 shadow-[0_10px_25px_rgba(245,158,11,0.5)] border-4 border-slate-200">
                <img
                  src={currentMascot.spriteUrl}
                  alt={currentMascot.name}
                  className="h-20 w-20 object-contain pokemon-sprite-icon"
                />
              </div>

              <h2 className="pokemon-title-text text-3xl sm:text-4xl font-black uppercase tracking-wider drop-shadow-lg">
                Who's That Pokémon?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium">
                Live multiplayer battle arena! Guess Pokémon from silhouettes and climb the leaderboard.
              </p>
            </div>

            {/* Trainer Profile Card (Persists in localStorage like jklm.fun) */}
            <div className="flex flex-col gap-3 rounded-3xl border-2 border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Trainer Nickname
                </label>
                <span className="text-[10px] text-slate-400 font-mono">SAVED AUTOMATICALLY</span>
              </div>
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                maxLength={15}
                placeholder="Enter Trainer Nickname"
                className="rounded-2xl bg-slate-950 px-4 py-3.5 text-base font-bold text-white border-2 border-slate-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />

              {/* Starter Companion Mascot Selector */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Starter Companion</span>
                  <span className="text-amber-300 font-bold">{currentMascot.name}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {MASCOTS.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAvatar(m.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl p-1.5 border-2 transition cursor-pointer ${
                        avatar === m.id
                          ? 'border-amber-400 bg-amber-400/20 shadow-md scale-105'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={m.spriteUrl}
                        alt={m.name}
                        className="h-10 w-10 object-contain pokemon-sprite-icon"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Actions: Host vs Join */}
            <div className="flex flex-col gap-3.5">
              <button
                onClick={handleCreateRoom}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-red-600/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Host Multiplayer Battle</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {joinCodeInput ? 'INVITE CODE DETECTED' : 'OR ENTER ROOM CODE'}
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="4-LETTER CODE"
                  className={`flex-1 rounded-2xl bg-slate-900 px-4 py-3.5 text-center text-lg font-mono font-black uppercase tracking-widest text-amber-400 placeholder-slate-600 border-2 focus:outline-none ${
                    joinCodeInput.length === 4
                      ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                      : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3.5 font-black uppercase tracking-wider text-slate-950 hover:brightness-110 active:scale-95 transition disabled:opacity-40 cursor-pointer shadow-md"
                >
                  <Users className="h-5 w-5" />
                  <span>Join</span>
                </button>
              </form>

              {joinError && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-950 p-3 text-xs font-bold text-rose-300 border-2 border-rose-500">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <button
                onClick={handleSoloPractice}
                className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-amber-400 transition py-1 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Instant Solo Practice Mode</span>
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
            onCopyInvite={handleCopyInviteLink}
            copiedLink={copiedLink}
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

      {/* Real-time Trainer Chat Drawer */}
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
