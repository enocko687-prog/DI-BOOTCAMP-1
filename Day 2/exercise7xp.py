words = []

for number in range(7):
	words.append(input(f'Enter word {number + 1}: '))

letter = input('Enter a character: ')

for word in words:
	index = word.find(letter)
	if index == -1:
		print(f'The letter {letter} does not appear in {word}.')
	else:
		print(f'The first occurrence of {letter} in {word} is at index {index}.')
