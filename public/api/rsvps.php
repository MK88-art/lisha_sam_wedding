<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');

function allowedOrigins(): array
{
    return array_values(array_filter(array_map(
        'trim',
        explode(',', environment('RSVP_ALLOWED_ORIGINS'))
    )));
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = allowedOrigins();

if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Password');
    header('Access-Control-Max-Age: 600');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    if ($origin === '' || !in_array($origin, $allowedOrigins, true)) {
        respond(403, ['error' => 'Origin is not allowed.']);
    }

    http_response_code(204);
    exit;
}

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

ini_set('log_errors', '1');
$rsvpErrorLog = environment('RSVP_ERROR_LOG');
if ($rsvpErrorLog !== '' && ini_set('error_log', $rsvpErrorLog) === false) {
    error_log('Unable to configure the RSVP error log path.');
}

class DatabaseConfigurationException extends RuntimeException
{
}

function sendConfirmationEmail(array $rsvp): void
{
    $fromAddress = environment('RSVP_FROM_ADDRESS', 'rsvp-tadiwa-elishama@adalacreations.com');
    $smtpUsername = environment('SMTP_USERNAME', $fromAddress);
    $smtpPassword = environment('SMTP_PASSWORD');
    $smtpHost = environment('SMTP_HOST', 'mail.adalacreations.com');
    $smtpPort = filter_var(environment('SMTP_PORT', '465'), FILTER_VALIDATE_INT);
    $smtpEncryption = strtolower(environment('SMTP_ENCRYPTION', 'ssl'));

    if (
        $smtpPassword === ''
        || $smtpUsername === ''
        || !filter_var($fromAddress, FILTER_VALIDATE_EMAIL)
        || $smtpPort === false
        || $smtpPort < 1
        || $smtpPort > 65535
        || !in_array($smtpEncryption, ['ssl', 'tls'], true)
    ) {
        throw new RuntimeException('SMTP configuration is missing or invalid.');
    }

    $autoload = __DIR__ . '/vendor/autoload.php';
    if (!is_file($autoload)) {
        $autoload = dirname(__DIR__, 2) . '/backend/vendor/autoload.php';
    }
    if (!is_file($autoload)) {
        throw new RuntimeException('PHPMailer dependencies are not installed.');
    }
    require_once $autoload;

    $mailer = new PHPMailer\PHPMailer\PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = $smtpHost;
    $mailer->Port = $smtpPort;
    $mailer->SMTPAuth = true;
    $mailer->Username = $smtpUsername;
    $mailer->Password = $smtpPassword;
    $mailer->SMTPSecure = $smtpEncryption === 'ssl'
        ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mailer->Timeout = 15;
    $mailer->CharSet = PHPMailer\PHPMailer\PHPMailer::CHARSET_UTF8;
    $mailer->setFrom(
        $fromAddress,
        environment('RSVP_FROM_NAME', 'RSVP T&E WEDDING')
    );
    $mailer->addAddress($rsvp['email'], $rsvp['name']);
    $mailer->isHTML(true);
    if ($rsvp['attendance'] === 'Joyfully accept') {
        $mailer->Subject = "You're on the guest list! 🎉";
        $message = "We're thrilled to confirm your RSVP for the wedding. We can't wait to celebrate this special day with you!";
    } else {
        $mailer->Subject = 'RSVP Update Received';
        $message = "Thank you for letting us know. We are sorry you won't be able to make it, but you will certainly be in our thoughts on the big day!";
    }

    $mailer->Body = '<p>' . htmlspecialchars(
        $message,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    ) . '</p>';
    $mailer->AltBody = $message;
    $mailer->send();
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
$phoneDigits = preg_replace('/\D+/', '', $phone);

if (
    $name === '' || strlen($name) > 200
    || !in_array($guestStatus, ['married', 'single'], true)
    || !in_array($attendance, ['Joyfully accept', 'Regretfully decline'], true)
    || $phoneDigits === null || strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15
    || strlen($phone) > 50
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
    $pdo = database();
    $duplicateCheck = $pdo->prepare(
        "SELECT
            EXISTS (
                SELECT 1 FROM rsvps
                WHERE lower(btrim(email)) = lower(btrim(:email))
            ) AS email_exists,
            EXISTS (
                SELECT 1 FROM rsvps
                WHERE regexp_replace(phone, '[^0-9]', '', 'g') = :phone_digits
            ) AS phone_exists,
            EXISTS (
                SELECT 1 FROM rsvps
                WHERE lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))
                    = lower(regexp_replace(btrim(:name), '\\s+', ' ', 'g'))
            ) AS name_exists"
    );
    $duplicateCheck->execute([
        ':email' => $email,
        ':phone_digits' => $phoneDigits,
        ':name' => $name,
    ]);
    $duplicates = $duplicateCheck->fetch();
    $duplicateFields = [];

    foreach ([
        'email_exists' => 'email address',
        'phone_exists' => 'phone number',
        'name_exists' => 'full name',
    ] as $field => $label) {
        if (
            $duplicates[$field] === true
            || $duplicates[$field] === 't'
            || $duplicates[$field] === '1'
        ) {
            $duplicateFields[] = $label;
        }
    }

    if ($duplicateFields !== []) {
        respond(409, [
            'error' => 'An RSVP with this ' . implode(', ', $duplicateFields)
                . ' already exists. Please contact the organizers if you need to update it.',
        ]);
    }

    $statement = $pdo->prepare(
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
    $bringingPlusOneValue = $guestStatus === 'married' && $bringingPlusOne === 'yes'
        ? 'yes'
        : 'no';
    $statement->bindValue(':bringing_plus_one', $bringingPlusOneValue, PDO::PARAM_STR);
    $statement->bindValue(
        ':plus_one_name',
        $plusOne !== '' ? $plusOne : null,
        $plusOne !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL
    );
    $statement->bindValue(':attendance', $attendance, PDO::PARAM_STR);
    $statement->bindValue(':phone', $phone, PDO::PARAM_STR);
    $statement->bindValue(':email', $email, PDO::PARAM_STR);
    $statement->execute();

    $emailSent = true;
    try {
        sendConfirmationEmail([
            'name' => $name,
            'bringingPlusOne' => $bringingPlusOneValue,
            'plusOne' => $plusOne,
            'attendance' => $attendance,
            'email' => $email,
        ]);
    } catch (Throwable $exception) {
        $emailSent = false;
        error_log(
            'RSVP confirmation email failed (' . get_class($exception) . '): '
            . $exception->getMessage()
        );
    }

    respond(201, ['success' => true, 'emailSent' => $emailSent]);
} catch (PDOException $exception) {
    if ($exception->getCode() === '23505') {
        respond(409, [
            'error' => 'An RSVP with one or more matching details was just submitted. Please contact the organizers if you need to update it.',
        ]);
    }

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
