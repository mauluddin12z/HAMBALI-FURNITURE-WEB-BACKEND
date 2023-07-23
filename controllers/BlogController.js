import Blog from "../models/BlogModel.js";
import path from "path";
import fs from "fs";
import datetimenow from "../utils/datetimeFormatter.js";
import { Op } from "sequelize";

export const getBlogs = async (req, res) => {
  try {
    const response = await Blog.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getBlogById = async (req, res) => {
  try {
    const response = await Blog.findOne({
      where: { blog_id: req.params.id },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getFilteredBlogs = async (req, res) => {
  let { start, limit } = req.query;
  start = start ? parseInt(start) : null;
  limit = limit ? parseInt(limit) : null;
  try {
    const response = await Blog.findAll({
      order: [["createdAt", "DESC"]],
      offset: start,
      limit: limit,
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching Blogs" });
  }
};

export const getOtherBlogs = async (req, res) => {
  let { blogIdQuery } = req.query;
  try {
    const response = await Blog.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        blog_id: {
          [Op.notLike]: `%${blogIdQuery}%`,
        },
      },
    });

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getBlogByTitle = async (req, res) => {
  let { blogTitleQuery } = req.query;
  try {
    const response = await Blog.findOne({
      where: {
        title: blogTitleQuery,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const pathToBlogImg = "./public/uploads/blogImg/";
export const createBlog = async (req, res) => {
  let fileName = "";
  const { title, description } = req.body;

  const existingBlog = await Blog.findOne({ where: { title } });

  if (existingBlog) {
    return res.status(422).json({ msg: "Blog title already exists" });
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

    image.mv(pathToBlogImg + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Blog.create({
          title: title?.replace(/[^a-zA-Z0-9 ]/g, "") || "",
          description,
          image: fileName,
          imageUrl: `/uploads/blogImg/${fileName}`,
        });
        res.status(201).json({ msg: "Data successfully created" });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const updateBlog = async (req, res) => {
  const getBlogById = await Blog.findOne({
    where: {
      blog_id: req.params.id,
    },
  });
  if (!getBlogById) return res.status(404).json({ msg: "Data not found" });

  const { title, description } = req.body;

  const existingBlog = await Blog.findOne({
    where: {
      title: title?.replace(/[^a-zA-Z0-9 ]/g, "") || "",
      blog_id: {
        [Op.ne]: req.params.id,
      },
    },
  });

  if (existingBlog) {
    return res.status(422).json({ msg: "Blog title already exists" });
  }

  let fileName = "";

  if (req.files == null) {
    fileName = getBlogById.image;
    try {
      await Blog.update(
        {
          title: title?.replace(/[^a-zA-Z0-9 ]/g, "") || getBlogById.title,
          description,
          image: fileName,
          imageUrl: `/uploads/blogImg/${fileName}`,
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
    const allowedType = [".png", ".jpg", ".jpeg", ".jfif"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid Images" });
    if (fileSize > maxFileSize)
      return res.status(422).json({ msg: "Image must be less than 50 MB" });
    if (getBlogById.image) {
      fs.unlinkSync(pathToBlogImg + getBlogById.image);
    }
    image.mv(pathToBlogImg + fileName, async (err) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      try {
        await Blog.update(
          {
            title: title?.replace(/[^a-zA-Z0-9 ]/g, "") || getBlogById.title,
            description,
            image: fileName,
            imageUrl: `/uploads/blogImg/${fileName}`,
          },
          {
            where: {
              blog_id: req.params.id,
            },
          }
        );
        res.status(200).json({ msg: `Data Successfully updated` });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const deleteCategory = async (req, res) => {
  const getBlogById = await Category.findOne({
    where: {
      category_id: req.params.id,
    },
  });
  if (!getBlogById) return res.status(404).json({ msg: "Data not found" });

  try {
    if (getCategoryById.image) {
      fs.unlinkSync(pathToBlogImg + getCategoryById.image);
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
