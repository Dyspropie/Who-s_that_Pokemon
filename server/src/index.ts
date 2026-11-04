import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './game/GameManager.js';
import { getRandomPokemon } from './data/pokemon.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Who is That Pokemon Server' });
});

// Single player / testing random pokemon endpoint
app.get('/api/pokemon/random', async (req, res) => {
  try {
    const difficulty = (req.query.difficulty as any) || 'easy';
    const pokemon = await getRandomPokemon(difficulty);
    res.json(pokemon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time Socket.io listeners
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create a room
  socket.on('create_room', ({ name, avatar }, callback) => {
    try {
      const room = gameManager.createRoom(socket.id, name, avatar);
      socket.join(room.code);
      if (typeof callback === 'function') {
        callback({ success: true, room });
      }
    } catch (e: any) {
      if (typeof callback === 'function') callback({ success: false, error: e.message });
    }
  });

  // Join existing room
  socket.on('join_room', ({ code, name, avatar }, callback) => {
    try {
      const room = gameManager.joinRoom(code, socket.id, name, avatar);
      if (room) {
        socket.join(room.code);
        if (typeof callback === 'function') {
          callback({ success: true, room });
        }
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room not found. Check your 4-letter code!' });
        }
      }
    } catch (e: any) {
      if (typeof callback === 'function') callback({ success: false, error: e.message });
    }
  });

  // Host updates room settings
  socket.on('update_settings', ({ code, settings }) => {
    gameManager.updateSettings(code, socket.id, settings);
  });

  // Toggle ready status
  socket.on('toggle_ready', ({ code }) => {
    gameManager.toggleReady(code, socket.id);
  });

  // Start game
  socket.on('start_game', async ({ code }) => {
    await gameManager.startGame(code, socket.id);
  });

  // Submit guess
  socket.on('submit_guess', ({ code, guess }, callback) => {
    const result = gameManager.submitGuess(code, socket.id, guess);
    if (typeof callback === 'function') {
      callback(result);
    }
  });

  // Send chat or reaction
  socket.on('send_chat', ({ code, text, emoji }) => {
    gameManager.sendChat(code, socket.id, text, emoji);
  });

  // Host resets back to lobby after game over
  socket.on('play_again', ({ code }) => {
    gameManager.resetToLobby(code, socket.id);
  });

  // Disconnection
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    gameManager.leaveRoom(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚡ Who's That Pokémon server running on http://localhost:${PORT}`);
});
