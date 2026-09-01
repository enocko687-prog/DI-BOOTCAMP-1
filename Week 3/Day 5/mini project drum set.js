const drumKeys = {
  a: 'boom',
  s: 'clap',
  d: 'hihat',
  f: 'kick',
  g: 'openhat',
  h: 'ride',
  j: 'snare',
  k: 'tink',
  l: 'tom'
};

const sounds = {
  boom: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/boom.wav',
  clap: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/clap.wav',
  hihat: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/hihat.wav',
  kick: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/kick.wav',
  openhat: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/openhat.wav',
  ride: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/ride.wav',
  snare: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/snare.wav',
  tink: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/tink.wav',
  tom: 'https://raw.githubusercontent.com/devtlv/drumset_setup/master/sounds/tom.wav'
};

const drumPad = document.createElement('div');
drumPad.className = 'drum-pad';

document.body.appendChild(drumPad);

const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #111;
    font-family: Arial, sans-serif;
  }

  .drum-pad {
    display: grid;
    grid-template-columns: repeat(3, 120px);
    gap: 20px;
    padding: 30px;
    background: #222;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  }

  .key {
    width: 120px;
    height: 120px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg, #505050, #2d2d2d);
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.08s ease, box-shadow 0.08s ease;
    box-shadow: inset 0 0 0 3px rgba(255,255,255,0.08);
  }

  .key.active {
    transform: scale(0.96);
    box-shadow: 0 0 18px rgba(255,255,255,0.5);
    background: linear-gradient(135deg, #ffbf69, #ff8c42);
  }
`;
document.head.appendChild(style);

function playSound(keyName) {
  const soundUrl = sounds[keyName];
  if (!soundUrl) return;

  const audio = new Audio(soundUrl);
  audio.currentTime = 0;
  audio.play();
}

function triggerKey(keyName) {
  const button = document.querySelector(`button[data-key="${keyName}"]`);
  if (!button) return;

  button.classList.add('active');
  setTimeout(() => button.classList.remove('active'), 120);

  playSound(keyName);
}

Object.entries(drumKeys).forEach(([key, soundName]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'key';
  button.dataset.key = soundName;
  button.textContent = key.toUpperCase();
  button.addEventListener('click', () => triggerKey(soundName));
  drumPad.appendChild(button);
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (drumKeys[key]) {
    triggerKey(drumKeys[key]);
  }
});
