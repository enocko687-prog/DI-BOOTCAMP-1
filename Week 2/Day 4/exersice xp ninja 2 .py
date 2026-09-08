import json
import random


class Character:
    ABILITIES = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ]

    def __init__(self, name, age):
        self.name = name
        self.age = age
        self.attributes = {
            ability: self.roll_attribute()
            for ability in self.ABILITIES
        }

    @staticmethod
    def roll_attribute():
        dice = [random.randint(1, 6) for _ in range(4)]
        return sum(sorted(dice)[1:])

    def to_dict(self):
        return {
            "name": self.name,
            "age": self.age,
            "attributes": self.attributes,
        }


class Game:
    def __init__(self, number_of_players):
        self.number_of_players = number_of_players
        self.characters = []

    def create_characters(self):
        for player in range(1, self.number_of_players + 1):
            print(f"\nPlayer {player}")
            name = input("Character name: ").strip()

            while True:
                try:
                    age = int(input("Character age: "))
                    if age > 0:
                        break
                    print("Age must be positive.")
                except ValueError:
                    print("Please enter a valid age.")

            self.characters.append(Character(name, age))

    def export_json(self, filename="characters.json"):
        with open(filename, "w", encoding="utf-8") as file:
            json.dump(
                [character.to_dict() for character in self.characters],
                file,
                indent=4,
            )

    def export_txt(self, filename="characters.txt"):
        with open(filename, "w", encoding="utf-8") as file:
            for character in self.characters:
                file.write(f"Character: {character.name}\n")
                file.write(f"Age: {character.age}\n")
                file.write("Attributes:\n")

                for ability, score in character.attributes.items():
                    file.write(f"  {ability.title()}: {score}\n")

                file.write("\n")

    def export_files(self):
        self.export_json()
        self.export_txt()
        print("Characters exported to characters.json and characters.txt.")


def main():
    while True:
        try:
            number_of_players = int(input("How many players are playing? "))

            if number_of_players > 0:
                break

            print("Enter a positive number.")
        except ValueError:
            print("Please enter a valid number.")

    game = Game(number_of_players)
    game.create_characters()
    game.export_files()


if __name__ == "__main__":
    main()