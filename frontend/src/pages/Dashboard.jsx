import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { formatDateOnly } from "../utils/formatDate.js";

const STATUS_LABEL = {
  RECEIVED: "Diterima",
  REVIEWING: "Ditinjau",
  PROCESSING: "Diproses",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const [statsRes, listRes] = await Promise.all([
        api.getDashboard(),
        api.listComplaints(statusFilter ? { status: statusFilter } : {}),
      ]);
      setStats(statsRes);
      setComplaints(listRes.complaints);
    } catch (err) {
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-gray-800">Dashboard Admin</h1>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <StatCard label="Total" value={stats.total} />
            {["RECEIVED", "REVIEWING", "PROCESSING", "RESOLVED"].map((s) => {
              const found = stats.byStatus.find((b) => b.status === s);
              return <StatCard key={s} label={STATUS_LABEL[s]} value={found ? found.n : 0} />;
            })}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-600">Filter status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Semua</option>
            {Object.entries(STATUS_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Judul</th>
                <th className="text-left px-4 py-3">Kategori</th>
                <th className="text-left px-4 py-3">Urgensi</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/complaints/${c.id}`)}
                  className="border-t hover:bg-brand-50 cursor-pointer"
                >
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">{c.urgency}</td>
                  <td className="px-4 py-3">
                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs">
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateOnly(c.created_at)}
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    Tidak ada laporan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-brand-700">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
