// Utility script: create the default admin (if missing) OR reset its
// password to match whatever is currently in backend/.env.
//
// Why this exists: db.js only seeds the default admin the FIRST time the
// database is created (when the admins table is empty). If you change
// DEFAULT_ADMIN_USERNAME / DEFAULT_ADMIN_PASSWORD in .env AFTER the database
// already exists, that change has no effect on its own — the old password
// hash is still what's stored. Run this script any time you want to sync
// the admin credentials in the database with what's in your .env file,
// without wiping your existing complaints/categories data.
//
// Usage:  npm run admin:reset-password

import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/db.js";

const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
const password = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";

const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get(username);

if (existing) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE username = ?").run(hash, username);
  console.log(`Password admin "${username}" berhasil diperbarui sesuai .env.`);
} else {
  db.prepare(
    "INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'super_admin')"
  ).run(username, hash);
  console.log(`Admin baru "${username}" berhasil dibuat sesuai .env.`);
}

console.log(`Silakan login dengan username: ${username} dan password sesuai .env kamu.`);
