import { Router } from "express";
import {
  createComplaint,
  checkComplaintStatus,
  getDashboard,
  listComplaints,
  getComplaintDetail,
  updateComplaint,
} from "../controllers/complaint.controller.js";
import { requireAdminAuth } from "../middleware/auth.middleware.js";
import {
  complaintCreationLimiter,
  checkComplaintLimiter,
} from "../middleware/rateLimit.middleware.js";
import {
  validateComplaintInput,
  validateTokenInput,
} from "../middleware/validation.middleware.js";

const router = Router();

// Public routes (no login required — FR-02, FR-04)
router.post("/", complaintCreationLimiter, validateComplaintInput, createComplaint);
router.post("/check", checkComplaintLimiter, validateTokenInput, checkComplaintStatus);

// Admin-only routes (FR-06, FR-07)
router.get("/admin/dashboard", requireAdminAuth, getDashboard);
router.get("/admin/list", requireAdminAuth, listComplaints);
router.get("/admin/:id", requireAdminAuth, getComplaintDetail);
router.patch("/admin/:id", requireAdminAuth, updateComplaint);

export default router;
