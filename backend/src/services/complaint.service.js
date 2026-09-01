import { db } from "../db.js";
import { encryptContent, decryptContent } from "../utils/crypto.js";
import { createUniquePublicToken, findComplaintByToken } from "./token.service.js";
import { sendNewComplaintNotification } from "../utils/mailer.js";

// FR-02 + FR-03: create complaint, generate anonymous token
export function createComplaint({ categoryId, title, content, urgency }) {
  const { token, tokenHash } = createUniquePublicToken();
  const encryptedContent = encryptContent(content);

  const info = db
    .prepare(
      `INSERT INTO complaints (public_token_hash, category_id, title, encrypted_content, urgency, status)
       VALUES (?, ?, ?, ?, ?, 'RECEIVED')`
    )
    .run(tokenHash, categoryId, title.trim(), encryptedContent, urgency || "LOW");

  db.prepare(
    `INSERT INTO complaint_history (complaint_id, status, response, created_by) VALUES (?, 'RECEIVED', NULL, NULL)`
  ).run(info.lastInsertRowid);

  // Fire-and-forget: notify admin by email. Never awaited here so a slow or
  // failing mail server can't delay/break the response to the reporter.
  const categoryRow = db.prepare("SELECT name FROM categories WHERE id = ?").get(categoryId);
  sendNewComplaintNotification({
    complaintId: info.lastInsertRowid,
    category: categoryRow?.name || "Tidak diketahui",
    urgency: urgency || "LOW",
    createdAt: new Date().toISOString(),
  });

  return { id: info.lastInsertRowid, token };
}

// FR-04: cek status laporan pakai token — TIDAK mengembalikan identitas apapun
export function getComplaintStatusByToken(rawToken) {
  const complaint = findComplaintByToken(rawToken);
  if (!complaint) return null;

  const history = db
    .prepare(
      `SELECT status, response, created_at FROM complaint_history WHERE complaint_id = ? ORDER BY created_at ASC`
    )
    .all(complaint.id);

  const category = db.prepare("SELECT name FROM categories WHERE id = ?").get(complaint.category_id);

  return {
    title: complaint.title,
    category: category?.name || "Tidak diketahui",
    urgency: complaint.urgency,
    status: complaint.status,
    createdAt: complaint.created_at,
    history,
  };
}

// Admin: list laporan dengan filter (FR-07)
export function listComplaints({ status, categoryId } = {}) {
  let query = `
    SELECT c.id, c.title, c.urgency, c.status, c.created_at, c.updated_at, cat.name AS category
    FROM complaints c
    JOIN categories cat ON cat.id = c.category_id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    query += " AND c.status = ?";
    params.push(status);
  }
  if (categoryId) {
    query += " AND c.category_id = ?";
    params.push(categoryId);
  }
  query += " ORDER BY c.created_at DESC";
  return db.prepare(query).all(...params);
}

// Admin: detail laporan (isi didekripsi hanya untuk admin yang sudah login)
export function getComplaintDetailById(id) {
  const complaint = db
    .prepare(
      `SELECT c.*, cat.name AS category FROM complaints c JOIN categories cat ON cat.id = c.category_id WHERE c.id = ?`
    )
    .get(id);
  if (!complaint) return null;

  const history = db
    .prepare(
      `SELECT ch.status, ch.response, ch.created_at, a.username AS handled_by
       FROM complaint_history ch LEFT JOIN admins a ON a.id = ch.created_by
       WHERE ch.complaint_id = ? ORDER BY ch.created_at ASC`
    )
    .all(id);

  return {
    id: complaint.id,
    title: complaint.title,
    category: complaint.category,
    urgency: complaint.urgency,
    status: complaint.status,
    content: decryptContent(complaint.encrypted_content),
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at,
    history,
  };
}

// FR-07: admin update status + tanggapan -> tercatat di history (FR-09)
export function updateComplaintStatus({ id, status, response, adminId }) {
  const complaint = db.prepare("SELECT id FROM complaints WHERE id = ?").get(id);
  if (!complaint) return null;

  db.prepare("UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    status,
    id
  );
  db.prepare(
    "INSERT INTO complaint_history (complaint_id, status, response, created_by) VALUES (?, ?, ?, ?)"
  ).run(id, status, response || null, adminId);

  return getComplaintDetailById(id);
}

export function getDashboardStats() {
  const total = db.prepare("SELECT COUNT(*) AS n FROM complaints").get().n;
  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS n FROM complaints GROUP BY status")
    .all();
  const byCategory = db
    .prepare(
      `SELECT cat.name AS category, COUNT(*) AS n FROM complaints c
       JOIN categories cat ON cat.id = c.category_id GROUP BY cat.name`
    )
    .all();
  return { total, byStatus, byCategory };
}
