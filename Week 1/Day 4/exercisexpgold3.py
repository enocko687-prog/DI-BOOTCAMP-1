import random


def throw_dice():
	return random.randint(1, 6)


def throw_until_doubles():
	throw_count = 0

	while True:
		first_die = throw_dice()
		second_die = throw_dice()
		throw_count += 1

		if first_die == second_die:
			return throw_count


def main():
	results = [throw_until_doubles() for _ in range(100)]
	total_throws = sum(results)
	average_throws = total_throws / len(results)

	print(f"Total throws: {total_throws}")
	print(f"Average throws to reach doubles: {average_throws:.2f}")


main()
