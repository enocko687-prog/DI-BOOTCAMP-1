import re
import string
from collections import Counter


class Text:
    def __init__(self, text):
        self.text = text

    def _words(self):
        return self.text.lower().split()

    def word_frequency(self, word):
        count = self._words().count(word.lower())
        return count if count > 0 else None

    def most_common_word(self):
        words = self._words()
        if not words:
            return None
        return Counter(words).most_common(1)[0][0]

    def unique_words(self):
        return sorted(set(self._words()))

    @classmethod
    def from_file(cls, file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return cls(file.read())


class TextModification(Text):
    STOP_WORDS = {
        "a", "an", "and", "are", "as", "at", "be", "by",
        "for", "from", "in", "is", "it", "of", "on", "or",
        "that", "the", "this", "to", "was", "with",
    }

    def remove_punctuation(self):
        translation_table = str.maketrans("", "", string.punctuation)
        self.text = self.text.translate(translation_table)
        return self.text

    def remove_stop_words(self):
        words = [
            word for word in self.text.split()
            if word.lower() not in self.STOP_WORDS
        ]
        self.text = " ".join(words)
        return self.text

    def remove_special_characters(self):
        self.text = re.sub(r"[^a-zA-Z0-9\s]", "", self.text)
        return self.text


text = Text(
    "The cat is sitting on the mat. "
    "The cat is happy."
)

print("Frequency:", text.word_frequency("cat"))
print("Most common word:", text.most_common_word())
print("Unique words:", text.unique_words())

modified_text = TextModification(
    "Hello, world! This text has #special characters."
)

print(modified_text.remove_punctuation())
print(modified_text.remove_stop_words())
print(modified_text.remove_special_characters())