def factorial(number):
	if number < 0:
		raise ValueError("Factorial is not defined for negative numbers")

	result = 1
	for value in range(2, number + 1):
		result *= value
	return result


print(factorial(4))
