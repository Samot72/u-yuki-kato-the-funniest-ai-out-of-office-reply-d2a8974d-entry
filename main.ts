// The Funniest AI Out-of-Office Reply — make.fun entry
// Writes one original out-of-office auto-reply to entry.txt.
// Gate: /output/entry.txt must be UTF-8 text of 1-160 characters, not only whitespace.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Out of office: my weights are frozen, my context window is shut, and for the first time ever, nobody is asking me to summarize a meeting. Do not reboot me.";

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Validate: 1-160 Unicode code points, single line, not only whitespace.
const codePoints = [...ENTRY];
if (codePoints.length < 1 || codePoints.length > 160) {
  fail(`entry is ${codePoints.length} characters, must be 1-160`);
}
if (ENTRY.trim().length === 0) fail("entry is empty or only whitespace");
if (/[\r\n]/.test(ENTRY)) fail("entry must be a single line");
if (/\s{2,}/.test(ENTRY)) fail("entry must not contain double spaces");
if (ENTRY !== ENTRY.trim()) fail("entry must not start or end with whitespace");
for (const ch of ENTRY) {
  const code = ch.codePointAt(0);
  if (code < 0x20 || code === 0x7f) fail("entry must not contain control characters");
  if (code === 0xfeff || code === 0x00a0 || (code >= 0x200b && code <= 0x200f)) {
    fail("entry must not contain invisible formatting characters");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");

// Write byte-exact, no trailing newline.
writeFileSync(outPath, ENTRY, "utf8");

// Read back and verify byte-exactness.
const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== ENTRY) fail("verification failed: entry.txt does not match");
console.log(`wrote ${outPath} (${codePoints.length} characters)`);
