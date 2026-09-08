def ticket_price(age):
	if age < 3:
		return 0
	if age <= 12:
		return 10
	return 15


def calculate_total(family):
	total = 0

	for name, age in family.items():
		price = ticket_price(age)
		print(f"{name}: ${price}")
		total += price

	print(f"Total cost: ${total}")
	return total


def get_family_from_user():
	family = {}
	member_count = int(input("How many family members? "))

	for member_number in range(member_count):
		name = input(f"Enter the name of family member {member_number + 1}: ")
		age = int(input(f"Enter {name}'s age: "))
		family[name] = age

	return family


family = {"rick": 43, "beth": 13, "morty": 5, "summer": 8}
calculate_total(family)
