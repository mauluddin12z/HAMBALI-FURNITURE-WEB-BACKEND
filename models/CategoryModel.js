import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Product from "./ProductModel.js";

const { DataTypes } = Sequelize;

const Category = db.define(
  "category",
  {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category: DataTypes.STRING,
    image: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);
Product.belongsTo(Category, { foreignKey: "category_id" });

export default Category;

(async () => {
  await db.sync();
})();
