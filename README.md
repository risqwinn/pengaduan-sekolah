# Sistem Pengaduan Sekolah Anonim — MVP

Fullstack app:
- Backend: Node.js + Express + SQLite (mudah dipindah ke MySQL nanti jika ada pengembangan selanjutnya)
- Frontend: React + Vite + Tailwind CSS

## Struktur

```
school-complaint-app/
├── backend/      # Express API
└── frontend/     # React app
```

## Langkah Menjalankan di Lokal (Step by Step)

### 1. Install Node.js
Pastikan Node.js versi 18+ terinstall (`node -v` untuk cek). Kalau belum ada, download di nodejs.org.

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
```
Buka file `.env` dan ganti `JWT_SECRET` dan `CONTENT_ENCRYPTION_KEY` dengan string acak yang panjang
(boleh generate dari https://randomkeygen.com/ atau `openssl rand -hex 32`).

Install dependency & jalankan:
```bash
npm install
npm run dev
```
Backend akan jalan di `http://localhost:4000`. Database SQLite otomatis dibuat di `backend/data/app.db`
beserta 9 kategori default dan 1 akun admin default (lihat log di terminal untuk username/password-nya —
**segera ganti password ini** setelah login pertama, lihat bagian "Langkah Selanjutnya" di bawah).

### 3. Setup Frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Frontend akan jalan di `http://localhost:5173`.

### 4. Coba Alurnya
1. Buka `http://localhost:5173` → klik "Buat Pengaduan" → isi form → dapat kode `LAP-XXXX-XXXX`.
2. Klik "Cek Pengaduan" → masukkan kode → lihat status.
3. Buka `/admin/login` → login pakai akun default dari log terminal backend.
4. Di dashboard, klik salah satu laporan → ubah status / kasih tanggapan → cek lagi di halaman "Cek Pengaduan".

## Deploy

- **Frontend** → Vercel (sesuai BRD). Set environment variable `VITE_API_URL` ke URL backend kamu.
- **Backend** → karena pakai SQLite berbasis file, pilih hosting yang punya persistent disk
  (mis. Railway, Render, VPS). Kalau mau strict sesuai BRD (MySQL), lihat bagian "Migrasi ke MySQL" di bawah.

## Migrasi ke MySQL (sesuai BRD asli)

Kode saat ini pakai `better-sqlite3` supaya gampang dites tanpa setup server database.
Untuk pindah ke MySQL:
1. Install `mysql2` sebagai pengganti `better-sqlite3`.
2. Ganti isi `backend/src/db.js` — struktur tabel sudah sama persis dengan BRD, tinggal disesuaikan sintaks SQL-nya (MySQL pakai `AUTO_INCREMENT` bukan `AUTOINCREMENT`, dst).
3. Semua service/controller lain **tidak perlu diubah** karena hanya memanggil `db.prepare(...).run/get/all(...)` — kalau kamu mau, aku bisa bantu bikinkan versi MySQL-nya langsung.

## Notifikasi Email ke Admin

Setiap ada pengaduan baru masuk, sistem bisa otomatis mengirim email notifikasi ke admin.
**Fitur ini opsional** — kalau variabel SMTP di `.env` dikosongkan, sistem tetap jalan normal,
cuma tanpa kirim email (tidak ada error).

**Demi privasi pelapor**, email notifikasi **sengaja hanya berisi ringkasan** (kategori,
urgensi, waktu, nomor ID laporan) — **bukan isi laporan lengkap**. Email tidak terenkripsi
end-to-end dan bisa melewati beberapa server, jadi menjaga isi laporan tetap di database
(bukan di email) melindungi kerahasiaan yang dilaporkan. Admin tetap harus login ke
dashboard untuk membaca detail lengkapnya.

Kalau urgensi laporan **Tinggi** atau **Darurat**, subjek email otomatis diberi tanda
`[URGENSI TINGGI]`.

### Setup pakai Resend (direkomendasikan)
Didesain khusus untuk dipanggil dari backend server (cocok sama arsitektur app ini) —
tidak perlu App Password, 2FA, atau generate SMTP key.
1. Daftar gratis di https://resend.com pakai email kamu.
2. Di dashboard, buka menu **API Keys** → **Create API Key**. Beri nama bebas, copy key-nya
   (formatnya diawali `re_...`, ditampilkan cuma sekali).
3. Isi ke `backend/.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   ADMIN_NOTIFICATION_EMAIL=email_admin_yang_mau_terima_notif@example.com
   ADMIN_DASHBOARD_URL=http://localhost:5173/admin/dashboard
   ```
   (Baris `SMTP_*` boleh dibiarkan kosong — kalau `RESEND_API_KEY` terisi, sistem otomatis
   pakai Resend dan mengabaikan konfigurasi SMTP.)
4. Restart backend, coba buat pengaduan baru dari form, cek inbox `ADMIN_NOTIFICATION_EMAIL`.

**Catatan penting (khusus akun gratis tanpa verifikasi domain):** Resend hanya mengizinkan
kamu mengirim ke **email yang kamu pakai daftar akun Resend itu sendiri** selama domain
pengirim belum diverifikasi. Jadi untuk testing, pastikan `ADMIN_NOTIFICATION_EMAIL` sama
dengan email yang kamu pakai daftar Resend. Untuk produksi beneran (bisa kirim ke email
admin manapun), perlu verifikasi domain sendiri di Resend — tanya saya kalau sudah sampai
tahap itu, saya bisa bantu.

> **Kenapa bukan Web3Forms?** Sempat dicoba, tapi Web3Forms didesain untuk dipanggil dari
> JavaScript di browser (client-side), bukan dari server backend. Kalau dipanggil dari
> server seperti yang kita lakukan, mereka menolak dengan error 403 kecuali pakai paket
> berbayar + IP server didaftarkan ke whitelist mereka. Resend tidak punya batasan ini.

### Setup pakai Gmail (alternatif kalau tidak mau pakai Web3Forms)
1. Aktifkan 2-Step Verification di akun Gmail sekolah/admin.
2. Buat "App Password" di https://myaccount.google.com/apppasswords (bukan password Gmail biasa).
3. Isi `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=email_sekolah@gmail.com
   SMTP_PASS=app_password_16_karakter_dari_google
   MAIL_FROM="Sistem Pengaduan Sekolah <email_sekolah@gmail.com>"
   ADMIN_NOTIFICATION_EMAIL=email_penerima_notifikasi@gmail.com
   ADMIN_DASHBOARD_URL=http://localhost:5173/admin/dashboard
   ```
4. Restart backend (`npm run dev` ulang).
5. Coba buat pengaduan baru dari form — cek inbox email `ADMIN_NOTIFICATION_EMAIL`.

### Setup pakai provider SMTP lain (SendGrid, Mailgun, dll)
Tinggal ganti `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` sesuai kredensial dari
provider tersebut — kode di `backend/src/utils/mailer.js` tidak perlu diubah.

### Kalau nanti mau notif ke beberapa admin sekaligus
Saat ini `ADMIN_NOTIFICATION_EMAIL` cuma menerima satu alamat. Bisa diperluas jadi daftar
alamat (dipisah koma) di `mailer.js` — beri tahu saya kalau butuh ini, saya bisa bantu buatkan.



**"Failed to fetch" saat login / kategori tidak muncul di form pengaduan**
Ini hampir selalu masalah CORS: origin frontend yang kamu akses tidak ada di daftar
`FRONTEND_ORIGIN` pada `backend/.env`. Contoh kasus umum: kamu develop pakai
`npm run dev` (port 5173), lalu pindah ke `npm run preview` untuk test PWA (port 4173) —
kalau `.env` cuma mengizinkan salah satu, request dari port yang lain akan diblokir browser.
`.env.example` sekarang sudah default mengizinkan kedua port itu sekaligus
(`http://localhost:5173,http://localhost:4173`, dipisah koma tanpa spasi). Kalau kamu akses
dari port lain (mis. IP jaringan lokal atau domain produksi), tambahkan ke daftar itu juga,
lalu **restart backend**-nya (env var hanya dibaca saat server start).

**Password salah tapi pesannya "Failed to fetch", bukan "Username atau password salah"**
Ini gejala dari masalah CORS di atas, bukan soal validasi password — begitu CORS diperbaiki,
pesan error yang benar (dari backend) akan muncul.

**Sudah login sebelumnya (atau sudah pernah menjalankan backend), lalu ganti password di `.env`, tapi login masih pakai password lama**
`DEFAULT_ADMIN_USERNAME`/`DEFAULT_ADMIN_PASSWORD` di `.env` **hanya dipakai sekali**, saat
database (`backend/data/app.db`) pertama kali dibuat. Kalau file database itu sudah ada,
mengubah `.env` tidak otomatis mengubah password yang tersimpan. Untuk sinkronkan password
admin di database dengan yang ada di `.env` (tanpa menghapus data laporan yang sudah ada),
jalankan dari folder `backend`:
```bash
npm run admin:reset-password
```
Command ini akan membuat admin baru (kalau belum ada) atau update password admin yang sudah
ada, sesuai isi `.env` saat ini.

**Tombol "Install Aplikasi" tidak pernah muncul sama sekali**
Pastikan kamu menjalankan frontend dengan **build produksi**, bukan `npm run dev`:
```bash
cd frontend
npm run build
npm run preview
```
Service worker (syarat wajib untuk prompt install) sengaja **tidak** diaktifkan saat
`npm run dev` — kalau kamu buka lewat `npm run dev` (port 5173), tombol install memang
tidak akan pernah muncul, itu bukan bug. Coba lagi lewat `npm run preview` (biasanya port 4173).

**Tombol "Install Aplikasi" sempat muncul, tapi hilang lagi setelah app di-uninstall**
Ini perilaku Chrome sendiri (bukan bug di app ini). Chrome punya heuristik "engagement"
internal untuk memutuskan kapan menampilkan ulang prompt instalasi setelah sebelumnya
pernah diinstall/di-uninstall, dan itu tidak selalu langsung muncul lagi di sesi berikutnya.
Kalau tombol kami tidak muncul lagi, Chrome tetap menyediakan ikon install-nya sendiri
di address bar (ikon monitor+panah di sebelah bintang bookmark) — klik itu sebagai alternatif.

## PWA (Progressive Web App)

Frontend sudah dilengkapi PWA: bisa di-install ke homescreen HP/desktop dan tetap bisa
dibuka (app shell-nya) walau koneksi lemah/offline.

**Penting soal privasi:** service worker (`frontend/public/sw.js`) **sengaja tidak**
meng-cache respons dari `/api/*` — jadi data pengaduan tidak pernah tersimpan di cache
browser. Yang di-cache cuma file statis (HTML/JS/CSS/ikon) supaya app shell-nya bisa dibuka
saat offline; data laporan selalu diambil langsung dari server saat online.

**Cara mencoba fitur install:**
- Service worker hanya aktif di build produksi (`npm run build && npm run preview`), bukan
  saat `npm run dev` — supaya tidak mengganggu proses development dengan cache lama.
- Di Chrome/Edge (Android & Desktop): tombol "📲 Install Aplikasi" akan muncul otomatis
  di pojok kanan bawah begitu browser mendeteksi app ini installable.
- Di iOS Safari: API install otomatis tidak tersedia — user perlu tap Share →
  "Add to Home Screen" secara manual.
- Ganti ikon di `frontend/public/icons/` (`icon-192.png`, `icon-512.png`, dan versi
  `-maskable`) dengan logo sekolah kamu sendiri kalau mau — ukurannya harus sama persis.

Untuk deploy ke Vercel, PWA ini otomatis jalan karena manifest & service worker
sudah ada di folder `public/` yang ikut ke-deploy sebagai static asset.

## Langkah Selanjutnya (belum termasuk di MVP ini, sesuai BRD bagian 13 & 15)
- Ganti password admin default & bikin fitur ganti password.
- Multi-admin & role-based access.
- Upload lampiran (foto/dokumen) dengan storage aman.
- Audit log.
- Notifikasi (email/WhatsApp).

## Catatan Keamanan yang Sudah Diimplementasikan
- Password admin di-hash pakai bcrypt (tidak plaintext).
- Kode laporan hanya ditampilkan sekali; database hanya simpan hash-nya (SHA-256).
- Isi laporan dienkripsi (AES-256-GCM) sebelum disimpan.
- Rate limiting di endpoint buat pengaduan, cek pengaduan, dan login.
- Helmet untuk secure HTTP headers.
- Validasi input di semua endpoint publik.
- Tidak ada tracking/analytics pihak ketiga.
