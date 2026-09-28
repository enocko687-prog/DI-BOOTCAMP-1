const { fetchPostTitles } = require('./fetch-data');

async function main() {
  const titles = await fetchPostTitles();
  titles.forEach((title, index) => {
    console.log(`${index + 1}. ${title}`);
  });
}

main();
