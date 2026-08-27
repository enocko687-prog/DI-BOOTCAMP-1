CURRENT_YEAR = 2026
CURRENT_MONTH = 8
CURRENT_DAY = 20


def get_age(year, month, day):
	age = CURRENT_YEAR - year
	if (CURRENT_MONTH, CURRENT_DAY) < (month, day):
		age -= 1
	return age


def can_retire(gender, date_of_birth):
	year, month, day = (int(value) for value in date_of_birth.split("/"))
	age = get_age(year, month, day)
	retirement_age = 67 if gender == "m" else 62
	return age >= retirement_age


gender = input("Enter your gender (m/f): ").strip().lower()
date_of_birth = input("Enter your date of birth (yyyy/mm/dd): ").strip()

if can_retire(gender, date_of_birth):
	print("You can retire.")
else:
	print("You cannot retire yet.")
