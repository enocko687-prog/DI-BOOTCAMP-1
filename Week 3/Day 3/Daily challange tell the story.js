const form = document.getElementById('libform');
const storyElement = document.getElementById('story');

const stories = [
  (values) => `${values.person} went to ${values.place} and found a ${values.adjective} ${values.noun}. Then they started to ${values.verb} with joy!`,
  (values) => `One day, a ${values.adjective} ${values.noun} met ${values.person} in ${values.place} and decided to ${values.verb}.`,
  (values) => `${values.person} was a ${values.adjective} explorer who found a magical ${values.noun} in ${values.place}. Their first action was to ${values.verb}.`,
  (values) => `At ${values.place}, ${values.person} dropped a ${values.adjective} ${values.noun} and began to ${values.verb} loudly.`,
];

function getValues() {
  return {
    noun: document.getElementById('noun')?.value.trim() || '',
    adjective: document.getElementById('adjective')?.value.trim() || '',
    person: document.getElementById('person')?.value.trim() || '',
    verb: document.getElementById('verb')?.value.trim() || '',
    place: document.getElementById('place')?.value.trim() || '',
  };
}

function renderStory(values, randomIndex = null) {
  if (!storyElement) return;

  let chosenStory;
  if (randomIndex === null) {
    chosenStory = stories[Math.floor(Math.random() * stories.length)];
  } else {
    chosenStory = stories[randomIndex];
  }

  storyElement.textContent = chosenStory(values);
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const values = getValues();
    const hasEmptyValue = Object.values(values).some((value) => value === '');

    if (hasEmptyValue) {
      alert('Please fill in all fields.');
      return;
    }

    renderStory(values);
  });
}

const shuffleButton = document.createElement('button');
shuffleButton.type = 'button';
shuffleButton.textContent = 'Shuffle Story';
shuffleButton.style.marginTop = '10px';

if (form) {
  form.appendChild(shuffleButton);
}

let shuffleIndex = 0;

shuffleButton.addEventListener('click', () => {
  const values = getValues();
  const hasEmptyValue = Object.values(values).some((value) => value === '');

  if (hasEmptyValue) {
    alert('Please fill in all fields before shuffling.');
    return;
  }

  shuffleIndex = (shuffleIndex + 1) % stories.length;
  renderStory(values, shuffleIndex);
});
