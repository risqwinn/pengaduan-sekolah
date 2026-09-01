import crypto from "crypto";

const CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no confusing chars (0,1,O,I,L)

function randomSegment(len) {
  let out = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += CHARS[bytes[i] % CHARS.length];
  return out;
}

// Generates public-facing token like LAP-7K9M-42PX (FR-03)
export function generatePublicToken() {
  return `LAP-${randomSegment(4)}-${randomSegment(4)}`;
}

// Only the hash of the token is ever stored (see BRD section 12)
export function hashToken(token) {
  return crypto.createHash("sha256").update(token.trim().toUpperCase()).digest("hex");
}
