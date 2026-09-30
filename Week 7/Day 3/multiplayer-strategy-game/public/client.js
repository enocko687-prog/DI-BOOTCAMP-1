const authView = document.querySelector('#auth-view');
const lobbyView = document.querySelector('#lobby-view');
const gameView = document.querySelector('#game-view');
const authForm = document.querySelector('#auth-form');
const gameBoard = document.querySelector('#game-board');
const authError = document.querySelector('#auth-error');
const lobbyError = document.querySelector('#lobby-error');
const gameError = document.querySelector('#game-error');

let authMode = 'login';
let token = '';
let currentUser = null;
let activeGame = null;
let pollTimer = null;
let lastAnnouncedStatus = '';

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

function setAuthMode(mode) {
  authMode = mode;
  const register = mode === 'register';
  document.querySelector('#login-tab').classList.toggle('is-active', !register);
  document.querySelector('#login-tab').setAttribute('aria-selected', String(!register));
  document.querySelector('#register-tab').classList.toggle('is-active', register);
  document.querySelector('#register-tab').setAttribute('aria-selected', String(register));
  document.querySelector('#auth-eyebrow').textContent = register ? 'NEW COMMANDER' : 'COMMANDER ACCESS';
  document.querySelector('#auth-title').textContent = register ? 'Claim your callsign' : 'Welcome back';
  document.querySelector('#auth-copy').textContent = register ? 'Create an account to enter the field.' : 'Sign in to return to the field.';
  document.querySelector('#auth-submit').innerHTML = register ? 'Create account <span aria-hidden="true">↗</span>' : 'Sign in <span aria-hidden="true">↗</span>';
  document.querySelector('#password-input').autocomplete = register ? 'new-password' : 'current-password';
  authError.textContent = '';
}

function showView(view) {
  authView.hidden = view !== 'auth';
  lobbyView.hidden = view !== 'lobby';
  gameView.hidden = view !== 'game';
}

async function enterLobby() {
  document.querySelector('#account-label').hidden = false;
  document.querySelector('#account-label').textContent = currentUser.username;
  showView('lobby');
  await loadGames();
}

function createGameRow(game) {
  const row = document.createElement('div');
  row.className = 'game-row';
  const info = document.createElement('div');
  info.className = 'game-row-info';
  const owner = document.createElement('strong');
  owner.textContent = `${game.createdBy}'s match`;
  const id = document.createElement('span');
  id.textContent = `FIELD ${game.id.slice(0, 8).toUpperCase()}`;
  info.append(owner, id);
  const join = document.createElement('button');
  join.className = 'button';
  join.type = 'button';
  join.textContent = 'Join field';
  join.addEventListener('click', () => joinGame(game.id));
  row.append(info, join);
  return row;
}

async function loadGames() {
  lobbyError.textContent = '';
  try {
    const { games } = await api('/api/games');
    const list = document.querySelector('#game-list');
    list.replaceChildren(...games.map(createGameRow));
    document.querySelector('#lobby-empty').hidden = games.length > 0;
  } catch (error) {
    lobbyError.textContent = error.message;
  }
}

function playerForColor(game, color) {
  return game.players.find((player) => player.color === color);
}

function createCell(x, y, game, me, rival, legalCells) {
  const cell = document.createElement('div');
  cell.className = 'grid-cell';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('aria-label', `Row ${y + 1}, column ${x + 1}`);
  const point = { x, y };
  const isObstacle = game.obstacles.some((obstacle) => obstacle.x === x && obstacle.y === y);
  const isMyBase = me.base.x === x && me.base.y === y;
  const isRivalBase = rival && rival.base.x === x && rival.base.y === y;
  if (isObstacle) {
    cell.classList.add('is-obstacle');
    cell.title = 'Barrier';
  }
  if (isMyBase) cell.classList.add(`is-base-${me.color}`);
  if (isRivalBase) cell.classList.add(`is-base-${rival.color}`);
  if (legalCells.some((legal) => legal.x === x && legal.y === y)) cell.classList.add('is-legal');

  for (const player of game.players) {
    if (player.position.x === x && player.position.y === y) {
      const unit = document.createElement('span');
      unit.className = `unit unit-${player.color}`;
      unit.textContent = player.username.slice(0, 1).toUpperCase();
      unit.title = `${player.username}${player.userId === currentUser.id ? ' (you)' : ''}`;
      cell.append(unit);
    }
  }
  if (isMyBase) cell.title = `${me.username}'s base`;
  if (isRivalBase) cell.title = `${rival.username}'s base`;
  return cell;
}

function renderGame(game) {
  const boardChanged = !activeGame || activeGame.updatedAt !== game.updatedAt;
  activeGame = game;
  const me = game.players.find((player) => player.userId === currentUser.id);
  const rival = game.players.find((player) => player.userId !== currentUser.id);
  if (!me) {
    stopPolling();
    showView('lobby');
    lobbyError.textContent = 'You are not a player in that match.';
    return;
  }

  const isActive = game.status === 'active';
  const myTurn = isActive && game.turnUserId === currentUser.id;
  const finished = game.status === 'finished';
  const legalCells = [];
  if (myTurn && rival) {
    for (const direction of Object.values({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] })) {
      const [dx, dy] = direction;
      const x = me.position.x + dx;
      const y = me.position.y + dy;
      if (x < 0 || x >= 10 || y < 0 || y >= 10) continue;
      const blocked = game.obstacles.some((cell) => cell.x === x && cell.y === y);
      const occupied = rival.position.x === x && rival.position.y === y;
      if (!blocked && (!occupied || (rival.base.x === x && rival.base.y === y))) legalCells.push({ x, y });
    }
  }

  if (boardChanged) {
    gameBoard.replaceChildren();
    for (let y = 0; y < 10; y += 1) {
      for (let x = 0; x < 10; x += 1) gameBoard.append(createCell(x, y, game, me, rival, legalCells));
    }
  }

  const coral = playerForColor(game, 'coral');
  const teal = playerForColor(game, 'turquoise');
  document.querySelector('#coral-player').textContent = coral?.username || 'Waiting for player';
  document.querySelector('#teal-player').textContent = teal?.username || 'Waiting for player';
  document.querySelector('#coral-turn').parentElement.classList.toggle('is-active', game.turnUserId === coral?.userId);
  document.querySelector('#teal-turn').parentElement.classList.toggle('is-active', game.turnUserId === teal?.userId);
  document.querySelector('#move-count').textContent = `${String(game.moves).padStart(2, '0')} MOVES`;
  document.querySelector('#game-id-label').textContent = `FIELD ${game.id.toUpperCase()}`;

  const status = document.querySelector('#game-status');
  status.textContent = finished ? 'Match complete' : isActive ? (myTurn ? 'Your turn' : 'Rival turn') : 'Waiting for player';
  status.classList.toggle('is-your-turn', myTurn);
  document.querySelector('#turn-title').textContent = finished ? 'Field secured' : myTurn ? 'Make your move' : isActive ? `${rival.username}'s move` : 'Waiting for a rival';
  document.querySelector('#turn-copy').textContent = finished
    ? (game.winnerUserId === currentUser.id ? 'You captured the opposing base.' : `${game.winnerName} captured your base.`)
    : myTurn ? 'Move one square. Attack when you stand next to the rival base.' : isActive ? 'The board will update when the rival makes a move.' : 'Share the match ID with another player to begin.';

  document.querySelectorAll('.direction-button').forEach((button) => { button.disabled = !myTurn; });
  const nextToBase = rival && Math.abs(me.position.x - rival.base.x) + Math.abs(me.position.y - rival.base.y) === 1;
  document.querySelector('#attack-button').disabled = !myTurn || !nextToBase;
  document.querySelector('#winner-banner').hidden = !finished;
  document.querySelector('#winner-banner').textContent = finished ? `${game.winnerName} captured the base.` : '';
  const announcement = finished ? `finished:${game.winnerUserId}` : isActive ? 'active' : 'waiting';
  if (announcement !== lastAnnouncedStatus && game.lastMove?.action === 'captured the base') {
    gameError.textContent = '';
  }
  lastAnnouncedStatus = announcement;
}

async function openGame(gameId) {
  gameError.textContent = '';
  try {
    const { game } = await api(`/api/games/${gameId}`);
    showView('game');
    renderGame(game);
    startPolling(gameId);
  } catch (error) {
    lobbyError.textContent = error.message;
  }
}

async function joinGame(gameId) {
  try {
    const { game } = await api(`/api/games/${gameId}/join`, { method: 'POST' });
    showView('game');
    renderGame(game);
    startPolling(gameId);
  } catch (error) {
    lobbyError.textContent = error.message;
    await loadGames();
  }
}

async function createGame() {
  lobbyError.textContent = '';
  try {
    const { game } = await api('/api/games', { method: 'POST' });
    await loadGames();
    await openGame(game.id);
  } catch (error) {
    lobbyError.textContent = error.message;
  }
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

function startPolling(gameId) {
  stopPolling();
  pollTimer = setInterval(async () => {
    try {
      const { game } = await api(`/api/games/${gameId}`);
      if (!gameView.hidden) renderGame(game);
      if (game.status === 'finished') stopPolling();
    } catch (error) {
      gameError.textContent = error.message;
      stopPolling();
    }
  }, 1500);
}

async function makeMove(direction) {
  if (!activeGame || gameView.hidden) return;
  gameError.textContent = '';
  try {
    const { game } = await api(`/api/games/${activeGame.id}/move`, {
      method: 'POST',
      body: JSON.stringify({ direction }),
    });
    renderGame(game);
  } catch (error) {
    gameError.textContent = error.message;
    await openGame(activeGame.id);
  }
}

document.querySelector('#login-tab').addEventListener('click', () => setAuthMode('login'));
document.querySelector('#register-tab').addEventListener('click', () => setAuthMode('register'));
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.textContent = '';
  const username = document.querySelector('#username-input').value.trim();
  const password = document.querySelector('#password-input').value;
  try {
    const result = await api(`/api/auth/${authMode === 'register' ? 'register' : 'login'}`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    token = result.token;
    currentUser = result.user;
    await enterLobby();
  } catch (error) {
    authError.textContent = error.message;
  }
});

document.querySelector('#create-game').addEventListener('click', createGame);
document.querySelector('#refresh-games').addEventListener('click', loadGames);
document.querySelector('#back-to-lobby').addEventListener('click', () => {
  stopPolling();
  showView('lobby');
  loadGames();
});
document.querySelectorAll('.direction-button').forEach((button) => {
  button.addEventListener('click', () => makeMove(button.dataset.direction));
});
document.querySelector('#attack-button').addEventListener('click', async () => {
  if (!activeGame) return;
  gameError.textContent = '';
  try {
    const { game } = await api(`/api/games/${activeGame.id}/attack`, { method: 'POST' });
    renderGame(game);
    stopPolling();
  } catch (error) {
    gameError.textContent = error.message;
  }
});
document.addEventListener('keydown', (event) => {
  if (gameView.hidden || event.target instanceof HTMLInputElement) return;
  const direction = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }[event.key];
  if (direction) {
    event.preventDefault();
    makeMove(direction);
  }
});
window.addEventListener('beforeunload', stopPolling);