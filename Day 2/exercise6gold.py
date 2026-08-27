words = []

for number in range(1, 8):
	words.append(input(f"Enter word {number}: "))

letter = input("Enter a single character: ")

for word in words:
	if letter in word:
		print(f"The first occurrence of '{letter}' in '{word}' is at index {word.index(letter)}.")
	else:
		print(f"The letter '{letter}' does not appear in '{word}'.")
