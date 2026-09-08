my_name = "GitHub Copilot"
user_name = input("Enock Brighton Ochieng? ")

if user_name.strip().casefold() == my_name.casefold():
	print("We have the same name! The naming department must be very creative.")
else:
	print(f"Nice to meet you, {user_name}! My name is {my_name}, so we are not name twins today.")
