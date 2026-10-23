import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getSummary,
  getByCategory,
  getMonthly,
  exportCsv,
} from "../controllers/reportController.js";

const router = Router();

router.use(protect);

router.get("/summary", getSummary);
router.get("/by-category", getByCategory);
router.get("/monthly", getMonthly);
router.get("/export", exportCsv);

export default router;