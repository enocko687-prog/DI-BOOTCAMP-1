class Cat:
	def __init__(self, cat_name, cat_age):
		self.name = cat_name
		self.age = cat_age


cat1 = Cat("Milo", 3)
cat2 = Cat("Luna", 7)
cat3 = Cat("Oliver", 5)


def find_oldest_cat(cat1, cat2, cat3):
	return max(cat1, cat2, cat3, key=lambda cat: cat.age)


oldest_cat = find_oldest_cat(cat1, cat2, cat3)
print(f"The oldest cat is {oldest_cat.name}, and is {oldest_cat.age} years old.")
