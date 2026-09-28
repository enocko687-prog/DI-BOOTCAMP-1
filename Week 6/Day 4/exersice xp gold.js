const fs = require('fs');
const path = require('path');

console.log('=== Exercise 1: File Management and Path Manipulation ===');
const fileManagementDir = path.join(__dirname, 'file-management');
const dataDir = path.join(fileManagementDir, 'data');
const exampleFile = path.join(dataDir, 'example.txt');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(exampleFile)) {
  fs.writeFileSync(exampleFile, 'This is sample content for the file management exercise.\n', 'utf8');
}

function showFileInfo() {
  const exists = fs.existsSync(exampleFile);
  const stats = exists ? fs.statSync(exampleFile) : null;

  console.log('File exists:', exists);
  if (stats) {
    console.log('File size:', stats.size, 'bytes');
    console.log('Creation time:', stats.ctime.toISOString());
  }
}

showFileInfo();

console.log('\n=== Exercise 2: Fetching and Displaying Data with Axios ===');
async function fetchPostTitles() {
  try {
    const axios = require('axios');
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    return response.data.map(post => post.title);
  } catch (error) {
    console.log('Install axios first: npm install axios');
    return [];
  }
}

(async () => {
  const titles = await fetchPostTitles();
  titles.slice(0, 10).forEach((title, index) => {
    console.log(`${index + 1}. ${title}`);
  });
})();

console.log('\n=== Exercise 3: Working with Dates Using the date-fns Module ===');
try {
  const { format, addDays } = require('date-fns');

  function showFormattedDate() {
    const now = new Date();
    const futureDate = addDays(now, 5);
    return format(futureDate, 'yyyy-MM-dd');
  }

  console.log('Date after 5 days:', showFormattedDate());
} catch (error) {
  console.log('Install date-fns first: npm install date-fns');
}

console.log('\n=== Exercise 4: Faker Module ===');
try {
  const { faker } = require('@faker-js/faker');
  const users = [];

  function addUser() {
    const user = {
      name: faker.person.fullName(),
      address: {
        street: faker.location.streetAddress(),
        country: faker.location.country()
      }
    };
    users.push(user);
    return user;
  }

  for (let i = 0; i < 3; i++) {
    addUser();
  }
  console.log(users);
} catch (error) {
  console.log('Install Faker first: npm install @faker-js/faker');
}

console.log('\n=== Exercise 5: Regular Expression #1 ===');
function returnNumbers(str) {
  return str.match(/\d/g)?.join('') || '';
}
console.log(returnNumbers('k5k3q2g5z6x9bn'));

console.log('\n=== Exercise 6: Regular Expression #2 ===');
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
