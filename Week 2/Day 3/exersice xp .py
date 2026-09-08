import string
import random


all_letters = string.ascii_letters
random_string = ""

for _ in range(5):
    random_string += random.choice(all_letters)

print(random_string)