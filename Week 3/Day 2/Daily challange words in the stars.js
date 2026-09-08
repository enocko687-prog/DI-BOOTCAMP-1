const userInput = prompt('Enter several words separated by commas:');

if (userInput === null || userInput.trim() === '') {
  console.log('No input provided.');
} else {
  const words = userInput.split(',').map((word) => word.trim()).filter((word) => word !== '');

  const longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
  const border = '*'.repeat(longestWord + 4);

  console.log(border);
  words.forEach((word) => {
    const spaces = ' '.repeat(longestWord - word.length);
    console.log(`* ${word}${spaces} *`);
  });
  console.log(border);
}
