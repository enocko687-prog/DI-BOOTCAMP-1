const chalk = require('chalk').default || require('chalk');

function showColorfulMessage() {
  console.log(chalk.blue.bold('This is a colorful message!'));
  console.log(chalk.green('Your Node.js challenge is going great!'));
  console.log(chalk.red.bgYellow.bold('Keep pushing forward!'));
}

module.exports = { showColorfulMessage };
