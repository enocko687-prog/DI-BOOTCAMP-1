def is_mono(numbers):
	ascending = True
	descending = True

	for index in range(1, len(numbers)):
		if numbers[index] < numbers[index - 1]:
			ascending = False
		if numbers[index] > numbers[index - 1]:
			descending = False

	return ascending or descending


print(is_mono([7, 6, 5, 5, 2, 0]))
print(is_mono([2, 3, 3, 3]))
print(is_mono([1, 2, 0, 4]))
