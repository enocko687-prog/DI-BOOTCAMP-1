def get_full_name(first_name, last_name, middle_name=None):
	name_parts = [first_name]
	if middle_name:
		name_parts.append(middle_name)
	name_parts.append(last_name)
	return " ".join(name_parts).title()


print(get_full_name(first_name="john", middle_name="hooker", last_name="lee"))
print(get_full_name(first_name="bruce", last_name="lee"))
