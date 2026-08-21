def is_palindrome(text):
	text = text.lower()
	return text == text[::-1]


print(is_palindrome("radar"))
print(is_palindrome("John"))
