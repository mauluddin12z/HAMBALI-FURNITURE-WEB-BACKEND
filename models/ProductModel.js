import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Product = db.define(
  "product",
  {
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: DataTypes.STRING,
    image: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    dimensions: DataTypes.STRING,
    material: DataTypes.STRING,
    color: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
  }
);

export default Product;