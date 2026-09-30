# Real-time Chat App

Express and Socket.io chat with live rooms, room member lists, message notifications, and a responsive browser interface.

## Run

From `Week 7/Day 3`:

```powershell
npm install
npm start
```

Open `http://localhost:3001`. Set the `PORT` environment variable to use a different port. The `/health` endpoint returns a small server status check.

## Use

Choose a username and room, then join. Usernames are unique per room. Use **Leave room** to return to the join screen. Messages appear live for everyone in the same room; browser notifications can be enabled from the top bar, and unread messages are counted when the tab is in the background.

## Test

```powershell
npm test
```

The Socket.io integration test checks joining, active-user updates, live message delivery, leaving, and membership validation.