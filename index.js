import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import ProductRoute from "./routes/ProductRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import db from "./config/Database.js";
import BlogRoute from "./routes/BlogRoute.js";
import UserRoute from "./routes/UserRoute.js";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;
const allowedOrigins = [
  'https://hambali-furniture-web-frontend.vercel.app',
  "http://192.168.0.105:3000",
  "http://103.226.138.140:3000",
  "https://restoandcafepempek19.my.id",
];
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);
// Sync database
(async () => {
  try {
    // await db.sync({ alter: true });
  } catch (error) {
    console.error("Error syncing database:", error);
  }
})();

app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(ProductRoute);
app.use(CategoryRoute);
app.use(BlogRoute);
app.use(UserRoute);
app.use(express.static("public"));
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(
  "/uploads/categoryImg",
  express.static(path.join(__dirname, "/public/uploads/categoryImg"))
);
app.use(
  "/uploads/productsImg",
  express.static(path.join(__dirname, "/public/uploads/productsImg"))
);
app.use(
  "/uploads/blogImg",
  express.static(path.join(__dirname, "/public/uploads/blogImg"))
);

app.listen(PORT, "0.0.0.0", () => console.log("Server Up and Running..."));
