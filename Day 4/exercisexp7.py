import random


def get_random_temp(season=None):
	if season == "winter":
		return random.uniform(-10, 16)
	if season == "spring":
		return random.uniform(10, 23)
	if season == "summer":
		return random.uniform(24, 40)
	if season == "autumn":
		return random.uniform(10, 23)
	return random.uniform(-10, 40)


def get_season(month):
	if month in (12, 1, 2):
		return "winter"
	if month in (3, 4, 5):
		return "spring"
	if month in (6, 7, 8):
		return "summer"
	return "autumn"


def give_advice(temperature):
	if temperature < 0:
		return "Brrr, that's freezing! Wear some extra layers today."
	if temperature < 16:
		return "Quite chilly! Don't forget your coat."
	if temperature <= 23:
		return "Nice weather."
	if temperature <= 32:
		return "A bit warm, stay hydrated."
	return "It's really hot! Stay cool."


def main(month=None):
	season = get_season(month) if month is not None else None
	temperature = get_random_temp(season)
	print(f"The temperature right now is {temperature:.1f} degrees Celsius.")
	print(give_advice(temperature))


main()
