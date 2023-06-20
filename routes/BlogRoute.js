import express from "express";
import {
  createBlog,
  getBlogById,
  getBlogByName,
  getBlogs,
  getFilteredBlogs,
  updateBlog,
} from "../controllers/BlogController.js";

const router = express.Router();

router.get("/blogs", getBlogs);
router.get("/blogByName", getBlogByName);
router.get("/filteredBlogs", getFilteredBlogs);
router.get("/blog/:id", getBlogById);
router.post("/blog", createBlog);
router.patch("/blog/:id", updateBlog);

export default router;
