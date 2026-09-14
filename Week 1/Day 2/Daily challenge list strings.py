def multiples_of_number(number, length):
	"""Return the requested number of positive multiples."""
	return [number * multiplier for multiplier in range(1, length + 1)]


def remove_consecutive_duplicates(word):
	"""Remove repeated characters that appear next to each other."""
	if not word:
		return word

	result = [word[0]]
	for character in word[1:]:
		if character != result[-1]:
			result.append(character)
	return ''.join(result)


def main():
	print('Challenge 1: Multiples of a Number')
	number = int(input('Enter a number: '))
	length = int(input('Enter the list length: '))
	if length < 0:
		raise ValueError('The list length cannot be negative.')
	print(multiples_of_number(number, length))

	print('\nChallenge 2: Remove Consecutive Duplicate Letters')
	word = input('Enter a word: ')
	print(remove_consecutive_duplicates(word))


if __name__ == '__main__':
	main()
