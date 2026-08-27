import random


class Faker:
    """Minimal local replacement that requires no external package."""

    def name(self):
        return random.choice(("Alex Smith", "Jamie Brown", "Taylor Jones"))

    def address(self):
        return f"{random.randint(1, 999)} Main Street"

    def language_code(self):
        return random.choice(("en_US", "fr_FR", "es_ES"))


fake = Faker()
users = []


def add_users(number_of_users):
    for _ in range(number_of_users):
        user = {
            "name": fake.name(),
            "address": fake.address(),
            "language_code": fake.language_code(),
        }
        users.append(user)


add_users(5)
print(users)