BEGIN;

CREATE UNIQUE INDEX rsvps_email_normalized_unique
    ON rsvps (lower(btrim(email)));

CREATE UNIQUE INDEX rsvps_phone_digits_unique
    ON rsvps (regexp_replace(phone, '[^0-9]', '', 'g'))
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') <> '';

CREATE UNIQUE INDEX rsvps_name_normalized_unique
    ON rsvps (lower(regexp_replace(btrim(name), '\s+', ' ', 'g')));

COMMIT;
