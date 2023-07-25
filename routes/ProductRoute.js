import express from "express";
import {
  createProduct,
  deleteProduct,
  getFilteredProducts,
  getProductById,
  getProductByName,
  getProductSearchResults,
  getProducts,
  getRelatedProducts,
  updateProduct,
} from "../controllers/ProductController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/productByName", getProductByName);
router.get("/productSearchResults", getProductSearchResults);
router.get("/filteredProducts", getFilteredProducts);
router.get("/relatedProducts", getRelatedProducts);
router.get("/products/:id", getProductById);
router.post("/products", verifyToken, createProduct);
router.patch("/products/:id", verifyToken, updateProduct);
router.delete("/products/:id", verifyToken, deleteProduct);

export default router;
