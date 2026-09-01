import { Router } from "express";
import { loginAdmin, getCurrentAdmin } from "../controllers/auth.controller.js";
import { requireAdminAuth } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimit.middleware.js";
import { validateLoginInput } from "../middleware/validation.middleware.js";

const router = Router();

router.post("/login", loginLimiter, validateLoginInput, loginAdmin);
router.get("/me", requireAdminAuth, getCurrentAdmin);

export default router;
