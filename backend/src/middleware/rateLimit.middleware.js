import rateLimit from "express-rate-limit";

// NFR-01: rate limiting untuk mencegah abuse/spam
export const complaintCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8, // max 8 laporan per IP per jam
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak pengaduan dari alamat ini. Coba lagi nanti." },
});

export const checkComplaintLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan. Coba lagi nanti." },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
});
