const socket = io();
const joinView = document.querySelector('#join-view');
const chatView = document.querySelector('#chat-view');
const joinForm = document.querySelector('#join-form');
const joinError = document.querySelector('#join-error');
const usernameInput = document.querySelector('#username');
const roomInput = document.querySelector('#room');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const messageList = document.querySelector('#message-list');
const memberList = document.querySelector('#member-list');
const connectionState = document.querySelector('#connection-state');
const roomPresence = document.querySelector('#room-presence');
const notificationToggle = document.querySelector('#notification-toggle');
const unreadCount = document.querySelector('#unread-count');
const toast = document.querySelector('#toast');

let currentUser = '';
let currentRoom = '';
let notificationsEnabled = false;
let unreadMessages = 0;
let toastTimer;

function setConnectionState(connected) {
  connectionState.classList.toggle('is-connected', connected);
  connectionState.lastChild.textContent = connected ? 'Connected' : 'Reconnecting';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function resetUnread() {
  unreadMessages = 0;
  unreadCount.hidden = true;
  unreadCount.textContent = '0';
  document.title = 'Commonroom | Live chat';
}

function addNotice(text, timestamp) {
  const item = document.createElement('li');
  item.className = 'room-notice';
  item.textContent = `${text} · ${new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  messageList.append(item);
  updateEmptyState();
  scrollToLatest();
}

function avatarLetters(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function addMessage(message) {
  const item = document.createElement('li');
  item.className = `message${message.username === currentUser ? ' is-own' : ''}`;

  const avatar = document.createElement('span');
  avatar.className = 'member-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = avatarLetters(message.username);

  const content = document.createElement('div');
  content.className = 'message-content';
  const meta = document.createElement('p');
  meta.className = 'message-meta';
  const name = document.createElement('strong');
  name.textContent = message.username;
  const time = document.createElement('time');
  time.dateTime = message.timestamp;
  time.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  meta.append(name, time);

  const text = document.createElement('p');
  text.className = 'message-text';
  text.textContent = message.text;
  content.append(meta, text);
  item.append(avatar, content);
  messageList.append(item);
  updateEmptyState();
  scrollToLatest();

  if (message.username !== currentUser) {
    showToast(`${message.username} sent a message`);
    if (document.hidden || !document.hasFocus()) {
      unreadMessages += 1;
      unreadCount.textContent = unreadMessages > 99 ? '99+' : String(unreadMessages);
      unreadCount.hidden = false;
      document.title = `(${unreadMessages}) Commonroom`;
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`#${currentRoom} · ${message.username}`, { body: message.text });
      }
    }
  }
}

function updateEmptyState() {
  document.querySelector('#empty-state').classList.toggle('is-visible', messageList.children.length === 0);
}

function scrollToLatest() {
  messageList.scrollTop = messageList.scrollHeight;
}

function renderMembers(users) {
  memberList.replaceChildren();
  document.querySelector('#member-count').textContent = String(users.length);
  roomPresence.textContent = users.length === 1 ? 'Just you, for now' : `${users.length} people here`;

  for (const user of users) {
    const item = document.createElement('li');
    item.className = `member${user.username === currentUser ? ' is-you' : ''}`;
    const avatar = document.createElement('span');
    avatar.className = 'member-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = avatarLetters(user.username);
    const name = document.createElement('span');
    name.className = 'member-name';
    name.textContent = user.username;
    item.append(avatar, name);
    if (user.username === currentUser) {
      const you = document.createElement('span');
      you.className = 'you-label';
      you.textContent = 'YOU';
      item.append(you);
    }
    memberList.append(item);
  }
}

function returnToJoin(message = '') {
  currentUser = '';
  currentRoom = '';
  messageList.replaceChildren();
  memberList.replaceChildren();
  chatView.hidden = true;
  joinView.hidden = false;
  document.querySelector('#leave-button').hidden = true;
  joinError.textContent = message;
  resetUnread();
  updateEmptyState();
}

socket.on('connect', () => setConnectionState(true));
socket.on('disconnect', () => {
  setConnectionState(false);
  showToast('Connection lost. Trying to reconnect...');
});
socket.on('room-users', renderMembers);
socket.on('room-notice', ({ text, timestamp }) => addNotice(text, timestamp));
socket.on('chat-message', addMessage);

document.querySelectorAll('[data-room]').forEach((button) => {
  button.addEventListener('click', () => {
    roomInput.value = button.dataset.room;
    roomInput.focus();
  });
});

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  joinError.textContent = '';
  currentUser = usernameInput.value.trim().replace(/\s+/g, ' ');
  currentRoom = roomInput.value.trim().toLowerCase();

  socket.emit('join-room', { username: currentUser, room: currentRoom }, (result) => {
    if (!result?.ok) {
      currentUser = '';
      currentRoom = '';
      joinError.textContent = result?.error || 'Could not join the room. Please try again.';
      return;
    }

    currentUser = result.username;
    currentRoom = result.room;
    document.querySelector('#current-room-name').textContent = currentRoom;
    document.querySelector('#conversation-title').textContent = `#${currentRoom}`;
    messageList.replaceChildren();
    joinView.hidden = true;
    chatView.hidden = false;
    document.querySelector('#leave-button').hidden = false;
    messageInput.focus();
    updateEmptyState();
  });
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('send-message', { text }, (result) => {
    if (result?.error) {
      showToast(result.error);
      return;
    }
    messageInput.value = '';
    document.querySelector('#character-count').textContent = '0 / 1000';
    messageInput.style.height = 'auto';
    messageInput.focus();
  });
});

messageInput.addEventListener('input', () => {
  document.querySelector('#character-count').textContent = `${messageInput.value.length} / 1000`;
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});

document.querySelector('#leave-button').addEventListener('click', () => {
  socket.emit('leave-room', () => returnToJoin());
});

notificationToggle.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    showToast('Browser notifications are not available here.');
    return;
  }
  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  notificationsEnabled = permission === 'granted';
  notificationToggle.setAttribute('aria-pressed', String(notificationsEnabled));
  notificationToggle.textContent = notificationsEnabled ? 'Alerts on' : 'Enable alerts';
  showToast(notificationsEnabled ? 'Browser alerts are on.' : 'Browser alerts are off.');
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) resetUnread();
});

updateEmptyState();