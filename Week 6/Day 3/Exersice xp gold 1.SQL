-- 1. Get a list of all rentals which are out (have not been returned).
-- Identification method: In the 'rental' table, films that have not been returned have a NULL value in the 'return_date' column.
SELECT 
    r.rental_id, 
    r.rental_date, 
    f.title 
FROM rental r
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
WHERE r.return_date IS NULL;

-- 2. Get a list of all customers who have not returned their rentals (grouped).
SELECT 
    c.customer_id, 
    c.first_name, 
    c.last_name, 
    COUNT(r.rental_id) AS unreturned_rentals_count
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
WHERE r.return_date IS NULL
GROUP BY c.customer_id, c.first_name, c.last_name;

-- 3. Get a list of all the Action films with Joe Swank.
-- Shortcut Answer: Yes! In the Pagila / DVD Rental database, there is a pre-existing view called 'film_list' 
-- or 'actor_info' that combines film categories and actor details.

-- Direct query joining tables:
SELECT 
    f.film_id, 
    f.title, 
    c.name AS category
FROM film f
JOIN film_actor fa ON f.film_id = fa.film_id
JOIN actor a ON fa.actor_id = a.actor_id
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
WHERE a.first_name = 'JOE' 
  AND a.last_name = 'SWANK'
  AND c.name = 'Action';

-- Shortcut query using the 'film_list' view:
SELECT title, category, actors
FROM film_list
WHERE category = 'Action' 
  AND actors ILIKE '%Joe Swank%';