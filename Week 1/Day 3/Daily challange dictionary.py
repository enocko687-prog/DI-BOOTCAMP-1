def letter_indices(word):
	"""Return each letter and the positions where it appears in a word."""
	indices = {}
	for index, letter in enumerate(word):
		if letter in indices:
			indices[letter].append(index)
		else:
			indices[letter] = [index]
	return indices


def price_to_integer(price):
	"""Convert a dollar price such as '$1,000' into an integer."""
	return int(price.replace('$', '').replace(',', ''))


def affordable_items(items_purchase, wallet):
	"""Buy affordable items in dictionary order and return them alphabetically."""
	remaining_money = price_to_integer(wallet)
	basket = []

	for item, price in items_purchase.items():
		item_price = price_to_integer(price)
		if item_price <= remaining_money:
			basket.append(item)
			remaining_money -= item_price

	return sorted(basket) if basket else 'Nothing'


def main():
	word = input('Enter a word: ')
	print(letter_indices(word))

	items_purchase = {
		'Water': '$1',
		'Bread': '$3',
		'TV': '$1,000',
		'Fertilizer': '$20',
	}
	wallet = '$300'
	print(affordable_items(items_purchase, wallet))


if __name__ == '__main__':
	main()
