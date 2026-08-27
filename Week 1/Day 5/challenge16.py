import math


def is_prime(number):
	if number < 2:
		return False

	for divisor in range(2, math.isqrt(number) + 1):
		if number % divisor == 0:
			return False

	return True


print(is_prime(11))
