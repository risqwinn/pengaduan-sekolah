const VALID_URGENCY = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

// FR-02: validasi form pengaduan minimal
export function validateComplaintInput(req, res, next) {
  const { categoryId, title, content, urgency, agreedToTerms } = req.body;
  const errors = [];

  if (!categoryId) errors.push("Kategori wajib diisi.");
  if (!title || title.trim().length < 5) errors.push("Judul minimal 5 karakter.");
  if (!content || content.trim().length < 20) errors.push("Isi laporan minimal 20 karakter.");
  if (urgency && !VALID_URGENCY.includes(urgency)) errors.push("Tingkat urgensi tidak valid.");
  if (!agreedToTerms) errors.push("Anda harus menyetujui aturan penggunaan.");

  if (errors.length) return res.status(400).json({ error: errors.join(" ") });
  next();
}

export function validateTokenInput(req, res, next) {
  const { token } = req.body;
  if (!token || !/^LAP-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(token.trim())) {
    return res.status(400).json({ error: "Format kode laporan tidak valid." });
  }
  next();
}

export function validateLoginInput(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }
  next();
}
