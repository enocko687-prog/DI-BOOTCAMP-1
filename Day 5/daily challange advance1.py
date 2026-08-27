import random
from collections import Counter


list_of_numbers = [random.randint(0, 10000) for _ in range(20000)]
target_number = 3728


def find_pairs(numbers, target):
	counts = Counter(numbers)
	pairs = []

	for number in sorted(counts):
		complement = target - number
		if complement not in counts or number > complement:
			continue
		if number == complement and counts[number] < 2:
			continue
		pairs.append((number, complement))

	return pairs


matching_pairs = find_pairs(list_of_numbers, target_number)
for first_number, second_number in matching_pairs:
	print(
		f"{first_number} and {second_number} "
		f"sums to the target_number {target_number}"
	)
