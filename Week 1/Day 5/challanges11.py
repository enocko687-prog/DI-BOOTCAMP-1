def separate_types(items):
	integers = []
	strings = []

	for item in items:
		if isinstance(item, int) and not isinstance(item, bool):
			integers.append(item)
		elif isinstance(item, str):
			strings.append(item)

	return integers, strings


numbers, words = separate_types([1, "hello", 3, "Python", 7, "world"])
print("Integers:", numbers)
print("Strings:", words)
