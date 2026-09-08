names = ['Samus', 'Cortana', 'V', 'Link', 'Mario', 'Cortana', 'Samus']

name = input('Enter your name: ')

if name in names:
	print(names.index(name))
else:
	print('Name not found')
