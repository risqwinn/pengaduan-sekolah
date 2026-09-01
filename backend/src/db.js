import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// node:sqlite is built into Node.js (stable since Node 22.5) — no native
// compilation needed, unlike better-sqlite3 which requires Visual Studio
// Build Tools on Windows.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "app.db");
export const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_token_hash TEXT UNIQUE NOT NULL,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'LOW',
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS complaint_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  response TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (created_by) REFERENCES admins(id)
);
`);

// Seed default categories (FR-08)
const defaultCategories = [
  ["Akademik", "Masalah terkait pembelajaran dan akademik"],
  ["Fasilitas", "Masalah fasilitas sekolah"],
  ["Bullying", "Laporan perundungan"],
  ["Perilaku", "Masalah perilaku siswa/staf"],
  ["Administrasi", "Masalah administrasi sekolah"],
  ["Keamanan", "Masalah keamanan lingkungan sekolah"],
  ["Pelayanan", "Masalah pelayanan sekolah"],
  ["Saran", "Saran dan masukan"],
  ["Lainnya", "Kategori lain-lain"],
];
const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)"
);
for (const [name, desc] of defaultCategories) insertCategory.run(name, desc);

// Seed default admin (FR-05) — CHANGE PASSWORD AFTER FIRST LOGIN
const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";
const existingAdmin = db
  .prepare("SELECT id FROM admins WHERE username = ?")
  .get(adminUsername);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    "INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'super_admin')"
  ).run(adminUsername, hash);
  console.log(`Seeded default admin: ${adminUsername} / ${adminPassword}`);
}
