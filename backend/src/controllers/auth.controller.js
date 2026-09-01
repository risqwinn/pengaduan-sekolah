import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// FR-05: Admin login
export function loginAdmin(req, res) {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);

  if (!admin) return res.status(401).json({ error: "Username atau password salah." });

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: "Username atau password salah." });

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
}

export function getCurrentAdmin(req, res) {
  res.json({ admin: req.admin });
}
