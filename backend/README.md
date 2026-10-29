# RSVP backend setup

The site is a static Next.js export. The PHP endpoint is in `public/api/rsvps.php` so it is included in the exported site, but the web host must execute PHP files in `/api` rather than serve their source as text. The host also needs PHP 8.1+ with PDO PostgreSQL (`pdo_pgsql`) enabled and access to a PostgreSQL database. Use HTTPS for the site and endpoint.

## Database

For a new database, run `backend/schema.sql`. If the existing `rsvps` table was created with the earlier boolean `bringing_plus_one` column, run `backend/migrate_plus_one_to_text.sql` once in the Supabase SQL Editor before deploying the matching PHP endpoint. The migration preserves existing RSVP values and changes the field to constrained `yes`/`no` text.

Configure these environment variables in the PHP hosting environment; do not put database credentials in client-side code or committed files:

- `SUPABASE_DATABASE_URL` — the PostgreSQL connection URL from the Supabase dashboard. The endpoint requires TLS (`sslmode=require`) automatically. URL-encode any reserved characters in the username or password.
- `RSVP_ADMIN_PASSWORD` (a long, unique secret used to protect registration viewing)

The PHP process needs permission to read these variables. Keep the connection URL server-side; never use a `NEXT_PUBLIC_` variable for database credentials. If a real database password was shared in an unsafe place, rotate it in Supabase and update the server environment variable. The endpoint logs database errors server-side and returns actionable setup messages without exposing credentials.

## Frontend

By default the form and admin page use `/api/rsvps.php`. If PHP is hosted at another URL, set `NEXT_PUBLIC_RSVP_API_URL` to the endpoint URL at build time, then rebuild and deploy the static site. The external PHP host must allow requests from the site origin and return the required CORS headers for `POST` and `GET`, including the `X-Admin-Password` header. Keep this endpoint on HTTPS.

Guests submit RSVPs from the main page. Open `/rsvps.html` to view registrations; enter `RSVP_ADMIN_PASSWORD` to load them. The password stays in page memory and is sent only with the records request. CSV export is generated in the browser; the PDF button opens the browser print dialog, where the records can be saved as a PDF.

The table stores submitted contact details. Restrict database access and backups appropriately, and share the admin password only with trusted organizers.

## Troubleshooting

- `401 Incorrect admin password`: the PHP environment variable `RSVP_ADMIN_PASSWORD` does not match the password entered on `/rsvps.html`.
- `503 Database setup is incomplete`: set `SUPABASE_DATABASE_URL` in the PHP server environment and enable the PHP `pdo_pgsql` extension.
- `503 RSVP database request failed`: check that the URL and password are correct, the password is URL-encoded if it contains reserved characters, the PHP host can make outbound PostgreSQL TLS connections to Supabase, and `backend/schema.sql` has been run against the right Supabase project. Check the PHP server error log for the underlying error.

Changes to PHP environment variables require restarting/reloading the PHP service if the hosting provider requires it. Deploy the updated `public/api/rsvps.php` after changing code.
