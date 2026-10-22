import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
  listQuerySchema,
} from "../validators/transactionSchemas.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(validateQuery(listQuerySchema), getTransactions)
  .post(validate(createTransactionSchema), createTransaction);

router
  .route("/:id")
  .get(getTransaction)
  .patch(validate(updateTransactionSchema), updateTransaction)
  .delete(deleteTransaction);

export default router;