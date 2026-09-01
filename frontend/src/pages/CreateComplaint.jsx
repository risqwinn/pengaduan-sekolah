import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Rendah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HIGH", label: "Tinggi" },
  { value: "EMERGENCY", label: "Darurat" },
];

export default function CreateComplaint() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [urgency, setUrgency] = useState("LOW");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultToken, setResultToken] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setCategoriesLoading(true);
    setError("");
    try {
      const d = await api.getCategories();
      setCategories(d.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.createComplaint({ categoryId, title, content, urgency, agreedToTerms: agreed });
      setResultToken(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (resultToken) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center px-6">
        <div className="bg-white max-w-md w-full rounded-xl shadow p-8 text-center">
          <h1 className="text-xl font-bold text-brand-700 mb-2">Pengaduan Terkirim</h1>
          <p className="text-gray-600 text-sm mb-4">
            Simpan kode ini baik-baik. Kode ini <strong>hanya ditampilkan sekali</strong> dan
            digunakan untuk mengecek perkembangan laporan Anda.
          </p>
          <div className="bg-brand-50 border border-brand-200 rounded-lg py-4 text-2xl font-mono font-bold tracking-widest text-brand-700 mb-6">
            {resultToken}
          </div>
          <Link to="/" className="text-brand-600 hover:underline text-sm">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-sm text-brand-600 hover:underline">← Kembali</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-1">Buat Pengaduan</h1>
        <p className="text-sm text-gray-500 mb-6">
          Kami tidak meminta nama, email, atau data pribadi apa pun.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2 border border-red-100 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadCategories}
                className="shrink-0 text-red-700 underline text-xs font-medium"
              >
                Coba lagi
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              required
              disabled={categoriesLoading || categories.length === 0}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {categoriesLoading
                  ? "Memuat kategori..."
                  : categories.length === 0
                  ? "Kategori tidak tersedia"
                  : "Pilih kategori"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ringkasan singkat masalah Anda"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Laporan</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Jelaskan kejadian secara rinci..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Urgensi</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            Saya menyetujui aturan penggunaan dan memahami bahwa laporan palsu dapat disalahgunakan.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {loading ? "Mengirim..." : "Kirim Pengaduan"}
          </button>
        </form>
      </div>
    </div>
  );
}
