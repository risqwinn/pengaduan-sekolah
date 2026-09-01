const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    // fetch() throws a generic "Failed to fetch" for network-level problems
    // (server not running, wrong URL, or blocked by CORS) — surface something
    // actionable instead of the raw browser error.
    throw new Error(
      "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan (npm run dev di folder backend) dan origin frontend ini sudah diizinkan di backend/.env (FRONTEND_ORIGIN)."
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan.");
  return data;
}

export const api = {
  getCategories: () => request("/categories"),
  createComplaint: (payload) =>
    request("/complaints", { method: "POST", body: JSON.stringify(payload) }),
  checkComplaint: (token) =>
    request("/complaints/check", { method: "POST", body: JSON.stringify({ token }) }),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  getDashboard: () => request("/complaints/admin/dashboard"),
  listComplaints: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/complaints/admin/list${qs ? `?${qs}` : ""}`);
  },
  getComplaintDetail: (id) => request(`/complaints/admin/${id}`),
  updateComplaint: (id, payload) =>
    request(`/complaints/admin/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
