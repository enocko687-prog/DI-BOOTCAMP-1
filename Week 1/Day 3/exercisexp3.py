brand = {
	"name": "Zara",
	"creation_date": 1975,
	"creator_name": "Amancio Ortega Gaona",
	"type_of_clothes": ["men", "women", "children", "home"],
	"international_competitors": ["Gap", "H&M", "Benetton"],
	"number_stores": 7000,
	"major_color": {
		"France": ["blue"],
		"Spain": ["red"],
		"US": ["pink", "green"],
	},
}

brand["number_stores"] = 2
print(f"Zara's clients can shop for {', '.join(brand['type_of_clothes'])} clothing and home products.")

brand["country_creation"] = "Spain"
if "international_competitors" in brand:
	brand["international_competitors"].append("Desigual")

del brand["creation_date"]

print("Last international competitor:", brand["international_competitors"][-1])
print("Major colors in the US:", brand["major_color"]["US"])
print("Number of keys:", len(brand))
print("Keys:", list(brand.keys()))

more_on_zara = {
	"creation_date": 1975,
	"number_stores": 2,
}
brand.update(more_on_zara)
print("Merged brand dictionary:", brand)
