import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api.js";
import { formatDateTime } from "../utils/formatDate.js";

const STATUS_OPTIONS = [
  { value: "RECEIVED", label: "Diterima" },
  { value: "REVIEWING", label: "Ditinjau" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      const d = await api.getComplaintDetail(id);
      setDetail(d);
      setStatus(d.status);
    } catch (err) {
      if (err.message.includes("Unauthorized")) navigate("/admin/login");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateComplaint(id, { status, response });
      setDetail(updated);
      setResponse("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!detail) return <div className="p-8 text-gray-500">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/admin/dashboard" className="text-sm text-brand-600 hover:underline">← Kembali ke Dashboard</Link>

        <div className="bg-white rounded-xl border shadow-sm p-6 mt-4">
          <h1 className="text-xl font-bold text-gray-800">{detail.title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            {detail.category} · Urgensi: {detail.urgency} · Dibuat {formatDateTime(detail.createdAt)}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4 text-sm text-gray-700 whitespace-pre-wrap">
            {detail.content}
          </div>

          <h2 className="text-sm font-semibold text-gray-700 mt-6 mb-2">Riwayat</h2>
          <ol className="space-y-2 mb-6">
            {detail.history.map((h, i) => (
              <li key={i} className="text-sm border-l-2 border-brand-200 pl-3">
                <div className="font-medium text-gray-700">
                  {STATUS_OPTIONS.find((s) => s.value === h.status)?.label || h.status}
                  {h.handled_by && <span className="text-gray-400 font-normal"> · oleh {h.handled_by}</span>}
                </div>
                {h.response && <div className="text-gray-500">{h.response}</div>}
                <div className="text-xs text-gray-400">{formatDateTime(h.created_at)}</div>
              </li>
            ))}
          </ol>

          <form onSubmit={handleUpdate} className="border-t pt-4 space-y-3">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2 border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubah Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggapan (opsional)</label>
              <textarea
                rows={3}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Tulis tanggapan untuk pelapor..."
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
