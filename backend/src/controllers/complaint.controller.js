import * as complaintService from "../services/complaint.service.js";

// FR-02 + FR-03
export function createComplaint(req, res) {
  const { categoryId, title, content, urgency } = req.body;
  try {
    const { id, token } = complaintService.createComplaint({ categoryId, title, content, urgency });
    res.status(201).json({
      message: "Pengaduan berhasil dikirim.",
      token, // shown ONCE to the reporter
      complaintId: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat pengaduan. Coba lagi nanti." });
  }
}

// FR-04
export function checkComplaintStatus(req, res) {
  const { token } = req.body;
  const result = complaintService.getComplaintStatusByToken(token);
  if (!result) return res.status(404).json({ error: "Kode laporan tidak ditemukan." });
  res.json(result);
}

// FR-06: dashboard stats
export function getDashboard(req, res) {
  res.json(complaintService.getDashboardStats());
}

// FR-07: list + filter
export function listComplaints(req, res) {
  const { status, categoryId } = req.query;
  res.json({ complaints: complaintService.listComplaints({ status, categoryId }) });
}

// FR-07: detail
export function getComplaintDetail(req, res) {
  const { id } = req.params;
  const detail = complaintService.getComplaintDetailById(id);
  if (!detail) return res.status(404).json({ error: "Laporan tidak ditemukan." });
  res.json(detail);
}

// FR-07: update status + tanggapan
export function updateComplaint(req, res) {
  const { id } = req.params;
  const { status, response } = req.body;
  const validStatuses = ["RECEIVED", "REVIEWING", "PROCESSING", "RESOLVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status tidak valid." });
  }
  const updated = complaintService.updateComplaintStatus({
    id,
    status,
    response,
    adminId: req.admin.id,
  });
  if (!updated) return res.status(404).json({ error: "Laporan tidak ditemukan." });
  res.json(updated);
}
