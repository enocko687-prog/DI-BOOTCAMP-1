import math

C = 50
H = 30

values = input("Enter comma-separated values for D: ").split(",")
results = []

for value in values:
	D = float(value.strip())
	Q = math.sqrt((2 * C * D) / H)
	results.append(str(round(Q)))

print(",".join(results))
