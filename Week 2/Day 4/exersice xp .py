import random


WORD_FILE = "words.txt"


def get_words_from_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read().split()


def get_random_sentence(length):
    words = get_words_from_file(WORD_FILE)
    sentence = [random.choice(words) for _ in range(length)]
    return " ".join(sentence).lower()


def main():
    print("This program generates a random sentence.")

    try:
        length = int(input("Enter a sentence length between 2 and 20: "))

        if not 2 <= length <= 20:
            print("Length must be between 2 and 20.")
            return

        print(get_random_sentence(length))

    except ValueError:
        print("Please enter a valid integer.")


if __name__ == "__main__":
    main()