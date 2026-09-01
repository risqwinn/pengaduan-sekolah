import { db } from "../db.js";

// FR-08: kategori laporan (publik: hanya kategori aktif)
export function listPublicCategories(req, res) {
  const categories = db
    .prepare("SELECT id, name, description FROM categories WHERE is_active = 1 ORDER BY name")
    .all();
  res.json({ categories });
}

export function listAllCategories(req, res) {
  const categories = db.prepare("SELECT * FROM categories ORDER BY name").all();
  res.json({ categories });
}

export function createCategory(req, res) {
  const { name, description } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Nama kategori wajib diisi." });
  try {
    const info = db
      .prepare("INSERT INTO categories (name, description, is_active) VALUES (?, ?, 1)")
      .run(name.trim(), description || "");
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: "Kategori sudah ada." });
  }
}

export function toggleCategory(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;
  db.prepare("UPDATE categories SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, id);
  res.json({ success: true });
}
