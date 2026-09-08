import random


wordslist = [
	"correction",
	"childish",
	"beach",
	"python",
	"assertive",
	"interference",
	"complete",
	"share",
	"credit card",
	"rush",
	"south",
]

body_parts = ["head", "body", "left arm", "right arm", "left leg", "right leg"]


def display_progress(word, guessed_letters):
	return " ".join(
		letter if letter == " " or letter in guessed_letters else "*"
		for letter in word
	)


def display_gallows(mistakes):
	print("\n  +---+")
	print("  |   " + ("O" if mistakes >= 1 else ""))
	print("  |  " + ("/|\\" if mistakes >= 4 else " | " if mistakes >= 2 else ""))
	print("  |  " + ("/ \\" if mistakes >= 6 else "/   " if mistakes >= 5 else ""))
	print("  |")
	print("__|__\n")
	if mistakes:
		print("Body parts on the gallows:", ", ".join(body_parts[:mistakes]))


def play():
	word = random.choice(wordslist).lower()
	guessed_letters = set()
	mistakes = 0

	print("Welcome to Hangman!")

	while mistakes < len(body_parts):
		display_gallows(mistakes)
		progress = display_progress(word, guessed_letters)
		print("Word:", progress)

		if all(letter == " " or letter in guessed_letters for letter in word):
			print(f"You solved it: {word}")
			return

		guess = input("Guess a letter: ").strip().lower()
		if len(guess) != 1 or not guess.isalpha():
			print("Please enter one letter.")
			continue
		if guess in guessed_letters:
			print("You already guessed that letter.")
			continue

		guessed_letters.add(guess)
		if guess in word:
			print("Correct!")
		else:
			mistakes += 1
			print(f"That letter is not in the word. {body_parts[mistakes - 1]} added.")

	display_gallows(mistakes)
	print(f"Game over. The word was: {word}")


if __name__ == "__main__":
	play()
	
