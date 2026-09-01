import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-700">
          Sistem Pengaduan Sekolah Anonim
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Sampaikan keluhan atau masalah di lingkungan sekolah tanpa perlu
          mencantumkan identitas pribadi. Sistem ini dirancang untuk{" "}
          <strong>tidak meminta dan tidak menyimpan identitas pribadi pelapor</strong>.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 flex-1 w-full">
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Link
            to="/buat-pengaduan"
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl p-6 text-center shadow transition"
          >
            <div className="text-lg font-semibold">Buat Pengaduan</div>
            <div className="text-sm opacity-90 mt-1">
              Sampaikan laporan tanpa login
            </div>
          </Link>
          <Link
            to="/cek-pengaduan"
            className="bg-white border border-brand-200 hover:border-brand-500 text-brand-700 rounded-xl p-6 text-center shadow transition"
          >
            <div className="text-lg font-semibold">Cek Pengaduan</div>
            <div className="text-sm opacity-80 mt-1">
              Lihat status laporan dengan kode
            </div>
          </Link>
        </div>

        <section className="mt-12 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-2">
            Bagaimana sistem ini menjaga anonimitas Anda?
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Tidak ada form nama, email, atau nomor HP.</li>
            <li>Tidak perlu login untuk membuat laporan.</li>
            <li>Isi laporan Anda dienkripsi di server.</li>
            <li>Anda mendapatkan kode unik untuk memantau perkembangan laporan.</li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            Catatan: sistem dirancang untuk tidak meminta dan tidak menyimpan
            identitas pribadi pelapor. Infrastruktur jaringan (mis. hosting,
            browser, jaringan sekolah) dapat memiliki logging di luar kendali
            aplikasi ini.
          </p>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        <Link to="/admin/login" className="hover:underline">
          Login Admin
        </Link>
      </footer>
    </div>
  );
}
