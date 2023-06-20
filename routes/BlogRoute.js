import express from "express";
import {
  createBlog,
  getBlogById,
  getBlogByTitle,
  getBlogs,
  getFilteredBlogs,
  updateBlog,
} from "../controllers/BlogController.js";

const router = express.Router();

router.get("/blogs", getBlogs);
router.get("/blogByTitle", getBlogByTitle);
router.get("/filteredBlogs", getFilteredBlogs);
router.get("/blog/:id", getBlogById);
router.post("/blog", createBlog);
router.patch("/blog/:id", updateBlog);

export default router;
