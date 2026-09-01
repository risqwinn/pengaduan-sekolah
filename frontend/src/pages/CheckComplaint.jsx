import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { formatDateTime } from "../utils/formatDate.js";

const STATUS_LABEL = {
  RECEIVED: "Diterima",
  REVIEWING: "Ditinjau",
  PROCESSING: "Diproses",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export default function CheckComplaint() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await api.checkComplaint(token);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-sm text-brand-600 hover:underline">← Kembali</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Cek Status Pengaduan</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4 mb-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2 border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Laporan</label>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="LAP-XXXX-XXXX"
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {loading ? "Mencari..." : "Cek Status"}
          </button>
        </form>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">{result.title}</h2>
                <p className="text-xs text-gray-500">{result.category} · Urgensi: {result.urgency}</p>
              </div>
              <span className="text-xs font-medium bg-brand-100 text-brand-700 px-3 py-1 rounded-full">
                {STATUS_LABEL[result.status] || result.status}
              </span>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">Riwayat Penanganan</h3>
            <ol className="space-y-2">
              {result.history.map((h, i) => (
                <li key={i} className="text-sm border-l-2 border-brand-200 pl-3">
                  <div className="font-medium text-gray-700">{STATUS_LABEL[h.status] || h.status}</div>
                  {h.response && <div className="text-gray-500">{h.response}</div>}
                  <div className="text-xs text-gray-400">{formatDateTime(h.created_at)}</div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
