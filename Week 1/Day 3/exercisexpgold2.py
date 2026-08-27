birthdays = {
	"Alice": "1995/03/14",
	"Bob": "1990/07/22",
	"Charlie": "1988/11/05",
	"Dana": "2001/01/30",
	"Eli": "1997/09/18",
}

print("People in the birthday dictionary:")
for person in birthdays:
	print(person)

person = input("Enter a person's name: ").strip()

if person in birthdays:
	print(f"{person}'s birthday is {birthdays[person]}.")
else:
	print(f"Sorry, we don't have the birthday information for {person}")
