const { createInterface } = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function number_guessing_game() {
	const random_number = Math.floor(Math.random() * 100) + 1;
	const max_attempts = 7;
	const prompt = createInterface({ input: stdin, output: stdout });
	let guessed_correctly = false;

	console.log('I picked a number between 1 and 100.');

	try {
		for (let attempt = 1; attempt <= max_attempts; attempt += 1) {
			const answer = await prompt.question(
				`Attempt ${attempt}/${max_attempts}. Enter your guess: `
			);
			const guess = Number(answer);

			if (!Number.isInteger(guess)) {
				console.log('Please enter a whole number.');
			} else if (guess < random_number) {
				console.log('Too low!');
			} else if (guess > random_number) {
				console.log('Too high!');
			} else {
				console.log('Congratulations! You guessed the number!');
				guessed_correctly = true;
				break;
			}
		}

		if (!guessed_correctly) {
			console.log(`Game over! The correct number was ${random_number}.`);
		}
	} finally {
		prompt.close();
	}
}

number_guessing_game().catch((error) => {
	console.error('The game could not run:', error);
	process.exitCode = 1;
});
