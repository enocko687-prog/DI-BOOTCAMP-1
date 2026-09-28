-- 1. Create Customer and Customer Profile tables
CREATE TABLE Customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

CREATE TABLE Customer_profile (
    id SERIAL PRIMARY KEY,
    isLoggedIn BOOLEAN DEFAULT false,
    customer_id INT UNIQUE REFERENCES Customer(id) ON DELETE CASCADE
);

-- 2. Insert Customers
INSERT INTO Customer (first_name, last_name)
VALUES 
    ('John', 'Doe'),
    ('Jerome', 'Lalu'),
    ('Lea', 'Rive');

-- 3. Insert Customer Profiles using subqueries
-- John is loggedIn
INSERT INTO Customer_profile (isLoggedIn, customer_id)
VALUES (
    true, 
    (SELECT id FROM Customer WHERE first_name = 'John' AND last_name = 'Doe')
);

-- Jerome is not logged in
INSERT INTO Customer_profile (isLoggedIn, customer_id)
VALUES (
    false, 
    (SELECT id FROM Customer WHERE first_name = 'Jerome' AND last_name = 'Lalu')
);

-- 4. Joins and Queries:

-- Query 1: The first_name of the LoggedIn customers
SELECT c.first_name 
FROM Customer c
INNER JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = true;

-- Query 2: All customers first_name and isLoggedIn status (even without a profile)
SELECT c.first_name, cp.isLoggedIn
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id;

-- Query 3: The number of customers that are not LoggedIn (includes false + NULL profiles)
SELECT COUNT(*) AS not_loggedin_count
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = false OR cp.isLoggedIn IS NULL;
-- 1. Create Book table
CREATE TABLE Book (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL
);

-- 2. Insert Books
INSERT INTO Book (title, author)
VALUES 
    ('Alice In Wonderland', 'Lewis Carroll'),
    ('Harry Potter', 'J.K Rowling'),
    ('To kill a mockingbird', 'Harper Lee');

-- 3. Create Student table with CHECK constraint on age
CREATE TABLE Student (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    age INT CHECK (age <= 15)
);

-- 4. Insert Students
INSERT INTO Student (name, age)
VALUES 
    ('John', 12),
    ('Lera', 11),
    ('Patrick', 10),
    ('Bob', 14);

-- 5. Create Library Junction Table
CREATE TABLE Library (
    book_fk_id INT REFERENCES Book(book_id) ON DELETE CASCADE ON UPDATE CASCADE,
    student_fk_id INT REFERENCES Student(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    borrowed_date DATE,
    PRIMARY KEY (book_fk_id, student_fk_id)
);

-- 6. Add 4 records using subqueries
-- John borrowed Alice In Wonderland (15/02/2022)
INSERT INTO Library (student_fk_id, book_fk_id, borrowed_date)
VALUES (
    (SELECT student_id FROM Student WHERE name = 'John'),
    (SELECT book_id FROM Book WHERE title = 'Alice In Wonderland'),
    '2022-02-15'
);

-- Bob borrowed To kill a mockingbird (03/03/2021)
INSERT INTO Library (student_fk_id, book_fk_id, borrowed_date)
VALUES (
    (SELECT student_id FROM Student WHERE name = 'Bob'),
    (SELECT book_id FROM Book WHERE title = 'To kill a mockingbird'),
    '2021-03-03'
);

-- Lera borrowed Alice In Wonderland (23/05/2021)
INSERT INTO Library (student_fk_id, book_fk_id, borrowed_date)
VALUES (
    (SELECT student_id FROM Student WHERE name = 'Lera'),
    (SELECT book_id FROM Book WHERE title = 'Alice In Wonderland'),
    '2021-05-23'
);

-- Bob borrowed Harry Potter (12/08/2021)
INSERT INTO Library (student_fk_id, book_fk_id, borrowed_date)
VALUES (
    (SELECT student_id FROM Student WHERE name = 'Bob'),
    (SELECT book_id FROM Book WHERE title = 'Harry Potter'),
    '2021-08-12'
);

-- 7. Display the Data:

-- Select all columns from the junction table
SELECT * FROM Library;

-- Select student name and title of borrowed books
SELECT s.name AS student_name, b.title AS book_title
FROM Library l
JOIN Student s ON l.student_fk_id = s.student_id
JOIN Book b ON l.book_fk_id = b.book_id;

-- Select average age of children who borrowed 'Alice In Wonderland'
SELECT ROUND(AVG(s.age), 2) AS average_age
FROM Library l
JOIN Student s ON l.student_fk_id = s.student_id
JOIN Book b ON l.book_fk_id = b.book_id
WHERE b.title = 'Alice In Wonderland';

-- Delete a student from Student table
DELETE FROM Student WHERE name = 'John';

/*
What happened in the junction table?
Because student_fk_id is defined with ON DELETE CASCADE, deleting 'John' from the 
Student table automatically removes all corresponding rows for John in the Library table.
*/