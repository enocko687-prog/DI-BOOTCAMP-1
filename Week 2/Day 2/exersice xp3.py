import random


class Dog:
    def __init__(self, name, age, weight):
        self.name = name
        self.age = age
        self.weight = weight


class PetDog(Dog):
    def __init__(self, name, age, weight):
        super().__init__(name, age, weight)
        self.trained = False

    def bark(self):
        """Return this dog's bark."""
        return f"{self.name} barks: Woof!"

    def train(self):
        print(self.bark())
        self.trained = True

    def play(self, *args):
        dog_names = ", ".join(dog.name for dog in args)
        print(f"{self.name}, {dog_names} all play together")

    def do_a_trick(self):
        if self.trained:
            tricks = [
                "does a barrel roll",
                "stands on his back legs",
                "shakes your hand",
                "plays dead",
            ]
            print(f"{self.name} {random.choice(tricks)}")


dog1 = PetDog("Fido", 2, 10)
dog2 = PetDog("Buddy", 3, 15)
dog3 = PetDog("Max", 4, 20)

dog1.train()
dog1.play(dog2, dog3)
dog1.do_a_trick()
dog2.do_a_trick()