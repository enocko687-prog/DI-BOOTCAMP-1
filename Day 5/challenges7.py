def list_count(items, target):
	occurrences = 0
	for item in items:
		if item == target:
			occurrences += 1
	return occurrences


print(list_count(["a", "a", "t", "o"], "a"))
