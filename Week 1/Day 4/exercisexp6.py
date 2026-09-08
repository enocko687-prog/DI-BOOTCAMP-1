magician_names = ["Harry Houdini", "David Blaine", "Criss Angel"]


def show_magicians(names):
	for name in names:
		print(name)


def make_great(names):
	for index in range(len(names)):
		names[index] = f"{names[index]} the Great"


make_great(magician_names)
show_magicians(magician_names)
