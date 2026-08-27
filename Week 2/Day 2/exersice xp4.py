class Person:
    def __init__(self, first_name, age):
        self.first_name = first_name
        self.age = age
        self.last_name = ""

    def is_18(self):
        return self.age >= 18


class Family:
    def __init__(self, last_name):
        self.last_name = last_name
        self.members = []

    def born(self, first_name, age):
        person = Person(first_name, age)
        person.last_name = self.last_name
        self.members.append(person)

    def check_majority(self, first_name):
        for member in self.members:
            if member.first_name == first_name:
                if member.is_18():
                    print(
                        "You are over 18, your parents Jane and John "
                        "accept that you will go out with your friends"
                    )
                else:
                    print("Sorry, you are not allowed to go out with your friends.")
                return

        print(f"{first_name} is not a member of the family.")

    def family_presentation(self):
        print(f"Family {self.last_name}:")
        for member in self.members:
            print(f"{member.first_name}, {member.age} years old")


family = Family("Smith")
family.born("Jane", 45)
family.born("John", 47)
family.born("Alice", 20)
family.born("Tom", 16)

family.check_majority("Alice")
family.check_majority("Tom")
family.family_presentation()