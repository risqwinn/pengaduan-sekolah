import "dotenv/config"; // MUST be the first import so env vars are ready before db.js runs

import express from "express";
import cors from "cors";
import helmet from "helmet";

import "./src/db.js"; // initializes DB + seeds data
import authRoutes from "./src/routes/auth.routes.js";
import complaintRoutes from "./src/routes/complaint.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// NFR-01: secure HTTP headers
app.use(helmet());

// Support multiple allowed origins (comma-separated in .env), since the
// frontend can run on different ports depending on the command used:
//   npm run dev      -> usually http://localhost:5173
//   npm run preview  -> usually http://localhost:4173 (needed to test the PWA)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, mobile apps, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
      }
    },
  })
);
app.use(express.json({ limit: "50kb" })); // small limit: complaints are text-only for MVP

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/categories", categoryRoutes);

// Generic error handler (avoid leaking stack traces)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(PORT, () => {
  console.log(`Server pengaduan sekolah berjalan di http://localhost:${PORT}`);
});
