manufacturers_text = "Volkswagen, Toyota, Ford Motor, Honda, Chevrolet"
manufacturers = [manufacturer.strip() for manufacturer in manufacturers_text.split(",")]

print(f"There are {len(manufacturers)} manufacturers.")
print("Manufacturers in reverse order:", sorted(manufacturers, reverse=True))

with_o = sum("o" in manufacturer.lower() for manufacturer in manufacturers)
without_i = sum("i" not in manufacturer.lower() for manufacturer in manufacturers)
print(f"Manufacturers with the letter 'o': {with_o}")
print(f"Manufacturers without the letter 'i': {without_i}")

duplicate_manufacturers = [
	"Honda",
	"Volkswagen",
	"Toyota",
	"Ford Motor",
	"Honda",
	"Chevrolet",
	"Toyota",
]
unique_manufacturers = list(dict.fromkeys(duplicate_manufacturers))
print("Companies without duplicates:", ", ".join(unique_manufacturers))
print(f"There are {len(unique_manufacturers)} companies without duplicates.")

reversed_names = [manufacturer[::-1] for manufacturer in sorted(manufacturers)]
print("Ascending order with reversed names:", reversed_names)
