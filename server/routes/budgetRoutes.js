import { Router } from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} from "../validators/budgetSchemas.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(validateQuery(budgetQuerySchema), getBudgets)
  .post(validate(createBudgetSchema), createBudget);

router
  .route("/:id")
  .patch(validate(updateBudgetSchema), updateBudget)
  .delete(deleteBudget);

export default router;