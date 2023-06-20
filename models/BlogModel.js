import { Sequelize } from "sequelize";
import db from "../config/Database.js";

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
    image: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    description: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  }
);

export default Blog;

(async () => {
  await db.sync();
})();
