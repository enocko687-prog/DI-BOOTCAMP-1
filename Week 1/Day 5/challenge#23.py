my_list = [2, 24, 12, 354, 233]  # Initial list of numbers.

# The outer loop chooses the position that will receive the next smallest value.
# range(4) gives i = 0, 1, 2, 3. The final element is already in place after these passes.
for i in range(len(my_list) - 1):
	minimum = i  # Start by assuming the value at index i is the smallest.

	# Compare the value at index i with every value to its right.
	for j in range(i + 1, len(my_list)):
		# If a smaller value is found, store its index in minimum.
		if my_list[j] < my_list[minimum]:
			minimum = j

			# Move the newly found smaller value into position i.
			if minimum != i:
				my_list[i], my_list[minimum] = my_list[minimum], my_list[i]

# Final output: [2, 12, 24, 233, 354]
print(my_list)


# Variable trace:
# Start: my_list = [2, 24, 12, 354, 233]
#
# i = 0: minimum starts at 0 (value 2).
#   j = 1, 2, 3, 4: no value is smaller than 2.
#   List remains [2, 24, 12, 354, 233].
#
# i = 1: minimum starts at 1 (value 24).
#   j = 2: 12 < 24, so minimum changes to 2.
#          Swap indexes 1 and 2.
#          List becomes [2, 12, 24, 354, 233].
#   j = 3, 4: no value is smaller than 12.
#
# i = 2: minimum starts at 2 (value 24).
#   j = 3, 4: no value is smaller than 24.
#   List remains [2, 12, 24, 354, 233].
#
# i = 3: minimum starts at 3 (value 354).
#   j = 4: 233 < 354, so minimum changes to 4.
#          Swap indexes 3 and 4.
#          List becomes [2, 12, 24, 233, 354].
#
# Purpose: compare values and swap smaller values toward the beginning,
# producing an ascendingly sorted list.
