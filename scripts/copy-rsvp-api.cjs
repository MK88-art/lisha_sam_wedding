const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const source = path.join(root, "public", "api", "rsvps.php");
const outputDir = path.join(root, "out", "api");
const destination = path.join(outputDir, "rsvps.php");
const composerVendor = path.join(root, "backend", "vendor");
const outputVendor = path.join(outputDir, "vendor");

if (!fs.existsSync(source)) {
  console.error(`Missing RSVP source: ${source}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(root, "out"))) {
  console.error("Missing out directory. Run the Next.js build first.");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.copyFileSync(source, destination);

if (!fs.existsSync(path.join(composerVendor, "autoload.php"))) {
  console.error("Missing backend/vendor/autoload.php. Run composer install in backend first.");
  process.exit(1);
}

fs.cpSync(composerVendor, outputVendor, { recursive: true });

console.log("RSVP API and mailer dependencies copied to out/api");
