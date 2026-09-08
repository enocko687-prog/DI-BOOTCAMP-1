import random


class Game:
    ITEMS = ("rock", "paper", "scissors")

    def get_user_item(self):
        while True:
            choice = input("Choose rock, paper, or scissors: ").lower().strip()

            if choice in self.ITEMS:
                return choice

            print("Invalid choice. Try again.")

    def get_computer_item(self):
        return random.choice(self.ITEMS)

    def get_game_result(self, user_item, computer_item):
        if user_item == computer_item:
            return "draw"

        winning_choices = {
            "rock": "scissors",
            "paper": "rock",
            "scissors": "paper",
        }

        return "win" if winning_choices[user_item] == computer_item else "loss"

    def play(self):
        user_item = self.get_user_item()
        computer_item = self.get_computer_item()
        result = self.get_game_result(user_item, computer_item)

        print(f"You chose: {user_item}")
        print(f"Computer chose: {computer_item}")
        print(f"Result: {result}")

        return result