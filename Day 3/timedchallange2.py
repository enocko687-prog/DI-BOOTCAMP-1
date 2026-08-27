x = int(input("Enter the number: "))

divisor_sum = sum(divisor for divisor in range(1, x) if x % divisor == 0)
print(divisor_sum == x)
