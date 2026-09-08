"""
Exercise 1: OOP Quiz

Class:
A blueprint that defines attributes and methods for objects.

Instance:
A specific object created from a class.

Encapsulation:
Bundling data and methods together and controlling access to the data.

Abstraction:
Hiding implementation details and exposing only essential features.

Inheritance:
Allowing one class to reuse or extend another class's attributes and methods.

Multiple inheritance:
When a class inherits from more than one parent class.

Polymorphism:
The same method name behaving differently for different objects.

MRO:
Method Resolution Order; the order Python follows when searching for
methods and attributes in an inheritance hierarchy.
"""


import random


class Card:
    SUITS = ("Hearts", "Diamonds", "Clubs", "Spades")
    VALUES = ("A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K")

    def __init__(self, suit, value):
        if suit not in self.SUITS:
            raise ValueError("Invalid suit.")
        if value not in self.VALUES:
            raise ValueError("Invalid card value.")

        self.suit = suit
        self.value = value

    def __str__(self):
        return f"{self.value} of {self.suit}"

    def __repr__(self):
        return str(self)


class Deck:
    def __init__(self):
        self.cards = [
            Card(suit, value)
            for suit in Card.SUITS
            for value in Card.VALUES
        ]

    def shuffle(self):
        if len(self.cards) != 52:
            raise ValueError("The deck must contain all 52 cards.")
        random.shuffle(self.cards)

    def deal(self):
        if not self.cards:
            raise ValueError("There are no cards left in the deck.")
        return self.cards.pop()


deck = Deck()
deck.shuffle()

print(f"Cards remaining: {len(deck.cards)}")
print(f"Dealt card: {deck.deal()}")
print(f"Cards remaining: {len(deck.cards)}")