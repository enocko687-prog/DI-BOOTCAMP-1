items = {
	"banana": 4,
	"apple": 2,
	"orange": 1.5,
	"pear": 3,
}

for item, price in items.items():
	print(f"The price of a {item} is ${price}.")

items = {
	"banana": {"price": 4, "stock": 10},
	"apple": {"price": 2, "stock": 5},
	"orange": {"price": 1.5, "stock": 24},
	"pear": {"price": 3, "stock": 1},
}

total_cost = 0
for item_details in items.values():
	total_cost += item_details["price"] * item_details["stock"]

print(f"The cost of buying everything in stock is ${total_cost:.2f}.")
