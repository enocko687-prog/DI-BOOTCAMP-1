def print_longest_word(words):
	if not words:
		raise ValueError("The list cannot be empty")

	longest_word = words[0]
	for word in words[1:]:
		if len(word) > len(longest_word):
			longest_word = word

	print(longest_word)


print_longest_word(["cat", "elephant", "dog", "butterfly"])
