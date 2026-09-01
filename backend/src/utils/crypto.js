import crypto from "crypto";

// AES-256-GCM encryption for complaint content (BRD: encrypted_content field)
function getKey() {
  const raw = process.env.CONTENT_ENCRYPTION_KEY || "";
  return crypto.createHash("sha256").update(raw).digest(); // normalize to 32 bytes
}

export function encryptContent(plainText) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptContent(stored) {
  const [ivB64, tagB64, dataB64] = stored.split(":");
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
