CREATE TABLE IF NOT EXISTS rsvps (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    guest_status VARCHAR(10) NOT NULL CHECK (guest_status IN ('married', 'single')),
    bringing_plus_one VARCHAR(3) NOT NULL DEFAULT 'no'
        CHECK (bringing_plus_one IN ('yes', 'no')),
    plus_one_name VARCHAR(200),
    attendance VARCHAR(32) NOT NULL CHECK (
        attendance IN ('Joyfully accept', 'Regretfully decline')
    ),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT rsvps_plus_one_matches_status CHECK (
        (
            guest_status = 'married'
            AND (
                (bringing_plus_one = 'yes' AND plus_one_name IS NOT NULL AND BTRIM(plus_one_name) <> '')
                OR (bringing_plus_one = 'no' AND plus_one_name IS NULL)
            )
        )
        OR (
            guest_status = 'single'
            AND bringing_plus_one = 'no'
            AND plus_one_name IS NULL
        )
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS rsvps_email_normalized_unique
    ON rsvps (lower(btrim(email)));

CREATE UNIQUE INDEX IF NOT EXISTS rsvps_phone_digits_unique
    ON rsvps (regexp_replace(phone, '[^0-9]', '', 'g'))
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') <> '';

CREATE UNIQUE INDEX IF NOT EXISTS rsvps_name_normalized_unique
    ON rsvps (lower(regexp_replace(btrim(name), '\s+', ' ', 'g')));
