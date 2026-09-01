import nodemailer from "nodemailer";

// Email notification for admins when a new complaint arrives.
//
// PRIVACY NOTE: this email intentionally does NOT include the full
// complaint content — only metadata (category, urgency, time, ID).
// Email is not end-to-end encrypted and can pass through several mail
// servers, so keeping the sensitive content out of it protects the
// reporter's anonymity and the confidentiality of what they wrote.
// The admin must log into the dashboard to read the actual content.
//
// Two delivery methods are supported — pick whichever is easier for you:
//   1. Resend (recommended): a REST API built for exactly this use case —
//      sending transactional email FROM a backend server. Just one API key.
//      (Note: Web3Forms was tried earlier but doesn't work here — it's
//      designed to be called from browser JavaScript only; server-side
//      calls get rejected with 403 unless you're on their paid plan with
//      an IP safelist.)
//   2. Custom SMTP (Gmail, Brevo, etc.): more control, but more setup steps.
// If RESEND_API_KEY is set, it's used. Otherwise, falls back to SMTP.

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "[mailer] Notifikasi email TIDAK dikirim — konfigurasi SMTP belum lengkap di .env.",
      `SMTP_HOST=${SMTP_HOST ? "OK" : "KOSONG"},`,
      `SMTP_USER=${SMTP_USER ? "OK" : "KOSONG"},`,
      `SMTP_PASS=${SMTP_PASS ? "OK" : "KOSONG"}`
    );
    return null; // email notifications are optional — not configured
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for port 465, false for 587/others
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

const URGENCY_LABEL = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  EMERGENCY: "DARURAT",
};

function formatWaktu(dateInput) {
  const d = new Date(dateInput);
  const tanggal = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  return `${tanggal}, ${jam} WIB`;
}

function buildMessageBody({ complaintId, category, urgency, createdAt, dashboardUrl }) {
  return [
    "Ada pengaduan baru masuk ke Sistem Pengaduan Sekolah Anonim.",
    "",
    `Kategori   : ${category}`,
    `Urgensi    : ${URGENCY_LABEL[urgency] || urgency}`,
    `Waktu      : ${formatWaktu(createdAt)}`,
    `ID Laporan : #${complaintId}`,
    "",
    "Isi laporan tidak disertakan di email ini demi menjaga kerahasiaan pelapor.",
    `Silakan login ke dashboard admin untuk membaca detail dan menindaklanjuti: ${dashboardUrl}`,
  ].join("\n");
}

async function sendViaResend({ complaintId, category, urgency, createdAt, dashboardUrl, subject }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!to) {
    console.warn("[mailer] Notifikasi email TIDAK dikirim — ADMIN_NOTIFICATION_EMAIL kosong di .env.");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Sistem Pengaduan Sekolah <onboarding@resend.dev>",
      to: [to],
      subject,
      text: buildMessageBody({ complaintId, category, urgency, createdAt, dashboardUrl }),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Resend merespons status ${res.status}`);
  }
}

async function sendViaSmtp({ complaintId, category, urgency, createdAt, dashboardUrl, subject }) {
  const t = getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!t) return; // getTransporter() already logged why

  if (!adminEmail) {
    console.warn("[mailer] Notifikasi email TIDAK dikirim — ADMIN_NOTIFICATION_EMAIL kosong di .env.");
    return;
  }

  await t.sendMail({
    from: process.env.MAIL_FROM || `"Sistem Pengaduan Sekolah" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject,
    text: buildMessageBody({ complaintId, category, urgency, createdAt, dashboardUrl }),
  });
}

export async function sendNewComplaintNotification({ complaintId, category, urgency, createdAt }) {
  const isUrgent = urgency === "HIGH" || urgency === "EMERGENCY";
  const subjectPrefix = isUrgent ? "[URGENSI TINGGI] " : "";
  const dashboardUrl = process.env.ADMIN_DASHBOARD_URL || "http://localhost:5173/admin/dashboard";
  const subject = `${subjectPrefix}Pengaduan Baru Masuk — Kategori: ${category}`;
  const payload = { complaintId, category, urgency, createdAt, dashboardUrl, subject };

  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(payload);
    } else {
      console.warn("[mailer] RESEND_API_KEY kosong di .env — mencoba jalur SMTP sebagai gantinya.");
      await sendViaSmtp(payload);
    }
  } catch (err) {
    // Log but never throw — a failed email must not break the complaint flow.
    console.error("Gagal mengirim notifikasi email:", err.message);
  }
}
