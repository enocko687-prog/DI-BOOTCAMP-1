import random
import string


SPECIAL_CHARACTERS = "!@#$%^_&*"


def generate_password(length):
    characters = (
        string.ascii_lowercase
        + string.ascii_uppercase
        + string.digits
        + SPECIAL_CHARACTERS
    )

    password = [
        random.choice(string.ascii_lowercase),
        random.choice(string.ascii_uppercase),
        random.choice(string.digits),
        random.choice(SPECIAL_CHARACTERS),
    ]

    password += [
        random.choice(characters)
        for _ in range(length - 4)
    ]

    random.shuffle(password)
    return "".join(password)


def test_password(password, expected_length):
    assert len(password) == expected_length
    assert any(character.isdigit() for character in password)
    assert any(character.islower() for character in password)
    assert any(character.isupper() for character in password)
    assert any(character in SPECIAL_CHARACTERS for character in password)


def run_tests():
    for _ in range(100):
        length = random.randint(6, 30)
        password = generate_password(length)
        test_password(password, length)

    print("All 100 password tests passed!")


run_tests()


while True:
    try:
        length = int(input("Enter a password length between 6 and 30: "))

        if 6 <= length <= 30:
            break

        print("Please enter a number between 6 and 30.")

    except ValueError:
        print("Please enter a valid number.")


password = generate_password(length)

print(f"Your password is: {password}")
print("Keep your password in a safe place!")