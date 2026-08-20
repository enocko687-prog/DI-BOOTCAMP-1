import random

wins = 0
losses = 0

while True:
	guess = input("Guess a number from 1 to 9, or enter q to quit: ").strip().lower()

	if guess == "q":
		break

	if not guess.isdigit() or not 1 <= int(guess) <= 9:
		print("Please enter a number from 1 to 9.")
		continue

	random_number = random.randint(1, 9)

	if int(guess) == random_number:
		print("Winner")
		wins += 1
	else:
		print("better luck next time")
		losses += 1

print(f"Total games won: {wins}")
print(f"Total games lost: {losses}")
