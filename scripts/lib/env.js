/**
 * Loads the project-root `.env.local` into `process.env` (side effect on
 * require), using Node's native `process.loadEnvFile` — no dependency.
 *
 * Precedence: variables already set in the shell (e.g. `KEY=x node ...`) WIN
 * over the file, matching the usual dotenv behavior. Missing file is a no-op.
 */

const fs = require('node:fs');
const path = require('node:path');

const ENV_PATH = path.join(__dirname, '..', '..', '.env.local');

if (fs.existsSync(ENV_PATH) && typeof process.loadEnvFile === 'function') {
  const preexisting = { ...process.env };
  try {
    process.loadEnvFile(ENV_PATH);
    // Restore shell/inline vars so they take precedence over the file.
    Object.assign(process.env, preexisting);
  } catch {
    // Malformed or unreadable file: leave process.env untouched.
  }
}
