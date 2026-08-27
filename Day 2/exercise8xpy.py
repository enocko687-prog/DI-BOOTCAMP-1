words = []

for number in range(7):
	words.append(input(f'Enter word {number + 1}: '))

letter = input('Enter a letter: ')

for word in words:
	index = word.find(letter)
	if index != -1:
		print(f'The first occurrence of {letter} in {word} is at index {index}.')
	else:
		print(f'The letter {letter} does not exist in the word {word}.')
