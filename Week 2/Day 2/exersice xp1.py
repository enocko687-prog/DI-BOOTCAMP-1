class Pets:
    def __init__(self, animals):
        self.animals = animals

    def walk(self):
        for animal in self.animals:
            print(animal.walk())


class Cat:
    is_lazy = True

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def walk(self):
        return f"{self.name} is just walking around"


class Bengal(Cat):
    def sing(self, sounds):
        return sounds


class Chartreux(Cat):
    def sing(self, sounds):
        return sounds


class Siamese(Cat):
    pass


bengal = Bengal("Luna", 3)
chartreux = Chartreux("Milo", 5)
siamese = Siamese("Nala", 2)

all_cats = [bengal, chartreux, siamese]

sara_pets = Pets(all_cats)
sara_pets.walk()