BEGIN;

ALTER TABLE rsvps
    DROP CONSTRAINT IF EXISTS rsvps_plus_one_matches_status;

ALTER TABLE rsvps
    ALTER COLUMN bringing_plus_one DROP DEFAULT;

ALTER TABLE rsvps
    ALTER COLUMN bringing_plus_one TYPE VARCHAR(3)
    USING CASE WHEN bringing_plus_one THEN 'yes' ELSE 'no' END;

ALTER TABLE rsvps
    ALTER COLUMN bringing_plus_one SET DEFAULT 'no';

ALTER TABLE rsvps
    ADD CONSTRAINT rsvps_bringing_plus_one_valid
        CHECK (bringing_plus_one IN ('yes', 'no')),
    ADD CONSTRAINT rsvps_plus_one_matches_status CHECK (
        (
            guest_status = 'married'
            AND (
                (
                    bringing_plus_one = 'yes'
                    AND plus_one_name IS NOT NULL
                    AND BTRIM(plus_one_name) <> ''
                )
                OR (
                    bringing_plus_one = 'no'
                    AND plus_one_name IS NULL
                )
            )
        )
        OR (
            guest_status = 'single'
            AND bringing_plus_one = 'no'
            AND plus_one_name IS NULL
        )
    );

COMMIT;
