import re


def return_numbers(text):
    return "".join(re.findall(r"\d", text))


print(return_numbers("k5k3q2g5z6x9bn"))