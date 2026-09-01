// Exercise 1 : Change the article
const h1 = document.querySelector('article h1');
if (h1) console.log(h1);

const article = document.querySelector('article');
if (article) {
  const lastParagraph = article.querySelectorAll('p')[article.querySelectorAll('p').length - 1];
  if (lastParagraph) lastParagraph.remove();

  const h2 = article.querySelector('h2');
  if (h2) {
    h2.addEventListener('click', () => {
      h2.style.backgroundColor = 'red';
    });
  }

  const h3 = article.querySelector('h3');
  if (h3) {
    h3.addEventListener('click', () => {
      h3.style.display = 'none';
    });
  }

  const button = document.createElement('button');
  button.textContent = 'Bold paragraphs';
  button.addEventListener('click', () => {
    const paragraphs = article.querySelectorAll('p');
    paragraphs.forEach((p) => {
      p.style.fontWeight = 'bold';
    });
  });
  article.appendChild(button);

  if (h1) {
    h1.addEventListener('mouseover', () => {
      h1.style.fontSize = `${Math.floor(Math.random() * 101)}px`;
    });
  }

  const secondParagraph = article.querySelectorAll('p')[1];
  if (secondParagraph) {
    secondParagraph.addEventListener('mouseover', () => {
      secondParagraph.style.animation = 'fadeOut 1s forwards';
    });
    secondParagraph.addEventListener('mouseout', () => {
      secondParagraph.style.animation = 'none';
      secondParagraph.style.opacity = '1';
    });
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Exercise 2 : Work with forms
const form = document.querySelector('form');
if (form) console.log(form);

const firstNameInput = document.getElementById('fname');
const lastNameInput = document.getElementById('lname');
if (firstNameInput) console.log(firstNameInput);
if (lastNameInput) console.log(lastNameInput);

const inputsByName = document.getElementsByName('firstname');
const inputsByName2 = document.getElementsByName('lastname');
console.log(inputsByName);
console.log(inputsByName2);

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const firstNameValue = firstNameInput?.value.trim();
    const lastNameValue = lastNameInput?.value.trim();

    const userList = document.querySelector('.usersAnswer');
    if (userList) {
      userList.innerHTML = '';
    }

    if (firstNameValue && firstNameValue !== '') {
      const li1 = document.createElement('li');
      li1.textContent = firstNameValue;
      if (userList) userList.appendChild(li1);
    }

    if (lastNameValue && lastNameValue !== '') {
      const li2 = document.createElement('li');
      li2.textContent = lastNameValue;
      if (userList) userList.appendChild(li2);
    }
  });
}

// Exercise 3 : Transform the sentence
let allBoldItems = [];

function getBoldItems() {
  const paragraph = document.querySelector('p');
  if (paragraph) {
    allBoldItems = Array.from(paragraph.querySelectorAll('strong'));
  }
  return allBoldItems;
}

function highlight() {
  getBoldItems();
  allBoldItems.forEach((item) => {
    item.style.color = 'blue';
  });
}

function returnItemsToDefault() {
  getBoldItems();
  allBoldItems.forEach((item) => {
    item.style.color = 'black';
  });
}

const transformParagraph = document.querySelector('p');
if (transformParagraph) {
  transformParagraph.addEventListener('mouseover', highlight);
  transformParagraph.addEventListener('mouseout', returnItemsToDefault);
}

// Exercise 4 : Volume of a sphere
const formSphere = document.getElementById('MyForm');
if (formSphere) {
  formSphere.addEventListener('submit', (event) => {
    event.preventDefault();

    const radiusInput = document.getElementById('radius');
    const volumeInput = document.getElementById('volume');

    if (!radiusInput || !volumeInput) return;

    const radius = Number(radiusInput.value);
    if (Number.isNaN(radius) || radius < 0) {
      volumeInput.value = 'Invalid radius';
      return;
    }

    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    volumeInput.value = volume.toFixed(2);
  });
}
