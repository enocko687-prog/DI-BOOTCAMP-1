const { readFile, writeFile } = require('./fileManager');

const helloContent = readFile('./Hello World.txt');
console.log('Read content:', helloContent.trim());

const result = writeFile('./Bye World.txt', 'Writing to the file');
console.log(result);

const byeContent = readFile('./Bye World.txt');
console.log('Updated content:', byeContent.trim());
