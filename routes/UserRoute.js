import express from "express";
import {
  deleteUser,
  getFilteredUsers,
  getUserById,
  getUsers, login, logout, register, updateUser,
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { refreshToken } from "../controllers/refreshToken.js";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/user/:id", verifyToken, getUserById);
router.get("/filteredUsers", verifyToken, getFilteredUsers);
router.post("/users", verifyToken, register);
router.patch("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", deleteUser);
router.post("/login", login);
router.get("/token", refreshToken);
router.delete("/logout", logout);
export default router;
