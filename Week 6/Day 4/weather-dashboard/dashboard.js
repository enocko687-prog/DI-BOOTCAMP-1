const readline = require('readline');
const { getWeather } = require('./weather');

function startDashboard() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter a city name: ', async (city) => {
    await getWeather(city.trim());
    rl.close();
  });
}

module.exports = { startDashboard };
