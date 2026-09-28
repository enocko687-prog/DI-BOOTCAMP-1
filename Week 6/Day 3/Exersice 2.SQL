-- 1. Use UPDATE to change the language of some films.
UPDATE film
SET language_id = 2
WHERE film_id IN (1, 2, 3);

-- 2. Foreign keys defined for the customer table and insertion behavior:
/* 
Foreign keys in the customer table:
- store_id (references store.store_id)
- address_id (references address.address_id)

Impact on INSERT:
When inserting a new record into 'customer', the values provided for 'store_id' 
and 'address_id' MUST already exist in the referenced 'store' and 'address' tables. 
If an invalid/non-existent ID is provided, PostgreSQL will throw a Foreign Key Violation error.
*/

-- 3. Drop customer_review table:
DROP TABLE customer_review;
/*
Explanation:
This is an easy step because no other tables reference customer_review with a foreign key constraint. 
However, if other dependent objects existed, using DROP TABLE customer_review CASCADE would be required.
*/

-- 4. Find out how many rentals are still outstanding (not returned yet).
SELECT COUNT(*) AS outstanding_rentals
FROM rental
WHERE return_date IS NULL;

-- 5. Find the 30 most expensive movies which are outstanding.
SELECT DISTINCT 
    f.film_id, 
    f.title, 
    f.replacement_cost
FROM rental r
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
WHERE r.return_date IS NULL
ORDER BY f.replacement_cost DESC
LIMIT 30;

-- 6. Help friend find the 4 movies:

-- 1st Film: Sumo wrestler + Penelope Monroe
SELECT f.film_id, f.title, f.description
FROM film f
JOIN film_actor fa ON f.film_id = fa.film_id
JOIN actor a ON fa.actor_id = a.actor_id
WHERE a.first_name = 'PENELOPE' 
  AND a.last_name = 'MONROE'
  AND f.description ILIKE '%sumo wrestler%';

-- 2nd Film: Short documentary (< 60 mins), rated "R"
SELECT f.film_id, f.title, f.length, f.rating, c.name AS category
FROM film f
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
WHERE c.name = 'Documentary'
  AND f.length < 60
  AND f.rating = 'R';

-- 3rd Film: Rented by Matthew Mahan, paid > $4.00, returned between July 28 & Aug 1, 2005
SELECT DISTINCT f.film_id, f.title, p.amount, r.return_date
FROM rental r
JOIN customer c ON r.customer_id = c.customer_id
JOIN payment p ON r.rental_id = p.rental_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
WHERE c.first_name = 'MATTHEW' 
  AND c.last_name = 'MAHAN'
  AND p.amount > 4.00
  AND r.return_date BETWEEN '2005-07-28' AND '2005-08-01 23:59:59';

-- 4th Film: Watched by Matthew Mahan, has "boat" in title/description, high replacement cost
SELECT DISTINCT f.film_id, f.title, f.description, f.replacement_cost
FROM rental r
JOIN customer c ON r.customer_id = c.customer_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
WHERE c.first_name = 'MATTHEW' 
  AND c.last_name = 'MAHAN'
  AND (f.title ILIKE '%boat%' OR f.description ILIKE '%boat%')
ORDER BY f.replacement_cost DESC;