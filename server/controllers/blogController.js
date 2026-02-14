import { StatusCodes } from 'http-status-codes';
import Blog from '../models/Blog.js';
import { NotFoundError } from '../errors/customErrors.js';
import slugify from "slugify";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";


// GET /api/v1/blogs
// Public route — returns all blogs
export const getAllBlogs = async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({ count: blogs.length, blogs });
};

export const getBlog = async (req, res) => {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
        throw new NotFoundError(`no blog with slug ${slug}`);
    }

    res.status(StatusCodes.OK).json({ blog });
};



export const createBlog = async (req, res) => {
  const { title, description, content, author } = req.body;

  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  let imageUrl = null;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "weinsightians_blogs",
    });

    imageUrl = result.secure_url;

    // delete local file after upload
    fs.unlinkSync(req.file.path);
  }

  const blog = await Blog.create({
    title,
    slug,
    description,
    content,
    author,
    image: imageUrl,
  });

  res.status(StatusCodes.CREATED).json({
    msg: "blog created",
    blog,
  });
};



// PATCH /api/v1/blogs/:id
// Admin-only — updates an existing blog
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, author } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError(`no blog with id ${id}`);
  }

  let imageUrl = blog.image;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "weinsightians_blogs",
    });

    imageUrl = result.secure_url;
    fs.unlinkSync(req.file.path);
  }

  blog.title = title;
  blog.slug = slugify(title, { lower: true, strict: true });
  blog.description = description;
  blog.content = content;
  blog.author = author;
  blog.image = imageUrl;

  await blog.save();

  res.status(StatusCodes.OK).json({
    msg: "blog updated",
    blog,
  });
};


// DELETE /api/v1/blogs/:id
// Admin-only — deletes a blog
export const deleteBlog = async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
        throw new NotFoundError(`no blog with id ${id}`);
    }

    res.status(StatusCodes.OK).json({ msg: 'blog deleted' });
};
