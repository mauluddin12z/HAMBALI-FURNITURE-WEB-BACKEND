import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const BlogImage = db.define(
  "blog_image",
  {
    blogImage_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);

export default BlogImage;
