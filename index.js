import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import ProductRoute from "./routes/ProductRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import BlogRoute from "./routes/BlogRoute.js";
import UserRoute from "./routes/UserRoute.js";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'https://hambali-furniture-web-frontend.vercel.app'
  })
);

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

app.listen(5000, () => console.log("Server Up and Running..."));
