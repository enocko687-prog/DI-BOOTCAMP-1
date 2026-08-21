words_input = input("Enter comma-separated words: ")
words = words_input.split(",")
words.sort()

sorted_words = ",".join(words)
print(sorted_words)

# Example: without,hello,bag,world -> bag,hello,without,world
