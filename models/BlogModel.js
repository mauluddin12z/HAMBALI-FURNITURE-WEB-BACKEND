import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import BlogImage from "./BlogImageModel.js";

const { DataTypes } = Sequelize;

const Blog = db.define(
  "blog",
  {
    blog_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  }
);

Blog.hasMany(BlogImage, {
  foreignKey: "blog_id",
});

export default Blog;

