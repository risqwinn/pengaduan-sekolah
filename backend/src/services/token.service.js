import { db } from "../db.js";
import { generatePublicToken, hashToken } from "../utils/token.js";

// Keep generating until we get a hash that doesn't collide (astronomically rare, but safe)
export function createUniquePublicToken() {
  let token, tokenHash, exists;
  do {
    token = generatePublicToken();
    tokenHash = hashToken(token);
    exists = db.prepare("SELECT id FROM complaints WHERE public_token_hash = ?").get(tokenHash);
  } while (exists);
  return { token, tokenHash };
}

export function findComplaintByToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  return db.prepare("SELECT * FROM complaints WHERE public_token_hash = ?").get(tokenHash);
}
