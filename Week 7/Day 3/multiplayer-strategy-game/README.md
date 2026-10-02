# Gridbound

A two-player, turn-based base-capture game on a 10 × 10 grid. Express provides the REST API; the browser client polls the game state so moves appear for both players without a page refresh.

## Run

From this folder:

```powershell
npm install
npm start
```

Open `http://localhost:3002`. Alternatively, from `Week 7/Day 3`, run `node "mini project multiplayer strategy.js"`. Set the `PORT` environment variable to choose another port.

## Play

Create an account or sign in, then create a match. A second player should register or sign in in another browser, refresh the open matches, and join. The match ID is also shown in the game toolbar. Players take turns moving one orthogonal square. Barriers block movement; move beside the rival base and use **Attack the base**, or move directly onto the base if it is unoccupied. Coral takes the first turn.

The accounts, sessions, and matches are held in memory for this exercise and reset when the server restarts. Passwords are hashed with Node's built-in `scrypt`.

## API

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/games` lists waiting matches for the signed-in player
- `POST /api/games` starts a match
- `POST /api/games/:id/join` joins a waiting match
- `GET /api/games/:id` reads a match
- `POST /api/games/:id/move` takes a directional turn (`up`, `down`, `left`, `right`)
- `POST /api/games/:id/attack` captures an adjacent rival base
- `GET /api/health` checks server status

Game routes require `Authorization: Bearer <token>`. User registration and login return the token.

## Test

```powershell
npm test
```