import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
  getFilteredCategories,
  updateCategory,
} from "../controllers/CategoryController.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/category", getCategories);
router.get("/filteredCategory", getFilteredCategories);
router.get("/categoryByName", getCategoryByName);
router.get("/category/:id", getCategoryById);
router.post("/category", verifyToken, createCategory);
router.patch("/category/:id", verifyToken, updateCategory);
router.delete("/category/:id", verifyToken, deleteCategory);

export default router;
