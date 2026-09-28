-- 1. Number of stores and their city and country location.
SELECT 
    s.store_id, 
    city.city, 
    country.country
FROM store s
JOIN address a ON s.address_id = a.address_id
JOIN city ON a.city_id = city.city_id
JOIN country ON city.country_id = country.country_id;


-- 2 & 3. Total viewing time per store (excluding inventory items currently out/unreturned).
SELECT 
    s.store_id,
    SUM(f.length) AS total_minutes,
    ROUND(SUM(f.length) / 60.0, 2) AS total_hours,
    ROUND(SUM(f.length) / 1440.0, 2) AS total_days
FROM store s
JOIN inventory i ON s.store_id = i.store_id
JOIN film f ON i.film_id = f.film_id
WHERE i.inventory_id NOT IN (
    SELECT inventory_id 
    FROM rental 
    WHERE return_date IS NULL
)
GROUP BY s.store_id;


-- 4. List of all customers located in the cities where stores are located.
SELECT DISTINCT 
    c.customer_id, 
    c.first_name, 
    c.last_name, 
    ci.city
FROM customer c
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
WHERE ci.city_id IN (
    SELECT a2.city_id 
    FROM store s2 
    JOIN address a2 ON s2.address_id = a2.address_id
);


-- 5. List of all customers located in the countries where stores are located.
SELECT DISTINCT 
    c.customer_id, 
    c.first_name, 
    c.last_name, 
    co.country
FROM customer c
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
JOIN country co ON ci.country_id = co.country_id
WHERE co.country_id IN (
    SELECT co2.country_id 
    FROM store s2 
    JOIN address a2 ON s2.address_id = a2.address_id
    JOIN city ci2 ON a2.city_id = ci2.city_id
    JOIN country co2 ON ci2.country_id = co2.country_id
);


-- 6 & 7. Create safe list & calculate total viewing time (minutes, hours, days) for General vs Safe list.

-- Create a table with CHECK constraint for the Safe List:
CREATE TABLE safe_films (
    film_id INT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    length INT,
    CONSTRAINT chk_safe_title_desc CHECK (
        title NOT ILIKE '%beast%' AND title NOT ILIKE '%monster%' AND
        title NOT ILIKE '%ghost%' AND title NOT ILIKE '%dead%' AND
        title NOT ILIKE '%zombie%' AND title NOT ILIKE '%undead%' AND
        description NOT ILIKE '%beast%' AND description NOT ILIKE '%monster%' AND
        description NOT ILIKE '%ghost%' AND description NOT ILIKE '%dead%' AND
        description NOT ILIKE '%zombie%' AND description NOT ILIKE '%undead%'
    )
);

-- Populate safe_films filtering out 'Horror' category and matching text keywords:
INSERT INTO safe_films (film_id, title, description, length)
SELECT f.film_id, f.title, f.description, f.length
FROM film f
LEFT JOIN film_category fc ON f.film_id = fc.film_id
LEFT JOIN category c ON fc.category_id = c.category_id
WHERE (c.name IS NULL OR c.name != 'Horror')
  AND f.title NOT ILIKE '%beast%' AND f.title NOT ILIKE '%monster%'
  AND f.title NOT ILIKE '%ghost%' AND f.title NOT ILIKE '%dead%'
  AND f.title NOT ILIKE '%zombie%' AND f.title NOT ILIKE '%undead%'
  AND f.description NOT ILIKE '%beast%' AND f.description NOT ILIKE '%monster%'
  AND f.description NOT ILIKE '%ghost%' AND f.description NOT ILIKE '%dead%'
  AND f.description NOT ILIKE '%zombie%' AND f.description NOT ILIKE '%undead%';

-- Query to calculate viewing times in minutes, hours, and days for BOTH General and Safe lists:
SELECT 
    'General List' AS catalog_type,
    SUM(length) AS total_minutes,
    ROUND(SUM(length) / 60.0, 2) AS total_hours,
    ROUND(SUM(length) / 1440.0, 2) AS total_days
FROM film

UNION ALL

SELECT 
    'Safe List' AS catalog_type,
    SUM(length) AS total_minutes,
    ROUND(SUM(length) / 60.0, 2) AS total_hours,
    ROUND(SUM(length) / 1440.0, 2) AS total_days
FROM safe_films;