$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path -LiteralPath $environmentFile)) {
    throw "Create backend\.env.local from backend\.env.local.example and add your local Supabase URL and admin password."
}

$requiredVariables = @(
    "SUPABASE_DATABASE_URL",
    "RSVP_ADMIN_PASSWORD"
)

foreach ($line in Get-Content -LiteralPath $environmentFile) {
    if ($line -match '^\s*(SUPABASE_DATABASE_URL|RSVP_ADMIN_PASSWORD|SMTP_HOST|SMTP_PORT|SMTP_ENCRYPTION|SMTP_USERNAME|SMTP_PASSWORD|RSVP_FROM_ADDRESS|RSVP_FROM_NAME)\s*=\s*(.*?)\s*$') {
        $name = $Matches[1]
        $value = $Matches[2].Trim()
        if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        } elseif ($value.Length -ge 2 -and $value.StartsWith("'") -and $value.EndsWith("'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

foreach ($name in $requiredVariables) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, "Process"))) {
        throw "Set $name in backend\.env.local before starting the local API."
    }
}

$phpCheck = 'exit(extension_loaded("pdo_pgsql") ? 0 : 1);'
& php -d extension=pdo_pgsql -r $phpCheck
if ($LASTEXITCODE -ne 0) {
    throw "PHP could not load pdo_pgsql. Check that the extension DLL matches your PHP version."
}

[Environment]::SetEnvironmentVariable(
    "RSVP_ALLOWED_ORIGINS",
    "http://127.0.0.1:3000,http://localhost:3000",
    "Process"
)

Set-Location -LiteralPath $projectRoot
Write-Host "Local RSVP API listening at http://127.0.0.1:8001/api/rsvps.php"
Write-Host "Keep this terminal open while testing the site."
& php -d extension=pdo_pgsql -S 127.0.0.1:8001 -t (Join-Path $projectRoot "public")
