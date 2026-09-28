const chalk = require('chalk').default || require('chalk');

function greet() {
  console.log(chalk.bold.green('Hello, Ninja!'));
  console.log(chalk.cyan('Welcome to the command-line utility.'));
}

module.exports = greet;
