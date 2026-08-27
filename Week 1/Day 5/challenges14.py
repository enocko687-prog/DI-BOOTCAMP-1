def dict_avg(values):
	if not values:
		raise ValueError("The dictionary cannot be empty")

	total = 0
	for value in values.values():
		total += value
	return total / len(values)


print(dict_avg({"a": 1, "b": 2, "c": 8, "d": 1}))
