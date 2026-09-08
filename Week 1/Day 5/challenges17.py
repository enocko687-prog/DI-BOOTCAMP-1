def weird_print(items):
	even_items = []
	for index, value in enumerate(items):
		if index % 2 == 0 and value % 2 == 0:
			even_items.append(value)

	print(even_items)


weird_print([1, 2, 2, 3, 4, 5])
