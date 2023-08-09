import Category from "../models/CategoryModel.js";
import Product from "../models/ProductModel.js";
import path from "path";
import fs from "fs";
import datetimenow from "../utils/datetimeFormatter.js";
import { Op, Sequelize } from "sequelize";

export const getProducts = async (req, res) => {
  try {
    const response = await Product.findAll({
      include: [{ model: Category, attributes: ["category"] }],
      order: [["product_name", "ASC"]],
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getFilteredProducts = async (req, res) => {
  let { start, limit, categoryQuery, searchQuery } = req.query;
  start = start ? parseInt(start) : null;
  limit = limit ? parseInt(limit) : null;
  categoryQuery = categoryQuery ? parseInt(categoryQuery) : null;
  const categoryFilter = categoryQuery ? { category_id: categoryQuery } : {};
  const searchFilter = searchQuery
    ? {
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
        {
          "$category.category$": {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      ],
    }
    : {};

  try {
    const response = await Product.findAll({
      include: [{ model: Category, attributes: ["category"] }],
      order: [["product_name", "ASC"]],
      offset: start,
      limit: limit,
      where: {
        ...categoryFilter,
        ...searchFilter,
      },
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductSearchResults = async (req, res) => {
  let { start, limit, searchQuery } = req.query;
  start = start ? parseInt(start) : null;
  limit = limit ? parseInt(limit) : null;
  const searchFilter = searchQuery
    ? {
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
        {
          "$category.category$": {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      ],
    }
    : {};

  try {
    const response = await Product.findAll({
      include: [{ model: Category, attributes: ["category"] }],
      order: [["product_name", "ASC"]],
      offset: start,
      limit: limit,
      where: {
        ...searchFilter,
      },
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getRelatedProducts = async (req, res) => {
  let { categoryQuery, productNameQuery } = req.query;
  categoryQuery = categoryQuery ? parseInt(categoryQuery) : null;
  const categoryFilter = categoryQuery ? { category_id: categoryQuery } : {};

  if (productNameQuery) {
    categoryFilter.product_name = {
      [Op.not]: productNameQuery,
    };
  }

  try {
    const response = await Product.findAll({
      include: [{ model: Category, attributes: ["category"] }],
      order: Sequelize.literal("RAND()"),
      where: categoryFilter,
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const response = await Product.findOne({
      where: {
        product_id: req.params.id,
      },
      include: [{ model: Category, attributes: ["category"] }],
      order: [["product_name", "ASC"]],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getProductByName = async (req, res) => {
  let { productNameQuery } = req.query;
  try {
    const response = await Product.findOne({
      where: {
        product_name: productNameQuery,
      },
      include: [{ model: Category, attributes: ["category"] }],
      order: [["product_name", "ASC"]],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const pathToProductImage = "./public/uploads/productsImg/";

export const createProduct = async (req, res) => {
  let fileName = "";
  const {
    product_name,
    description,
    price,
    dimensions,
    material,
    color,
    category_id,
  } = req.body;

  const existingProduct = await Product.findOne({ where: { product_name } });
  if (existingProduct) {
    return res.status(422).json({ msg: "Product name already exists" });
  }

  if (!req.files || !req.files.image) {
    return res.status(400).json({ msg: "No image files uploaded" });
  }

  if (req.files !== null) {
    const image = req.files.image;
    const fileSize = image.data.length;
    const maxFileSize = 50 * 1024 * 1024;
    const ext = path.extname(image.name);
    fileName = datetimenow() + image.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg", ".jfif"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid File" });
    if (fileSize > maxFileSize)
      return res.status(422).json({ msg: "Image must be less than 50 MB" });

    image.mv(pathToProductImage + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Product.create({
          product_name: product_name?.replace(/[^a-zA-Z0-9 ]/g, "") || "",
          image: fileName,
          imageUrl: `/uploads/productsImg/${fileName}`,
          description,
          price,
          dimensions,
          material,
          color,
          category_id,
        });
        res.status(201).json({ msg: "Data successfully created" });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const updateProduct = async (req, res) => {
  const getProductById = await Product.findOne({
    where: {
      product_id: req.params.id,
    },
  });
  if (!getProductById) return res.status(404).json({ msg: "Data not found" });

  const {
    product_name,
    description,
    price,
    dimensions,
    material,
    color,
    category_id,
  } = req.body;

  const existingProduct = await Product.findOne({
    where: {
      product_name:
        product_name?.replace(/[^a-zA-Z0-9 ]/g, "") ||
        getProductById.product_name,
      product_id: {
        [Op.ne]: req.params.id,
      },
    },
  });
  if (existingProduct) {
    return res.status(422).json({ msg: "Product name already exists" });
  }
  let fileName = "";

  if (req.files == null) {
    fileName = getProductById.image;
    try {
      await Product.update(
        {
          product_name:
            product_name?.replace(/[^a-zA-Z0-9 ]/g, "") ||
            getProductById.product_name,
          description,
          price,
          dimensions,
          material,
          color,
          category_id,
          image: fileName,
          imageUrl: `/uploads/productsImg/${fileName}`,
        },
        {
          where: {
            product_id: req.params.id,
          },
        }
      );
      res.status(200).json({ msg: `Data successfully updated` });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    const image = req.files.image;
    const fileSize = image.data.length;
    const maxFileSize = 50 * 1024 * 1024;
    const ext = path.extname(image.name);
    fileName = datetimenow() + image.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg", ".jfif"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid Images" });
    if (fileSize > maxFileSize)
      return res.status(422).json({ msg: "Image must be less than 50 MB" });
    if (getProductById.image) {
      fs.unlinkSync(pathToProductImage + getProductById.image);
    }
    image.mv(pathToProductImage + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Product.update(
          {
            product_name: product_name?.replace(/[^a-zA-Z0-9 ]/g, "") || "",
            description,
            price,
            dimensions,
            material,
            color,
            category_id,
            image: fileName,
            imageUrl: `/uploads/productsImg/${fileName}`,
          },
          {
            where: {
              product_id: req.params.id,
            },
          }
        );
        res.status(200).json({ msg: `Data successfully updated` });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const deleteProduct = async (req, res) => {
  const getProductById = await Product.findOne({
    where: {
      product_id: req.params.id,
    },
  });
  if (!getProductById) return res.status(404).json({ msg: "Data not found" });
  try {
    if (getProductById.image) {
      fs.unlinkSync(pathToProductImage + getProductById.image);
    }
    await Product.destroy({
      where: {
        product_id: req.params.id,
      },
    });
    res.status(200).json({ msg: `Data successfully deleted` });
  } catch (error) {
    console.log(error.message);
  }
};
