import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
} from "../controllers/CategoryController.js";

const router = express.Router();

router.get("/category", getCategories);
router.get("/categoryByName", getCategoryByName);
router.get("/category/:id", getCategoryById);
router.post("/category", createCategory);
router.patch("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

export default router;
