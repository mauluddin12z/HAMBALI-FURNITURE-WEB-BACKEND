import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import ProductRoute from "./routes/ProductRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://hambali-furniture-web-frontend.vercel.app",
    ],
  })
);

app.use(express.json());
app.use(FileUpload());
app.use(ProductRoute);
app.use(CategoryRoute);
app.use(express.static("public"));

app.listen(5000, () => console.log("Server Up and Running..."));
