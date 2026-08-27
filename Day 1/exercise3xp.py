# Guesses:
# 5 < 3          -> False
# 3 == 3         -> True
# 3 == "3"       -> False
# "3" > 3        -> TypeError
# "Hello" == "hello" -> False

print(5 < 3)
print(3 == 3)
print(3 == "3")

try:
	print("3" > 3)
except TypeError as error:
	print(type(error).__name__)

print("Hello" == "hello")
