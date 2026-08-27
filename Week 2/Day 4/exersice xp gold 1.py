import json


class MenuManager:
    def __init__(self):
        with open("restaurant_menu.json", "r", encoding="utf-8") as file:
            self.menu = json.load(file)

    def add_item(self, name, price):
        self.menu["items"].append({"name": name, "price": price})

    def remove_item(self, name):
        for index, item in enumerate(self.menu["items"]):
            if item["name"].lower() == name.lower():
                del self.menu["items"][index]
                return True
        return False

    def save_to_file(self):
        with open("restaurant_menu.json", "w", encoding="utf-8") as file:
            json.dump(self.menu, file, indent=4)


manager = None


def load_manager():
    global manager
    manager = MenuManager()


def show_restaurant_menu():
    print("\nRestaurant menu:")
    for item in manager.menu["items"]:
        print(f"- {item['name']}: ${item['price']:.2f}")


def add_item_to_menu():
    name = input("Item name: ")
    price = float(input("Item price: "))
    manager.add_item(name, price)
    print("Item was added successfully.")


def remove_item_from_menu():
    name = input("Item to remove: ")

    if manager.remove_item(name):
        print("Item was removed successfully.")
    else:
        print("Error: item was not found.")


def show_user_menu():
    while True:
        print("\n1. Show restaurant menu")
        print("2. Add item")
        print("3. Remove item")
        print("4. Exit")

        choice = input("Choose an option: ")

        try:
            if choice == "1":
                show_restaurant_menu()
            elif choice == "2":
                add_item_to_menu()
            elif choice == "3":
                remove_item_from_menu()
            elif choice == "4":
                manager.save_to_file()
                print("Menu saved. Goodbye!")
                break
            else:
                print("Invalid choice.")
        except ValueError:
            print("Please enter a valid price.")


if __name__ == "__main__":
    load_manager()
    show_user_menu()