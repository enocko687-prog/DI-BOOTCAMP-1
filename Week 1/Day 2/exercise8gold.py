numbers = input("Enter comma-separated numbers: ").split(",")
numbers = [number.strip() for number in numbers]
numbers_tuple = tuple(numbers)

print(numbers)
print(numbers_tuple)
['34', '67', '55', '33', '12', '98']
('34', '67', '55', '33', '12', '98')