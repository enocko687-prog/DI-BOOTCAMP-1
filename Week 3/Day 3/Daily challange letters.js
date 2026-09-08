const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Type letters only';

document.body.appendChild(input);

input.addEventListener('input', () => {
  input.value = input.value.replace(/[^a-zA-Z]/g, '');
});
