import BlogImage from "../models/BlogImageModel.js";
import Blog from "../models/BlogModel.js";
import path from "path";
import fs from "fs";
import datetimenow from "../utils/datetimeFormatter.js";
import { v4 as uuidv4 } from "uuid";
import { Op, Sequelize } from "sequelize";

export const getBlogs = async (req, res) => {
  try {
    const response = await Blog.findAll({
      include: [
        {
          model: BlogImage,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getBlogImages = async (req, res) => {
  try {
    const response = await BlogImage.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getBlogImageById = async (req, res) => {
  try {
    const response = await BlogImage.findOne({
      where: { blogImage_id: req.params.id },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const response = await Blog.findOne({
      include: [{ model: BlogImage }],
      where: { blog_id: req.params.id },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getFilteredBlogs = async (req, res) => {
  let { start, limit, searchQuery } = req.query;
  start = start ? parseInt(start) : null;
  limit = limit ? parseInt(limit) : null;
  const searchFilter = searchQuery
    ? {
      [Op.or]: [
        {
          description: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
        {
          title: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      ],
    }
    : {};

  try {
    const response = await Blog.findAll({
      include: [{ model: BlogImage }],
      order: [["createdAt", "DESC"]],
      offset: start,
      limit: limit,
      where: {
        ...searchFilter,
      },
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
      include: [{ model: BlogImage }],
      order: [["createdAt", "DESC"]],
      where: {
        blog_id: {
          [Op.not]: blogIdQuery,
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
      include: [{ model: BlogImage }],
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
  let { title, description } = req.body;
  title = title?.replace(/[^a-zA-Z0-9 -]/g, "") || "";
  try {
    const existingBlog = await Blog.findOne({ where: { title } });

    if (existingBlog) {
      return res.status(422).json({ msg: "Blog title already exists" });
    }
    if (!req.files || !req.files.image) {
      return res.status(422).json({ msg: "No image files uploaded" });
    }

    const blog = await Blog.create({
      title,
      description,
    });
    const blogId = blog.blog_id;
    const images = Array.isArray(req.files.image)
      ? req.files.image
      : [req.files.image];
    const allowedTypes = [".png", ".jpg", ".jpeg", ".jfif"];
    const maxFileSize = 50 * 1024 * 1024;

    for (const image of images) {
      const ext = path.extname(image.name);
      const fileName = datetimenow() + "-" + uuidv4() + ext;

      if (!allowedTypes.includes(ext.toLowerCase()))
        return res.status(422).json({ msg: "Invalid File" });
      if (image.data.length > maxFileSize)
        return res.status(422).json({ msg: "Image must be less than 50 MB" });
      image.mv(pathToBlogImg + fileName, async (err) => {
        if (err) {
          return res.status(500).json({ msg: err.message });
        }
        try {
          await BlogImage.create({
            image: fileName,
            imageUrl: `/uploads/blogImg/${fileName}`,
            blog_id: blogId,
          });
        } catch (error) {
          console.log(error.message);
        }
      });
    }
    res.status(201).json({ msg: "Data successfully created" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const updateBlog = async (req, res) => {
  const getBlogById = await Blog.findOne({
    where: {
      blog_id: req.params.id,
    },
  });
  if (!getBlogById) return res.status(404).json({ msg: "Data not found" });

  let { title, description } = req.body;
  title = title?.replace(/[^a-zA-Z0-9 -]/g, "") || "";

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
          title,
          description,
        },
        {
          where: {
            blog_id: req.params.id,
          },
        }
      );
      res.status(200).json({ msg: `Data successfully updated` });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    try {
      const getBlogImageById = await BlogImage.findAll({
        where: {
          blog_id: req.params.id,
        },
      });
      await Blog.update(
        {
          title,
          description,
        },
        {
          where: {
            blog_id: req.params.id,
          },
        }
      );
      const images = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];
      const allowedTypes = [".png", ".jpg", ".jpeg", ".jfif"];
      const maxFileSize = 50 * 1024 * 1024;

      for (const image of images) {
        const ext = path.extname(image.name);
        const fileName = datetimenow() + "-" + uuidv4() + ext;

        if (!allowedTypes.includes(ext.toLowerCase())) {
          return res.status(422).json({ msg: "Invalid File" });
        }

        if (image.data.length > maxFileSize) {
          return res.status(422).json({ msg: "Image must be less than 50 MB" });
        }

        image.mv(pathToBlogImg + fileName, async (err) => {
          if (err) {
            return res.status(500).json({ msg: err.message });
          }
          await BlogImage.create({
            image: fileName,
            imageUrl: `/uploads/blogImg/${fileName}`,
            blog_id: req.params.id,
          });
        });
      }
      for (const blogImage of getBlogImageById) {
        fs.unlinkSync(pathToBlogImg + blogImage.image);
        await BlogImage.destroy({
          where: {
            blogImage_id: blogImage.blogImage_id,
          },
        });
      }
      res.status(200).json({ msg: `Data Successfully updated` });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
};

export const deleteBlog = async (req, res) => {
  const blogId = req.params.id;

  try {
    const getBlogById = await Blog.findOne({
      include: [{ model: BlogImage }],
      where: { blog_id: blogId },
    });
    if (!getBlogById) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    console.log(getBlogById?.blog_images)
    for (const blogImage of getBlogById?.blog_images) {
      fs.unlinkSync(pathToBlogImg + blogImage.image);
    }

    await BlogImage.destroy({ where: { blog_id: blogId } });
    await Blog.destroy({ where: { blog_id: blogId } });
    res.status(200).json({ msg: "Blog successfully deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
