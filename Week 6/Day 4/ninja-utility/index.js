const { Command } = require('commander');
const chalk = require('chalk').default || require('chalk');
const greet = require('./commands/greet');
const fetchData = require('./commands/fetch');
const readFile = require('./commands/read');

const program = new Command();

program.name('ninja-utility');

program
  .command('greet')
  .description('Display a colorful greeting')
  .action(() => {
    greet();
  });

program
  .command('fetch')
  .description('Fetch and display public API data')
  .action(async () => {
    await fetchData();
  });

program
  .command('read <fileName>')
  .description('Read a file and display its contents')
  .action((fileName) => {
    readFile(fileName);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log(chalk.yellow('Available commands: greet, fetch, read <fileName>'));
}
