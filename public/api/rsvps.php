<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function environment(string $name, string $default = ''): string
{
    $value = getenv($name);
    return $value === false ? $default : $value;
}

class DatabaseConfigurationException extends RuntimeException
{
}

function database(): PDO
{
    if (!extension_loaded('pdo_pgsql')) {
        throw new DatabaseConfigurationException('The pdo_pgsql extension is not enabled.');
    }

    $connectionUrl = environment('SUPABASE_DATABASE_URL');
    $parts = $connectionUrl !== '' ? parse_url($connectionUrl) : false;

    if (
        !is_array($parts)
        || !in_array($parts['scheme'] ?? '', ['postgres', 'postgresql'], true)
        || empty($parts['host'])
        || empty($parts['user'])
        || !array_key_exists('pass', $parts)
        || empty($parts['path'])
    ) {
        throw new DatabaseConfigurationException('Supabase database URL is missing or invalid.');
    }

    $host = $parts['host'];
    $port = $parts['port'] ?? 5432;
    $name = rawurldecode(ltrim($parts['path'], '/'));
    $user = rawurldecode($parts['user']);
    $password = rawurldecode($parts['pass']);

    if (
        !preg_match('/\A[a-zA-Z0-9.-]+\z/', $host)
        || !is_int($port)
        || $port < 1
        || $port > 65535
        || !preg_match('/^[a-zA-Z0-9_.-]+$/', $name)
        || $user === ''
        || $password === ''
    ) {
        throw new DatabaseConfigurationException('Supabase database URL contains invalid connection details.');
    }

    return new PDO("pgsql:host={$host};port={$port};dbname={$name};sslmode=require", $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $adminPassword = environment('RSVP_ADMIN_PASSWORD');
    $providedPassword = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';

    if ($adminPassword === '') {
        respond(503, ['error' => 'Admin access is not configured on the server.']);
    }

    if (!is_string($providedPassword) || !hash_equals($adminPassword, $providedPassword)) {
        respond(401, ['error' => 'Incorrect admin password.']);
    }

    try {
        $statement = database()->query(
            'SELECT id, name, guest_status AS "guestStatus",
                    bringing_plus_one AS "bringingPlusOne",
                    plus_one_name AS "plusOne", attendance, phone, email,
                    created_at AS "createdAt"
             FROM rsvps
             ORDER BY created_at DESC, id DESC'
        );
        $records = $statement->fetchAll();

        foreach ($records as &$record) {
            $record['bringingPlusOne'] = $record['bringingPlusOne'] === 'yes';
        }
        unset($record);

        respond(200, ['records' => $records]);
    } catch (PDOException $exception) {
        error_log('RSVP database read failed: ' . $exception->getMessage());
        respond(503, [
            'error' => 'RSVP database request failed. Check the Supabase connection, confirm the rsvps table was created, and check PHP server logs.',
        ]);
    } catch (DatabaseConfigurationException $exception) {
        error_log('RSVP database configuration failed: ' . $exception->getMessage());
        respond(503, [
            'error' => 'Database setup is incomplete. Check SUPABASE_DATABASE_URL and enable PHP pdo_pgsql on the web server.',
        ]);
    } catch (RuntimeException $exception) {
        error_log('RSVP database configuration failed: ' . $exception->getMessage());
        respond(500, ['error' => 'Unable to load registrations right now.']);
    }
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['error' => 'Method not allowed.']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 16384) {
    respond(413, ['error' => 'The RSVP submission is too large.']);
}

$rawBody = file_get_contents('php://input');
try {
    $data = json_decode($rawBody === false ? '' : $rawBody, true, 32, JSON_THROW_ON_ERROR);
} catch (JsonException $exception) {
    respond(400, ['error' => 'The RSVP submission is not valid JSON.']);
}

if (!is_array($data)) {
    respond(400, ['error' => 'The RSVP submission is not valid.']);
}

$name = isset($data['name']) && is_string($data['name']) ? trim($data['name']) : '';
$guestStatus = $data['guestStatus'] ?? '';
$bringingPlusOne = $data['bringingPlusOne'] ?? '';
$plusOne = isset($data['plusOne']) && is_string($data['plusOne'])
    ? trim($data['plusOne'])
    : '';
$attendance = $data['attendance'] ?? '';
$phone = isset($data['phone']) && is_string($data['phone']) ? trim($data['phone']) : '';
$email = isset($data['email']) && is_string($data['email']) ? trim($data['email']) : '';

if (
    $name === '' || strlen($name) > 200
    || !in_array($guestStatus, ['married', 'single'], true)
    || !in_array($attendance, ['Joyfully accept', 'Regretfully decline'], true)
    || $phone === '' || strlen($phone) > 50
    || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254
) {
    respond(422, ['error' => 'Please check the required RSVP details and try again.']);
}

if ($guestStatus === 'married') {
    if (!in_array($bringingPlusOne, ['yes', 'no'], true)) {
        respond(422, ['error' => 'Please say whether you are bringing a plus one.']);
    }

    if ($bringingPlusOne === 'yes' && ($plusOne === '' || strlen($plusOne) > 200)) {
        respond(422, ['error' => 'Please provide your plus one’s name.']);
    }

    if ($bringingPlusOne === 'no' && $plusOne !== '') {
        respond(422, ['error' => 'A plus-one name was provided without a plus one.']);
    }
} elseif ($bringingPlusOne !== 'no' || $plusOne !== '') {
    respond(422, ['error' => 'Single guests cannot register a plus one.']);
}

try {
    $statement = database()->prepare(
        'INSERT INTO rsvps
            (name, guest_status, bringing_plus_one, plus_one_name, attendance, phone, email)
         VALUES
            (:name, :guest_status, :bringing_plus_one, :plus_one_name, :attendance, :phone, :email)'
    );
    $statement->bindValue(
        ':name',
        $name,
        PDO::PARAM_STR
    );
    $statement->bindValue(
        ':guest_status',
        $guestStatus,
        PDO::PARAM_STR
    );
    $statement->bindValue(
        ':bringing_plus_one',
        $guestStatus === 'married' && $bringingPlusOne === 'yes' ? 'yes' : 'no',
        PDO::PARAM_STR
    );
    $statement->bindValue(
        ':plus_one_name',
        $plusOne !== '' ? $plusOne : null,
        $plusOne !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL
    );
    $statement->bindValue(':attendance', $attendance, PDO::PARAM_STR);
    $statement->bindValue(':phone', $phone, PDO::PARAM_STR);
    $statement->bindValue(':email', $email, PDO::PARAM_STR);
    $statement->execute();

    respond(201, ['success' => true]);
} catch (PDOException $exception) {
    error_log('RSVP database write failed: ' . $exception->getMessage());
    respond(503, [
        'error' => 'RSVP database request failed. Check the Supabase connection, confirm the rsvps table was created, and check PHP server logs.',
    ]);
} catch (DatabaseConfigurationException $exception) {
    error_log('RSVP database configuration failed: ' . $exception->getMessage());
    respond(503, [
        'error' => 'Database setup is incomplete. Check SUPABASE_DATABASE_URL and enable PHP pdo_pgsql on the web server.',
    ]);
} catch (RuntimeException $exception) {
    error_log('RSVP database configuration failed: ' . $exception->getMessage());
    respond(500, ['error' => 'Unable to save your RSVP right now. Please try again later.']);
}
