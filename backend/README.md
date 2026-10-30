# RSVP backend setup

The site is a static Next.js export. The PHP endpoint is in `public/api/rsvps.php` so it is included in the exported site, but the web host must execute PHP files in `/api` rather than serve their source as text. The host also needs PHP 8.1+ with PDO PostgreSQL (`pdo_pgsql`) enabled and access to a PostgreSQL database. Use HTTPS for the site and endpoint.

## Database

For a new database, run `backend/schema.sql`. If the existing `rsvps` table was created with the earlier boolean `bringing_plus_one` column, run `backend/migrate_plus_one_to_text.sql` once in the Supabase SQL Editor before deploying the matching PHP endpoint. The migration preserves existing RSVP values and changes the field to constrained `yes`/`no` text.

Configure these environment variables in the PHP hosting environment; do not put database credentials in client-side code or committed files:

- `SUPABASE_DATABASE_URL` — the PostgreSQL connection URL from the Supabase dashboard. The endpoint requires TLS (`sslmode=require`) automatically. URL-encode any reserved characters in the username or password.
- `RSVP_ADMIN_PASSWORD` (a long, unique secret used to protect registration viewing)
- `SMTP_HOST` — `mail.adalacreations.com`
- `SMTP_PORT` — `465`
- `SMTP_ENCRYPTION` — `ssl` for implicit TLS on port 465 (`tls` selects STARTTLS)
- `SMTP_USERNAME` and `SMTP_PASSWORD` — SMTP authentication credentials
- `RSVP_FROM_ADDRESS` — `rsvp-tadiwa-elishama@adalacreations.com`
- `RSVP_FROM_NAME` — `RSVP T&E WEDDING`

The PHP process needs permission to read these variables. Keep the connection URL server-side; never use a `NEXT_PUBLIC_` variable for database credentials. If a real database password was shared in an unsafe place, rotate it in Supabase and update the server environment variable. The endpoint logs database errors server-side and returns actionable setup messages without exposing credentials.

After an RSVP has been saved, PHP sends a confirmation email using PHPMailer and the configured SMTP server. If SMTP is unavailable or misconfigured, the RSVP remains saved; the response and success page report that the confirmation email could not be sent, and the PHP error log records the mail failure.

## Frontend

By default the form and admin page use `/api/rsvps.php`. If PHP is hosted at another URL, set `NEXT_PUBLIC_RSVP_API_URL` to the endpoint URL at build time, then rebuild and deploy the static site. The external PHP host must allow requests from the site origin and return the required CORS headers for `POST` and `GET`, including the `X-Admin-Password` header. Keep this endpoint on HTTPS.

Guests submit RSVPs from the main page. Open `/rsvps.html` to view registrations; enter `RSVP_ADMIN_PASSWORD` to load them. The password stays in page memory and is sent only with the records request. CSV export is generated in the browser; the PDF button opens the browser print dialog, where the records can be saved as a PDF.

The table stores submitted contact details. Restrict database access and backups appropriately, and share the admin password only with trusted organizers.

## Local development

The Next.js dev server does not execute PHP. To test the same PHP endpoint locally against Supabase:

1. Copy `backend/.env.local.example` to `backend/.env.local` and set the Supabase URL, admin password, and SMTP credentials. This file is git-ignored; never commit or share it.
2. Copy `.env.local.example` to the project-root `.env.local`. It points the browser to the local PHP API and is git-ignored.
3. In one terminal, run `.\backend\start-local-api.ps1`. This starts PHP on `127.0.0.1:8001` and loads the PostgreSQL PDO extension for the PHP process without changing the system `php.ini`.
4. In a second terminal, run `pnpm dev` and open `http://localhost:3000`.

Before building the static site for deployment, run `composer install --working-dir=backend --no-dev --classmap-authoritative`; the build copies the required mailer dependency into `out/api/vendor`. The PHP host must allow outbound TLS SMTP connections to `mail.adalacreations.com:465`.

The local API only allows browser requests from `localhost:3000` and `127.0.0.1:3000`. If the local PHP process reports a database or mail error, compare its output with the VPS PHP-FPM log to isolate a host/network/credential issue. A submission made locally still writes to the configured Supabase database and sends a real email, so use clearly marked test records and valid test recipient addresses; delete test records afterward if needed.

## Troubleshooting

- `401 Incorrect admin password`: the PHP environment variable `RSVP_ADMIN_PASSWORD` does not match the password entered on `/rsvps.html`.
- `503 Database setup is incomplete`: set `SUPABASE_DATABASE_URL` in the PHP server environment and enable the PHP `pdo_pgsql` extension.
- `503 RSVP database request failed`: check that the URL and password are correct, the password is URL-encoded if it contains reserved characters, the PHP host can make outbound PostgreSQL TLS connections to Supabase, and `backend/schema.sql` has been run against the right Supabase project. Check the PHP server error log for the underlying error.
- RSVP succeeds but no confirmation email arrives: check all `SMTP_*` and `RSVP_FROM_*` settings, ensure the SMTP account permits sending as the configured from address, verify outbound port 465 is allowed, and inspect the PHP error log. A mail failure does not roll back or duplicate the saved RSVP.

Changes to PHP environment variables require restarting/reloading the PHP service if the hosting provider requires it. Deploy the updated `public/api/rsvps.php` after changing code.
