const axios = require('axios');
const chalk = require('chalk').default || require('chalk');

async function fetchData() {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    const post = response.data;
    console.log(chalk.magenta.bold('Fetched API Data'));
    console.log(chalk.yellow(`Title: ${post.title}`));
    console.log(chalk.white(`Body: ${post.body}`));
  } catch (error) {
    console.error(chalk.red('Error fetching data:') + ' ' + error.message);
  }
}

module.exports = fetchData;
