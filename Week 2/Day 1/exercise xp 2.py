class Dog:
	def __init__(self, name, height):
		self.name = name
		self.height = height

	def bark(self):
		print(f"{self.name} goes woof!")

	def jump(self):
		print(f"{self.name} jumps {self.height * 2} cm high!")


davids_dog = Dog("Rex", 50)
sarahs_dog = Dog("Buddy", 40)

for dog in (davids_dog, sarahs_dog):
	print(f"{dog.name} is {dog.height} cm tall.")
	dog.bark()
	dog.jump()

if davids_dog.height > sarahs_dog.height:
	print(f"{davids_dog.name} is taller than {sarahs_dog.name}.")
elif sarahs_dog.height > davids_dog.height:
	print(f"{sarahs_dog.name} is taller than {davids_dog.name}.")
else:
	print(f"{davids_dog.name} and {sarahs_dog.name} are the same height.")
