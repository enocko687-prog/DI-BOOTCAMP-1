users = ["Mickey", "Minnie", "Donald", "Ariel", "Pluto"]

characters_to_indices = {character: index for index, character in enumerate(users)}
indices_to_characters = {index: character for index, character in enumerate(users)}
sorted_characters_to_indices = {
	character: index for index, character in enumerate(sorted(users))
}

print("Characters to indices:", characters_to_indices)
print("Indices to characters:", indices_to_characters)
print("Sorted characters to indices:", sorted_characters_to_indices)
