text = "Hello, Python World!"

uppercase_count = sum(character.isupper() for character in text)
lowercase_count = sum(character.islower() for character in text)

print(f"Uppercase letters: {uppercase_count}")
