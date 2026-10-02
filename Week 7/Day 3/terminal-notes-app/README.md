# Terminal Notes App

A small Node.js command-line app that stores notes in `notes.json`.

## Run

From this folder:

```powershell
npm install
node app add --title="Note Title" --body="Note body"
node app list
node app read --title="Note Title"
node app remove --title="Note Title"
```

You can also run the selected Day 3 starter with the same commands, for example `node "mini project notes app.js" add --title="Note Title" --body="Note body"`.

Titles are unique regardless of capitalization. `notes.json` is initialized empty. Run `npm test` to check the file operations.