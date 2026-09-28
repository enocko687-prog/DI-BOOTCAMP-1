const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default || require('chalk');

function greet(name) {
  return `Hello ${name}! Welcome to the daily challenge.`;
}

function showColorfulMessage() {
  console.log(chalk.blue.bold('This is a colorful message!'));
  console.log(chalk.green('Your Node.js challenge is going great!'));
  console.log(chalk.red.bgYellow.bold('Keep pushing forward!'));
}

function readFileData() {
  const filePath = path.join(__dirname, 'daily-challenge', 'files', 'file-data.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim();
}

console.log('=== Task 1: Basic Module System ===');
console.log(greet('Ninja'));

console.log('\n=== Task 2: Using an NPM Module ===');
showColorfulMessage();

console.log('\n=== Task 3: Advanced File Operations ===');
console.log(readFileData());

console.log('\n=== Challenge Task: Integrating Everything ===');
console.log(greet('Ninja'));
showColorfulMessage();
console.log('--- File content ---');
console.log(readFileData());
