const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default || require('chalk');

function readFile(fileName) {
  const filePath = path.join(__dirname, '..', fileName);

  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`File not found: ${fileName}`));
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(chalk.bold.blue(`Contents of ${fileName}:`));
  console.log(chalk.white(content));
}

module.exports = readFile;
