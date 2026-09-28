-- 1. Get a list of all the languages, from the language table.
SELECT * FROM language;

-- 2. Get a list of all films joined with their languages (film title, description, and language name).
SELECT 
    f.title, 
    f.description, 
    l.name AS language_name
FROM film f
INNER JOIN language l 
    ON f.language_id = l.language_id;

-- 3. Get all languages, even if there are no films in those languages.
SELECT 
    f.title, 
    f.description, 
    l.name AS language_name
FROM language l
LEFT JOIN film f 
    ON l.language_id = f.language_id;

-- 4. Create a new table called new_film with columns: id, name. Add some new films.
CREATE TABLE new_film (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO new_film (name) 
VALUES 
    ('Inception'),
    ('Interstellar'),
    ('The Matrix');

-- 5. Create a new table called customer_review with ON DELETE CASCADE.
CREATE TABLE customer_review (
    review_id SERIAL PRIMARY KEY,
    film_id INT REFERENCES new_film(id) ON DELETE CASCADE,
    language_id INT REFERENCES language(language_id),
    title VARCHAR(255) NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 10),
    review_text TEXT,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add 2 movie reviews linked to valid objects in the other tables.
INSERT INTO customer_review (film_id, language_id, title, score, review_text)
VALUES 
    (1, 1, 'Mind Bending!', 9, 'A masterpiece of cinema with incredible visuals and depth.'),
    (2, 1, 'Emotional Journey', 10, 'Visually stunning and deeply moving story about humanity.');

-- 7. Delete a film that has a review from the new_film table.
DELETE FROM new_film WHERE id = 1;

-- Explanation for Q7:
-- Because the film_id foreign key constraint was defined with ON DELETE CASCADE, 
-- deleting film_id = 1 from new_film automatically deletes any associated rows 
-- in the customer_review table.