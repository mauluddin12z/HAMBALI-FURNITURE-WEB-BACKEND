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

const router = express.Router();

router.get("/products", getProducts);
router.get("/productByName", getProductByName);
router.get("/productSearchResults", getProductSearchResults);
router.get("/filteredProducts", getFilteredProducts);
router.get("/relatedProducts", getRelatedProducts);
router.get("/products/:id", getProductById);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;
