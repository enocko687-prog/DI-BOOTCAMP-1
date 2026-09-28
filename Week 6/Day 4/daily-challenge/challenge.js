const { greet } = require('./greeting');
const { showColorfulMessage } = require('./colorful-message');
const { readFileData } = require('./read-file');

console.log(greet('Ninja'));
showColorfulMessage();
console.log('--- File content ---');
readFileData();
