// ==========================================
// BLOG CONTROLLER
// Handles all blog-related routes (CRUD)
// ==========================================

// ==========================================
// IMPORTS
// ==========================================
import { StatusCodes } from "http-status-codes";
import Blog from "../models/Blog.js";
import { NotFoundError } from "../errors/customErrors.js";
import slugify from "slugify";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// CLOUDINARY CONFIGURATION
// This runs once when the file loads
// Make sure CLOUDINARY env vars are set in Render
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

// ==========================================
// GET ALL BLOGS
// Public Route
// ==========================================
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      count: blogs.length,
      blogs,
    });
  } catch (err) {
    console.error("Get all blogs error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// ==========================================
// GET SINGLE BLOG BY SLUG
// Public Route
// ==========================================
export const getBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      throw new NotFoundError(`No blog found with slug: ${slug}`);
    }

    res.status(StatusCodes.OK).json({ blog });
  } catch (err) {
    console.error("Get blog error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// ==========================================
// CREATE BLOG
// Admin Route
// ==========================================
export const createBlog = async (req, res) => {
  try {
    const { title, description, content, author } = req.body;

    // Validate required fields
    if (!title || !description || !content || !author) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "All fields are required" });
    }

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "weinsightians_blogs",
        });
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Image upload failed" });
      } finally {
        // Delete local file after upload
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // Create blog document
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
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// ==========================================
// UPDATE BLOG
// Admin Route
// ==========================================
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, author } = req.body;

    // Find existing blog
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError(`No blog found with id: ${id}`);
    }

    let imageUrl = blog.image;

    // Upload new image if provided
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "weinsightians_blogs",
        });
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Image upload failed" });
      } finally {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // Update fields
    blog.title = title || blog.title;
    blog.slug = title ? slugify(title, { lower: true, strict: true }) : blog.slug;
    blog.description = description || blog.description;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.image = imageUrl;

    await blog.save();

    res.status(StatusCodes.OK).json({
      msg: "Blog updated successfully",
      blog,
    });
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

// ==========================================
// DELETE BLOG
// Admin Route
// ==========================================
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      throw new NotFoundError(`No blog found with id: ${id}`);
    }

    res.status(StatusCodes.OK).json({
      msg: "Blog deleted successfully",
    });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};