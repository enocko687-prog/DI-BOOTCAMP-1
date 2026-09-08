// Exercise 1: Change the article
const article = document.querySelector('article');

if (article) {
  const h1 = article.querySelector('h1');
  if (h1) console.log(h1);

  const paragraphs = article.querySelectorAll('p');
  if (paragraphs.length) {
    paragraphs[paragraphs.length - 1].remove();
  }

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
    article.querySelectorAll('p').forEach((p) => {
      p.style.fontWeight = 'bold';
    });
  });
  article.appendChild(button);

  if (h1) {
    h1.addEventListener('mouseover', () => {
      h1.style.fontSize = `${Math.floor(Math.random() * 101)}px`;
    });
  }

  const secondParagraph = paragraphs[1];
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

// Exercise 2: Work with forms
const form = document.querySelector('form');
if (form) console.log(form);

const firstNameInput = document.getElementById('fname');
const lastNameInput = document.getElementById('lname');
if (firstNameInput) console.log(firstNameInput);
if (lastNameInput) console.log(lastNameInput);

console.log(document.getElementsByName('firstname'));
console.log(document.getElementsByName('lastname'));

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const firstNameValue = firstNameInput?.value.trim();
    const lastNameValue = lastNameInput?.value.trim();
    const userAnswerList = document.querySelector('.usersAnswer');

    if (userAnswerList) {
      userAnswerList.innerHTML = '';
    }

    if (firstNameValue) {
      const li1 = document.createElement('li');
      li1.textContent = firstNameValue;
      if (userAnswerList) userAnswerList.appendChild(li1);
    }

    if (lastNameValue) {
      const li2 = document.createElement('li');
      li2.textContent = lastNameValue;
      if (userAnswerList) userAnswerList.appendChild(li2);
    }
  });
}

// Exercise 3: Transform the sentence
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

const boldSentence = document.querySelector('p');
if (boldSentence) {
  boldSentence.addEventListener('mouseover', highlight);
  boldSentence.addEventListener('mouseout', returnItemsToDefault);
}

// Exercise 4: Volume of a sphere
const sphereForm = document.getElementById('MyForm');
if (sphereForm) {
  sphereForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const radius = Number(document.getElementById('radius')?.value);
    const volumeField = document.getElementById('volume');

    if (Number.isNaN(radius) || radius < 0) {
      if (volumeField) volumeField.value = 'Invalid radius';
      return;
    }

    const volume = (4 / 3) * Math.PI * radius ** 3;
    if (volumeField) volumeField.value = volume.toFixed(2);
  });
}
