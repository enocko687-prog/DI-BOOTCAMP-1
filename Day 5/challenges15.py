def common_div(first_number, second_number):
	if first_number == 0 or second_number == 0:
		raise ValueError("Numbers must be non-zero")

	first_number = abs(first_number)
	second_number = abs(second_number)
	limit = min(first_number, second_number)
	divisors = []

	for candidate in range(2, limit + 1):
		if first_number % candidate == 0 and second_number % candidate == 0:
			divisors.append(candidate)

	return divisors


print(common_div(10, 20))
