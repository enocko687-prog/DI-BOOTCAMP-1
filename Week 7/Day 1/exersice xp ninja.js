const express = require('express');
const app = express();
const router = express.Router();

const PORT = 3000;
const emojis = ['😀', '🎉', '🌟', '🎈', '👋'];

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

router.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Emoji Greeting App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #fef3c7, #dbeafe);
        }
        .card {
          background: white;
          width: 420px;
          padding: 30px;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        label, input, select, button {
          display: block;
          width: 100%;
          margin-top: 12px;
        }
        input, select, button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 16px;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Emoji Greeting App</h1>
        <form action="/greet" method="POST">
          <label for="name">Your name:</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" required />

          <label for="emoji">Choose an emoji:</label>
          <select id="emoji" name="emoji">
            ${emojis.map((emoji) => `<option value="${emoji}">${emoji}</option>`).join('')}
          </select>

          <button type="submit">Greet Me</button>
        </form>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

router.post('/greet', (req, res) => {
  const { name, emoji } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).send('Please enter your name.');
  }

  const selectedEmoji = emojis.includes(emoji) ? emoji : '😀';
  const greeting = `Hello ${name}! ${selectedEmoji} Welcome to our app!`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Greeting Result</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #dcfce7, #dbeafe);
        }
        .card {
          background: white;
          padding: 30px 40px;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          text-align: center;
        }
        h2 {
          font-size: 32px;
          margin-bottom: 20px;
        }
        a {
          display: inline-block;
          margin-top: 16px;
          color: #2563eb;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>${greeting}</h2>
        <a href="/">Try another greeting</a>
      </div>
    </body>
    </html>
  `;

  return res.send(html);
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Emoji Greeting App running on http://localhost:${PORT}`);
});
