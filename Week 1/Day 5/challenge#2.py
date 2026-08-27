print("Pattern 1:")
for row in range(1, 6, 2):
	spaces = (5 - row) // 2
	print(" " * spaces + "*" * row)

print("\nPattern 2:")
for row in range(1, 6):
	print(" " * (5 - row) + "*" * row)

print("\nPattern 3:")
for row in range(1, 6):
	print("*" * row)
for row in range(5, 0, -1):
	print(" " * (5 - row) + "*" * row)
