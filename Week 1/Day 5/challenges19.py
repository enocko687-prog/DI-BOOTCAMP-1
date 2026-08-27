def my_split(text, separator=None):
	parts = []
	current = ""

	if separator is not None and len(separator) != 1:
		raise ValueError("The separator must be one character")

	for character in text:
		is_separator = character.isspace() if separator is None else character == separator

		if is_separator:
			if separator is not None or current:
				parts.append(current)
			current = ""
		elif separator is None and current == "" and parts and parts[-1] == "":
			continue
		else:
			current += character

	if current or separator is not None:
		parts.append(current)

	if separator is None:
		return [part for part in parts if part]
	return parts


print(my_split("Python is fun"))
print(my_split("red,green,blue", ","))