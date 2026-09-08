def box_printer(*strings):
	if not strings:
		return

	width = max(len(string) for string in strings)
	border = "*" * (width + 4)

	print(border)
	for string in strings:
		print(f"* {string.ljust(width)} *")
	print(border)


box_printer("Hello", "World", "in", "reallylongword", "a", "frame")
