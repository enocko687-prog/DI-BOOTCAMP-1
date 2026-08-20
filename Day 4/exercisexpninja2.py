MORSE_CODE = {
	"A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".",
	"F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---",
	"K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---",
	"P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
	"U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--",
	"Z": "--..",
	"0": "-----", "1": ".----", "2": "..---", "3": "...--",
	"4": "....-", "5": ".....", "6": "-....", "7": "--...",
	"8": "---..", "9": "----.",
}
ENGLISH_CODE = {code: letter for letter, code in MORSE_CODE.items()}


def english_to_morse(text):
	words = text.upper().split()
	return "/".join(" ".join(MORSE_CODE[letter] for letter in word) for word in words)


def morse_to_english(code):
	words = code.strip().split("/")
	return " ".join(
		"".join(ENGLISH_CODE[letter_code] for letter_code in word.split())
		for word in words
	)


message = "Hello World"
morse_message = english_to_morse(message)
print(morse_message)
print(morse_to_english(morse_message))
