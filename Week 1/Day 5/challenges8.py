import math


def norm(numbers):
	sum_of_squares = 0
	for number in numbers:
		sum_of_squares += number ** 2
	return math.sqrt(sum_of_squares)


print(norm([1, 2, 2]))
