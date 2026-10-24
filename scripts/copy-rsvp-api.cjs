const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const source = path.join(root, "public", "api", "rsvps.php");
const outputDir = path.join(root, "out", "api");
const destination = path.join(outputDir, "rsvps.php");

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

console.log("RSVP API copied to out/api/rsvps.php");
