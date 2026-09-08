sales_data = [
	{"customer_id": 1, "product": "Smartphone", "price": 600, "quantity": 1, "date": "2023-04-03"},
	{"customer_id": 2, "product": "Laptop", "price": 1200, "quantity": 1, "date": "2023-04-04"},
	{"customer_id": 1, "product": "Laptop", "price": 1000, "quantity": 1, "date": "2023-04-05"},
	{"customer_id": 2, "product": "Smartphone", "price": 500, "quantity": 2, "date": "2023-04-06"},
	{"customer_id": 3, "product": "Headphones", "price": 150, "quantity": 4, "date": "2023-04-07"},
	{"customer_id": 3, "product": "Smartphone", "price": 550, "quantity": 1, "date": "2023-04-08"},
	{"customer_id": 1, "product": "Headphones", "price": 100, "quantity": 2, "date": "2023-04-09"},
]

product_sales = {}
customer_spending = {}
purchase_counts = {}
product_transaction_totals = {}
product_transaction_counts = {}
product_quantities = {}

for sale in sales_data:
	sale["total_price"] = sale["price"] * sale["quantity"]
	product = sale["product"]
	customer = sale["customer_id"]
	total_price = sale["total_price"]

	product_sales[product] = product_sales.get(product, 0) + total_price
	customer_spending[customer] = customer_spending.get(customer, 0) + total_price
	purchase_counts[customer] = purchase_counts.get(customer, 0) + 1
	product_transaction_totals[product] = product_transaction_totals.get(product, 0) + total_price
	product_transaction_counts[product] = product_transaction_counts.get(product, 0) + 1
	product_quantities[product] = product_quantities.get(product, 0) + sale["quantity"]

high_value_transactions = [
	sale for sale in sales_data if sale["total_price"] > 500
]
high_value_transactions.sort(key=lambda sale: sale["total_price"], reverse=True)

loyal_customers = [
	customer for customer, purchase_count in purchase_counts.items()
	if purchase_count > 1
]

average_transaction_value = {
	product: product_transaction_totals[product] / product_transaction_counts[product]
	for product in product_transaction_totals
}
most_popular_product = max(product_quantities, key=product_quantities.get)

print("Total sales by product:", product_sales)
print("Customer spending:", customer_spending)
print("Enhanced sales data:", sales_data)
print("High-value transactions:", high_value_transactions)
print("Purchase counts:", purchase_counts)
print("Loyal customers:", loyal_customers)
print("Average transaction value:", average_transaction_value)
print("Most popular product:", most_popular_product)
print("Marketing insights:")
print("- Reward loyal customers with targeted offers and loyalty points.")
print("- Promote the most popular product with bundles and complementary products.")
print("- Use high-value transactions to identify customers for premium campaigns.")
