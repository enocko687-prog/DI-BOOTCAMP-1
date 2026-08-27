people = []

for _ in range(5):
    name = input("Name: ")
    age = int(input("Age: "))
    score = int(input("Score: "))
    people.append((name, age, score))

people.sort(key=lambda person: (person[0], person[1], person[2]))

print(people)