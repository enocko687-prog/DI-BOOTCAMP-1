SELECT DISTINCT 
    f.film_id, 
    f.title, 
    f.rating
FROM film f
JOIN inventory i ON f.film_id = i.film_id
LEFT JOIN rental r ON i.inventory_id = r.inventory_id
WHERE f.rating IN ('G', 'PG')
  AND (
      r.rental_id IS NULL 
      OR r.return_date IS NOT NULL
  )
  AND i.inventory_id NOT IN (
      -- Exclude any inventory item currently checked out
      SELECT inventory_id 
      FROM rental 
      WHERE return_date IS NULL
  )
ORDER BY f.title;
CREATE TABLE children_waiting_list (
    waiting_id SERIAL PRIMARY KEY,
    film_id INT NOT NULL REFERENCES film(film_id) ON DELETE CASCADE,
    child_name VARCHAR(100) NOT NULL,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Step A: Insert sample waitlist entries to test
INSERT INTO children_waiting_list (film_id, child_name) 
VALUES 
    (1, 'Alice Smith'),
    (1, 'Bob Johnson'),
    (1, 'Charlie Brown'),
    (2, 'David Miller'),
    (3, 'Emma Davis'),
    (3, 'Frank Wilson');

-- Step B: Retrieve the total number of children waiting for each film
SELECT 
    f.film_id,
    f.title,
    f.rating,
    COUNT(w.waiting_id) AS total_waiting
FROM children_waiting_list w
JOIN film f ON w.film_id = f.film_id
GROUP BY f.film_id, f.title, f.rating
ORDER BY total_waiting DESC;