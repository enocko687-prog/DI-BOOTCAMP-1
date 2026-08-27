alphabet = 'abcdefghijklmnopqrstuvwxyz'
vowels = 'aeiou'

for letter in alphabet:
	if letter in vowels:
		print(f'{letter} is a vowel')
	else:
		print(f'{letter} is a consonant')
