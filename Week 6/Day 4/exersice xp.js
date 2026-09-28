const fs = require('fs');
const path = require('path');

console.log('=== Exercise 1: CommonJS product module ===');
const products = [
  { name: 'Laptop', price: 1200, category: 'Electronics' },
  { name: 'Headphones', price: 150, category: 'Accessories' },
  { name: 'Mouse', price: 40, category: 'Accessories' },
  { name: 'Smartphone', price: 900, category: 'Electronics' }
];

function findProductByName(productName) {
  return products.find(product => product.name.toLowerCase() === productName.toLowerCase());
}

['Laptop', 'Headphones', 'Tablet', 'Mouse'].forEach(name => {
  const product = findProductByName(name);
  if (product) {
    console.log(product);
  } else {
    console.log(`No product found for: ${name}`);
  }
});

console.log('\n=== Exercise 2: ES6 module style average age ===');
const people = [
  { name: 'Alice', age: 30, location: 'Paris' },
  { name: 'Bob', age: 25, location: 'Berlin' },
  { name: 'Charlie', age: 35, location: 'Madrid' },
  { name: 'Diana', age: 28, location: 'Rome' }
];

function calculateAverageAge(persons) {
  const totalAge = persons.reduce((sum, person) => sum + person.age, 0);
  return totalAge / persons.length;
}

console.log(`Average age: ${calculateAverageAge(people).toFixed(2)}`);

console.log('\n=== Exercise 3: File management using CommonJS ===');
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  return `Successfully wrote to ${filePath}`;
}

const helloPath = path.join(__dirname, 'Hello World.txt');
const byePath = path.join(__dirname, 'Bye World.txt');

fs.writeFileSync(helloPath, 'Hello World !! \n', 'utf8');
fs.writeFileSync(byePath, 'Bye World !! \n', 'utf8');

const helloText = readFile(helloPath);
console.log('Read content:', helloText.trim());

console.log(writeFile(byePath, 'Writing to the file'));
console.log('Updated content:', readFile(byePath).trim());

console.log('\n=== Exercise 4: Todo list ===');
class TodoList {
  constructor() {
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push({ task, completed: false });
  }

  markTaskAsComplete(taskName) {
    const task = this.tasks.find(item => item.task === taskName);
    if (task) {
      task.completed = true;
    }
  }

  listTasks() {
    return this.tasks;
  }
}

const todoList = new TodoList();
todoList.addTask('Read JavaScript notes');
todoList.addTask('Practice Node.js exercises');
todoList.addTask('Review project checklist');
todoList.markTaskAsComplete('Read JavaScript notes');
console.log(todoList.listTasks());

console.log('\n=== Exercise 5: Custom module + lodash ===');
let _;
try {
  _ = require('lodash');
  function add(a, b) {
    return a + b;
  }

  function multiply(a, b) {
    return a * b;
  }

  console.log('Addition result:', add(10, 5));
  console.log('Multiplication result:', multiply(4, 6));
  console.log('Lodash sum:', _.sum([3, 6, 9, 12]));
  console.log('Lodash max:', _.max([3, 6, 9, 12]));
} catch (error) {
  console.log('Install lodash first: npm install lodash');
}

console.log('\n=== Exercise 6: Chalk package ===');
try {
  const chalk = require('chalk').default;
  console.log(chalk.blue.bold('Hello from the chalk module!'));
  console.log(chalk.green('This is green text with a subtle style.'));
  console.log(chalk.red.bgYellow.bold('This is a colorful warning message!'));
} catch (error) {
  console.log('Install chalk first: npm install chalk');
}

console.log('\n=== Exercise 7: Copy file and read directory ===');
const sourcePath = path.join(__dirname, 'source.txt');
const destinationPath = path.join(__dirname, 'destination.txt');

fs.writeFileSync(sourcePath, 'This file was copied successfully.\n', 'utf8');
fs.readFile(sourcePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading source.txt:', err);
    return;
  }

  fs.writeFile(destinationPath, data, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing destination.txt:', writeErr);
      return;
    }

    console.log('File copied successfully from source.txt to destination.txt');
    fs.readdir(__dirname, (readErr, files) => {
      if (readErr) {
        console.error('Error reading directory:', readErr);
        return;
      }
      console.log('Files in this directory:');
      files.forEach(file => console.log(file));
    });
  });
});


