birthdays = {
	"Alice": "1995/03/14",
	"Bob": "1990/07/22",
	"Charlie": "1988/11/05",
	"Dana": "2001/01/30",
	"Eli": "1997/09/18",
}

print("Welcome to the birthday lookup!")
print("You can look up the birthdays of the people in the list!")

name = input("Whose birthday would you like to look up? ").strip()
birthday = birthdays.get(name)

if birthday:
	print(f"{name}'s birthday is {birthday}.")
else:
	print(f"Sorry, {name} is not in the birthday list.")
