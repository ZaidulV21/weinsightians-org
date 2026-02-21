// ==========================================
// IMPORTS
// ==========================================

import { StatusCodes } from "http-status-codes";
import Blog from "../models/Blog.js";
import { NotFoundError } from "../errors/customErrors.js";
import slugify from "slugify";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";


// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================
// This runs once when the file loads
// dotenv must already be configured in server.js

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
//   api_key: process.env.CLOUDINARY_API_KEY?.trim(),
//   api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
// });

cloudinary.config({
  cloud_name: "dgj0p6odr",
  api_key: "333219444599415",
  api_secret: "2CzZDSMjTUz-MIhXQs613bHRATI",
})


// ==========================================
// GET ALL BLOGS
// Public Route
// ==========================================
export const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find({}).sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({
    count: blogs.length,
    blogs,
  });
};


// ==========================================
// GET SINGLE BLOG BY SLUG
// Public Route
// ==========================================
export const getBlog = async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug });

  if (!blog) {
    throw new NotFoundError(`No blog with slug: ${slug}`);
  }

  res.status(StatusCodes.OK).json({ blog });
};


// ==========================================
// CREATE BLOG
// Admin Route
// ==========================================
export const createBlog = async (req, res) => {
  const { title, description, content, author } = req.body;

  // Generate slug from title
  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  let imageUrl = null;

  // If image uploaded
  if (req.file) {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "weinsightians_blogs",
    });

    imageUrl = result.secure_url;

    // Delete local file after upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
    msg: "Blog created successfully",
    blog,
  });
};


// ==========================================
// UPDATE BLOG
// Admin Route
// ==========================================
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, author } = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError(`No blog with id: ${id}`);
  }

  let imageUrl = blog.image;

  // If new image uploaded
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "weinsightians_blogs",
    });

    imageUrl = result.secure_url;

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }

  // Update fields
  blog.title = title;
  blog.slug = slugify(title, { lower: true, strict: true });
  blog.description = description;
  blog.content = content;
  blog.author = author;
  blog.image = imageUrl;

  await blog.save();

  res.status(StatusCodes.OK).json({
    msg: "Blog updated successfully",
    blog,
  });
};


// ==========================================
// DELETE BLOG
// Admin Route
// ==========================================
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    throw new NotFoundError(`No blog with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    msg: "Blog deleted successfully",
  });
};