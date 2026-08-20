import random


def manual_statistics(numbers):
	total = 0
	largest = numbers[0]
	smallest = numbers[0]

	for number in numbers:
		total += number
		if number > largest:
			largest = number
		if number < smallest:
			smallest = number

	return total, total / len(numbers), largest, smallest


def get_user_numbers(count=10):
	numbers = []

	for number_index in range(count):
		while True:
			number = int(input(f"Enter integer {number_index + 1} (-100 to 100): "))
			if -100 <= number <= 100:
				numbers.append(number)
				break
			print("Please enter an integer between -100 and 100.")

	return numbers


def get_random_numbers(count):
	return [random.randint(-100, 100) for _ in range(count)]


numbers = [3, 47, 99, -80, 22, 97, 54, -23, 5, 7]

print("Numbers:", numbers)
print("Descending order:", sorted(numbers, reverse=True))
print("Sum:", sum(numbers))
print("First and last numbers:", [numbers[0], numbers[-1]])
print("Numbers greater than 50:", [number for number in numbers if number > 50])
print("Numbers smaller than 10:", [number for number in numbers if number < 10])
print("Squared numbers:", [number ** 2 for number in numbers])

unique_numbers = []
for number in numbers:
	if number not in unique_numbers:
		unique_numbers.append(number)

print("Numbers without duplicates:", unique_numbers)
print("Number of unique values:", len(unique_numbers))
print("Average:", sum(numbers) / len(numbers))
print("Largest number:", max(numbers))
print("Smallest number:", min(numbers))

manual_sum, manual_average, manual_largest, manual_smallest = manual_statistics(numbers)
print("Manual sum:", manual_sum)
print("Manual average:", manual_average)
print("Manual largest number:", manual_largest)
print("Manual smallest number:", manual_smallest)

random_count = random.randint(50, 100)
random_numbers = get_random_numbers(random_count)
print(f"Generated {len(random_numbers)} random numbers.")

