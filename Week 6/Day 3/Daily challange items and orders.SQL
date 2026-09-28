-- Step 1: Create product_orders table
CREATE TABLE product_orders (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create items table with One-to-Many relationship (order_id FK)
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    order_id INT REFERENCES product_orders(order_id) ON DELETE CASCADE
);

-- Step 3: Create function to return total price for a given order ID
CREATE OR REPLACE FUNCTION get_order_total(p_order_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC(10, 2);
BEGIN
    SELECT COALESCE(SUM(price), 0)
    INTO v_total
    FROM items
    WHERE order_id = p_order_id;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;
-- Step 1: Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Step 2: Add user_id foreign key to product_orders (One-to-Many: User -> Orders)
ALTER TABLE product_orders
ADD COLUMN user_id INT REFERENCES users(user_id) ON DELETE CASCADE;

-- Step 3: Function to get total price for a given order of a given user
CREATE OR REPLACE FUNCTION get_user_order_total(p_user_id INT, p_order_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_total NUMERIC(10, 2);
BEGIN
    SELECT COALESCE(SUM(i.price), 0)
    INTO v_total
    FROM items i
    JOIN product_orders po ON i.order_id = po.order_id
    WHERE po.user_id = p_user_id 
      AND po.order_id = p_order_id;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;
-- Insert Test Users
INSERT INTO users (username, email) 
VALUES 
    ('alice_w', 'alice@example.com'),
    ('bob_m', 'bob@example.com');

-- Insert Test Orders
INSERT INTO product_orders (user_id) VALUES (1), (2);

-- Insert Test Items
INSERT INTO items (item_name, price, order_id) 
VALUES 
    ('Laptop Stand', 29.99, 1),
    ('Wireless Mouse', 19.50, 1),
    ('Mechanical Keyboard', 85.00, 1),
    ('USB-C Cable', 12.00, 2);

-- Test 1: Get total for Order #1 (Expected output: 134.49)
SELECT get_order_total(1) AS order_1_total;

-- Test 2: Get total for User #1, Order #1 (Expected output: 134.49)
SELECT get_user_order_total(1, 1) AS user_1_order_1_total;

-- Test 3: Get total for User #2, Order #1 (Expected output: 0.00 since Order 1 doesn't belong to User 2)
SELECT get_user_order_total(2, 1) AS invalid_user_order_total;