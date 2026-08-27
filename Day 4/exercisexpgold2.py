def sum_repeated_number(x):
	number_as_text = str(x)
	return sum(int(number_as_text * repetition) for repetition in range(1, 5))


print(sum_repeated_number(3))
