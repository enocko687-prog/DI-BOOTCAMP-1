birthdays = {
	"Alice": "1995/03/14",
	"Bob": "1990/07/22",
	"Charlie": "1988/11/05",
	"Dana": "2001/01/30",
	"Eli": "1997/09/18",
}

new_name = input("Enter a person's name to add: ").strip()
new_birthday = input("Enter this person's birthday (YYYY/MM/DD): ").strip()
birthdays[new_name] = new_birthday

name = input("Enter a person's name to look up: ").strip()

if name in birthdays:
	print(f"{name}'s birthday is {birthdays[name]}.")
else:
	print(f"Sorry, we don't have the birthday information for {name}")
