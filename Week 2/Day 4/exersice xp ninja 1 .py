import json
import re


MENU_FILE = "restaurant_menu.json"
CONNECTION_WORDS = {"of", "and", "the", "with", "in", "on"}


def load_menu():
    with open(MENU_FILE, "r", encoding="utf-8") as file:
        menu = json.load(file)

    menu.setdefault("valentine_items", [])
    return menu


def save_menu(menu):
    with open(MENU_FILE, "w", encoding="utf-8") as file:
        json.dump(menu, file, indent=4)


def valid_item_name(name):
    if any(character.isdigit() for character in name):
        return False

    if name.count("e") + name.count("E") < 2:
        return False

    words = name.split()

    if not words or not words[0].startswith("V"):
        return False

    for word in words:
        if word in CONNECTION_WORDS:
            continue

        if not re.fullmatch(r"[A-Z][A-Za-z]*(?:-[a-z]+)?", word):
            return False

    return True


def valid_price(price):
    return re.fullmatch(r"\d{2},14", price) is not None


def display_heart():
    print(" **   ** ")
    print("*********")
    print(" ******* ")
    print("  *****  ")
    print("   ***   ")
    print("    *    ")


def show_menu(menu):
    display_heart()

    print("\nRestaurant menu:")
    for item in menu["items"]:
        print(f"- {item['name']}: {item['price']}")

    print("\nValentine's menu:")
    for item in menu["valentine_items"]:
        print(f"- {item['name']}: {item['price']}")


def main():
    menu = load_menu()

    name = input("Enter a Valentine's item name: ").strip()
    price = input("Enter the price in the format XX,14: ").strip()

    if valid_item_name(name) and valid_price(price):
        menu["valentine_items"].append({
            "name": name,
            "price": price
        })
        save_menu(menu)
        print("Valentine's item added successfully.")
    else:
        print("Invalid item name or price.")

    show_menu(menu)


if __name__ == "__main__":
    main()
    {
    "items": [],
    "valentine_items": []
}