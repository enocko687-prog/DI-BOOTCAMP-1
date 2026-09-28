const axios = require('axios');
const chalk = require('chalk').default || require('chalk');

async function getWeather(city) {
  try {
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.log(chalk.red(`City not found: ${city}`));
      return;
    }

    const location = geoResponse.data.results[0];
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: 'temperature_2m,weather_code',
        timezone: 'auto'
      }
    });

    const current = weatherResponse.data.current;
    const temperature = current.temperature_2m;
    const code = current.weather_code;
    const weatherMap = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Rain showers',
      81: 'Heavy showers',
      82: 'Violent showers'
    };

    console.log(chalk.bold.cyan(`Weather in ${location.name}, ${location.country}:`));
    console.log(chalk.yellow(`Temperature: ${temperature}°C`));
    console.log(chalk.green(`Condition: ${weatherMap[code] || 'Unknown'}`));
  } catch (error) {
    console.error(chalk.red('Weather fetch failed:'), error.message);
  }
}

module.exports = { getWeather };
