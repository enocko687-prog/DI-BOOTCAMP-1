const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your full name: ', (name) => {
  const regex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
  console.log(regex.test(name) ? 'Valid name' : 'Invalid name');
  rl.close();
});
