import express from "express";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogByTitle,
  getBlogImageById,
  getBlogImages,
  getBlogs,
  getFilteredBlogs,
  getOtherBlogs,
  updateBlog,
} from "../controllers/BlogController.js";

import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
router.get("/blogs", getBlogs);
router.get("/blogImages", getBlogImages);
router.get("/otherBlogs", getOtherBlogs);
router.get("/blogByTitle", getBlogByTitle);
router.get("/filteredBlogs", getFilteredBlogs);
router.get("/blogImages/:id", getBlogImageById);
router.get("/blog/:id", getBlogById);
router.post("/blog", createBlog);
router.patch("/blog/:id", verifyToken, updateBlog);
router.delete("/blog/:id", verifyToken, deleteBlog);

export default router;
