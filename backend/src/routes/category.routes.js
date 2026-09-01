import { Router } from "express";
import {
  listPublicCategories,
  listAllCategories,
  createCategory,
  toggleCategory,
} from "../controllers/category.controller.js";
import { requireAdminAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listPublicCategories); // public, only active categories
router.get("/admin/all", requireAdminAuth, listAllCategories);
router.post("/admin", requireAdminAuth, createCategory);
router.patch("/admin/:id", requireAdminAuth, toggleCategory);

export default router;
