require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const games = {}; // In-memory game store

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

const createEmptyBoard = () => Array(9).fill('');

app.post('/join/:gameId', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    games[gameId] = {
      board: createEmptyBoard(),
      currentTurn: 'X',
      players: ['X']
    };
    return res.json({ player: 'X', board: games[gameId].board });
  } else if (games[gameId].players.length === 1) {
    games[gameId].players.push('O');
    return res.json({ player: 'O', board: games[gameId].board });
  } else {
    return res.status(400).json({ error: 'Game is full' });
  }
});

app.post('/move/:gameId', (req, res) => {
  const { gameId } = req.params;
  const { player, index } = req.body;
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.players.indexOf(player) === -1) return res.status(403).json({ error: 'You are not in this game' });
  if (game.board[index] !== '') return res.status(400).json({ error: 'Cell already taken' });
  if (game.currentTurn !== player) return res.status(400).json({ error: 'Not your turn' });

  game.board[index] = player;
  game.currentTurn = player === 'X' ? 'O' : 'X';

  const winner = checkWinner(game.board);
  let message = '';
  if (winner) {
    message = `${winner} wins!`;
    delete games[gameId];
  }

  res.json({ board: game.board, message });
});

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

app.get('/', (req, res) => res.send('Tic Tac Toe Server Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
