# RSVP backend setup

The site is a static Next.js export. The PHP endpoint is in `public/api/rsvps.php` so it is included in the exported site, but the web host must execute PHP files in `/api` rather than serve their source as text. The host also needs PHP 8.1+ with PDO PostgreSQL (`pdo_pgsql`) enabled and access to a PostgreSQL database. Use HTTPS for the site and endpoint.

## Database

Run `backend/schema.sql` against the PostgreSQL database before accepting RSVPs.

Configure these environment variables in the PHP hosting environment; do not put database credentials in client-side code or committed files:

- `SUPABASE_DATABASE_URL` — the PostgreSQL connection URL from the Supabase dashboard. The endpoint requires TLS (`sslmode=require`) automatically. URL-encode any reserved characters in the username or password.
- `RSVP_ADMIN_PASSWORD` (a long, unique secret used to protect registration viewing)

The PHP process needs permission to read these variables. Keep the connection URL server-side; never use a `NEXT_PUBLIC_` variable for database credentials. If a real database password was shared in an unsafe place, rotate it in Supabase and update the server environment variable. The endpoint logs database errors server-side and returns generic errors to visitors.

## Frontend

By default the form and admin page use `/api/rsvps.php`. If PHP is hosted at another URL, set `NEXT_PUBLIC_RSVP_API_URL` to the endpoint URL at build time, then rebuild and deploy the static site. The external PHP host must allow requests from the site origin and return the required CORS headers for `POST` and `GET`, including the `X-Admin-Password` header. Keep this endpoint on HTTPS.

Guests submit RSVPs from the main page. Open `/rsvps.html` to view registrations; enter `RSVP_ADMIN_PASSWORD` to load them. The password stays in page memory and is sent only with the records request. CSV export is generated in the browser; the PDF button opens the browser print dialog, where the records can be saved as a PDF.

The table stores submitted contact details. Restrict database access and backups appropriately, and share the admin password only with trusted organizers.
