import Category from "../models/CategoryModel.js";
import path from "path";
import fs from "fs";
import datetimenow from "../utils/datetimeFormatter.js";
import { Op } from "sequelize";

export const getCategories = async (req, res) => {
  try {
    const response = await Category.findAll();
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getCategoryById = async (req, res) => {
  try {
    const response = await Category.findOne({
      category_id: req.params.id,
    });
    req.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const pathToCategoryImage = "./public/uploads/categoryImg/";
export const createCategory = async (req, res) => {
  let fileName = "";
  const category = req.body.category;
  if (req.files !== null) {
    const image = req.files.image;
    const fileSize = image.data.length;
    const maxFileSize = 50 * 1024 * 1024;
    const ext = path.extname(image.name);
    fileName = datetimenow() + image.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg", ".pdf"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid File" });
    if (fileSize > maxFileSize)
      return res.status(422).json({ msg: "Image must be less than 50 MB" });

    image.mv(pathToCategoryImage + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Category.create({
          category,
          image: fileName,
          imageUrl: `/uploads/categoryImg/${fileName}`,
        });
        res.status(201).json({ msg: "Data successfully created" });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const updateCategory = async (req, res) => {
  const getCategoryById = await Category.findOne({
    where: {
      category_id: req.params.id,
    },
  });
  if (!getCategoryById) return res.status(404).json({ msg: "Data not found" });

  const category = req.body.category;

  let fileName = "";

  if (req.files == null) {
    fileName = getCategoryById.image;
    try {
      await Category.update(
        {
          category,
          image: fileName,
          imageUrl: `/uploads/categoryImg/${fileName}`,
        },
        {
          where: {
            category_id: req.params.id,
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
    const allowedType = [".png", ".jpg", ".jpeg", ".pdf"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid Images" });
    if (fileSize > maxFileSize)
      return res.status(422).json({ msg: "Image must be less than 50 MB" });
    if (getCategoryById.image) {
      fs.unlinkSync(pathToCategoryImage + getCategoryById.image);
    }
    image.mv(pathToCategoryImage + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Category.update(
          {
            category,
            image: fileName,
            imageUrl: `/uploads/categoryImg/${fileName}`,
          },
          {
            where: {
              category_id: req.params.id,
            },
          }
        );
        res.status(200).json({ msg: `Date Successfully updated` });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const deleteCategory = async (req, res) => {
  const getCategoryById = await Category.findOne({
    where: {
      category_id: req.params.id,
    },
  });
  if (!getCategoryById) return res.status(404).json({ msg: "Data not found" });

  try {
    if (getCategoryById.image) {
      fs.unlinkSync(pathToCategoryImage + getCategoryById.image);
    }
    await Category.destroy({
      where: {
        category_id: req.params.id,
      },
    });
    res.status(200).json({ msg: `Data successfully deleted` });
  } catch (error) {
    console.log(error.message);
  }
};
