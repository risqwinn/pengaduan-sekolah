// Format tanggal yang TIDAK AMBIGU — pakai nama bulan, bukan angka.
// timeZone di-set eksplisit ke Asia/Jakarta supaya jam yang ditampilkan
// selalu benar (WIB) walaupun jam sistem di komputer/server berbeda zona
// waktu — jangan mengandalkan zona waktu default browser/OS.
//
// PENTING: backend (SQLite) mengirim waktu dalam format
// "2026-09-01 08:20:58" — TANPA tanda zona waktu ('Z' atau offset).
// Waktu ini sebenarnya UTC, tapi JavaScript secara default menebak
// format tanpa tanda zona sebagai waktu LOKAL komputer/browser, bukan
// UTC. Fungsi toUtcDate() di bawah menandai string itu sebagai UTC
// secara eksplisit sebelum dikonversi, supaya hasilnya selalu benar.
function toUtcDate(input) {
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    const hasTimezoneMarker = /Z$|[+-]\d{2}:?\d{2}$/.test(input);
    if (!hasTimezoneMarker) {
      const isoLike = input.includes("T") ? input : input.replace(" ", "T");
      return new Date(`${isoLike}Z`);
    }
  }
  return new Date(input);
}

export function formatDateTime(dateInput) {
  const d = toUtcDate(dateInput);
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

export function formatDateOnly(dateInput) {
  return toUtcDate(dateInput).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}