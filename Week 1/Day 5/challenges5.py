def find_max(numbers):
	if not numbers:
		raise ValueError("The list cannot be empty")

	largest = numbers[0]
	for number in numbers[1:]:
		if number > largest:
			largest = number
	return largest


print(find_max([0, 1, 3, 50]))
