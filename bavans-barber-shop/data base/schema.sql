CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(160),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES customers(id)
        ON DELETE CASCADE,

    service_id INTEGER NOT NULL
        REFERENCES services(id),

    appointment_date DATE NOT NULL,

    appointment_time TIME NOT NULL,

    status VARCHAR(20) DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'completed',
                'cancelled',
                'no_show'
            )
        ),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (
        appointment_date,
        appointment_time
    )
);

CREATE TABLE IF NOT EXISTS shop_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,

    shop_name VARCHAR(160) NOT NULL,

    phone VARCHAR(30),

    whatsapp VARCHAR(30),

    address TEXT,

    opening_hours JSONB,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_requests (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    request_details TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    house_number VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'contacted',
                'completed',
                'cancelled'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO services
(name, description, price, duration_minutes, sort_order)
SELECT
    'Classic Haircut',
    'Clean and professional haircut.',
    300,
    30,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM services
    WHERE name = 'Classic Haircut'
);

INSERT INTO services
(name, description, price, duration_minutes, sort_order)
SELECT
    'Fade & Styling',
    'Sharp fade and modern styling.',
    400,
    40,
    2
WHERE NOT EXISTS (
    SELECT 1
    FROM services
    WHERE name = 'Fade & Styling'
);

INSERT INTO services
(name, description, price, duration_minutes, sort_order)
SELECT
    'Beard Grooming',
    'Beard trimming and shaping.',
    200,
    25,
    3
WHERE NOT EXISTS (
    SELECT 1
    FROM services
    WHERE name = 'Beard Grooming'
);

INSERT INTO services
(name, description, price, duration_minutes, sort_order)
SELECT
    'Hair & Beard Combo',
    'Complete haircut and beard grooming.',
    500,
    55,
    4
WHERE NOT EXISTS (
    SELECT 1
    FROM services
    WHERE name = 'Hair & Beard Combo'
);

INSERT INTO services
(name, description, price, duration_minutes, sort_order)
SELECT
    'Kids Haircut',
    'Neat haircut for children.',
    200,
    30,
    5
WHERE NOT EXISTS (
    SELECT 1
    FROM services
    WHERE name = 'Kids Haircut'
);

UPDATE services
SET price = CASE name
    WHEN 'Classic Haircut' THEN 300
    WHEN 'Fade & Styling' THEN 400
    WHEN 'Beard Grooming' THEN 200
    WHEN 'Hair & Beard Combo' THEN 500
    WHEN 'Kids Haircut' THEN 200
END
WHERE name IN (
    'Classic Haircut',
    'Fade & Styling',
    'Beard Grooming',
    'Hair & Beard Combo',
    'Kids Haircut'
);

INSERT INTO shop_settings
(
    shop_name,
    phone,
    whatsapp,
    address
)
VALUES
(
    'Teacher Bevan''s Barber Shop',
    '2547XXXXXXXX',
    '2547XXXXXXXX',
    'Runda View, opposite Githogoro Main Stage, Nairobi, Kenya'
)
ON CONFLICT (id) DO NOTHING;