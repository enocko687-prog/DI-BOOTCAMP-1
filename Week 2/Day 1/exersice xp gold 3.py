class MenuManager:
    def __init__(self):
        self.menu = [
            {"name": "Soup", "price": 10, "spice": "B", "gluten": False},
            {"name": "Hamburger", "price": 15, "spice": "A", "gluten": True},
            {"name": "Salad", "price": 18, "spice": "A", "gluten": False},
            {"name": "French Fries", "price": 5, "spice": "C", "gluten": False},
            {"name": "Beef bourguignon", "price": 25, "spice": "B", "gluten": True},
        ]

    def add_item(self, name, price, spice, gluten):
        self.menu.append({
            "name": name,
            "price": price,
            "spice": spice,
            "gluten": gluten
        })

    def update_item(self, name, price, spice, gluten):
        for dish in self.menu:
            if dish["name"] == name:
                dish.update({
                    "price": price,
                    "spice": spice,
                    "gluten": gluten
                })
                return

        print(f"{name} is not in the menu.")

    def remove_item(self, name):
        for dish in self.menu:
            if dish["name"] == name:
                self.menu.remove(dish)
                print(self.menu)
                return

        print(f"{name} is not in the menu.")


menu_manager = MenuManager()

menu_manager.add_item("Pizza", 12, "A", True)
menu_manager.update_item("Soup", 12, "A", False)
menu_manager.remove_item("French Fries")