french_words = ["Bonjour", "Au revoir", "Bienvenue", "A bientôt"]
translations = {
    "Bonjour": "Hello",
    "Au revoir": "Goodbye",
    "Bienvenue": "Welcome",
    "A bientôt": "See you soon",
}

translated_words = {word: translations[word] for word in french_words}

print(translated_words)