import re


paragraph = (
	"Four score and seven years ago our fathers brought forth on this continent, "
	"a new nation, conceived in Liberty, and dedicated to the proposition that all "
	"men are created equal. Now we are engaged in a great civil war, testing whether "
	"that nation, or any nation so conceived and so dedicated, can long endure."
)

sentences = re.findall(r"[^.!?]+(?:[.!?]+|$)", paragraph)
words = re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)*", paragraph)
unique_words = {word.casefold() for word in words}
non_whitespace_characters = len(re.sub(r"\s", "", paragraph))

print(f"Characters: {len(paragraph)}")
print(f"Sentences: {len(sentences)}")
print(f"Words: {len(words)}")
print(f"Unique words: {len(unique_words)}")
print(f"Non-whitespace characters: {non_whitespace_characters}")
print(f"Average words per sentence: {len(words) / len(sentences):.2f}")
print(f"Non-unique words: {len(words) - len(unique_words)}")
