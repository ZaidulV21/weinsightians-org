// ==========================================
// IMPORTS
// ==========================================

import { StatusCodes } from "http-status-codes";
import Blog from "../models/Blog.js";
import { NotFoundError } from "../errors/customErrors.js";
import slugify from "slugify";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();


// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================
// Reads credentials from environment variables (.env)
// Make sure these are set on Render's Environment settings too
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});


// ==========================================
// HELPER: Upload Buffer to Cloudinary
// ==========================================
// Since we use multer memoryStorage (no disk),
// we stream the file buffer directly to Cloudinary.
// This works on Render and any cloud environment
// because it never touches the local filesystem.
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "weinsightians_blogs" },
      (error, result) => {
        if (error) {
          reject(error); // Will be caught by try/catch in each controller
        } else {
          resolve(result);
        }
      }
    );

    // Convert the buffer into a readable stream and pipe it to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};


// ==========================================
// GET ALL BLOGS
// Public Route — GET /api/v1/blogs
// ==========================================
// Returns all blogs sorted by newest first
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("❌ getAllBlogs error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET SINGLE BLOG BY SLUG
// Public Route — GET /api/v1/blogs/:slug
// ==========================================
// Finds a blog using its URL-friendly slug instead of MongoDB _id
// This makes URLs cleaner e.g. /blogs/my-first-post
export const getBlog = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      throw new NotFoundError(`No blog found with slug: ${slug}`);
    }

    res.status(StatusCodes.OK).json({ blog });
  } catch (error) {
    console.error("❌ getBlog error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// CREATE BLOG
// Admin Route — POST /api/v1/blogs
// ==========================================
// Accepts: title, description, content, author (in req.body)
//          image file (in req.file via multer memoryStorage)
export const createBlog = async (req, res) => {
  try {
    const { title, description, content, author } = req.body;

    // Auto-generate a URL-friendly slug from the title
    // e.g. "My First Blog Post" → "my-first-blog-post"
    const slug = slugify(title, {
      lower: true,   // lowercase everything
      strict: true,  // remove special characters
    });

    let imageUrl = null;

    // If an image was uploaded, stream it to Cloudinary
    // req.file.buffer is available because we use multer memoryStorage
    // We never write to disk — safe for Render and cloud environments
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url; // Cloudinary hosted image URL
    }

    // Save the new blog to MongoDB
    const blog = await Blog.create({
      title,
      slug,
      description,
      content,
      author,
      image: imageUrl,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      msg: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("❌ createBlog error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE BLOG
// Admin Route — PATCH /api/v1/blogs/:id
// ==========================================
// Finds blog by MongoDB _id and updates all fields
// If a new image is provided, it replaces the old Cloudinary URL
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, author } = req.body;

    // First check if the blog exists
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new NotFoundError(`No blog found with id: ${id}`);
    }

    // Default to keeping the existing image URL
    let imageUrl = blog.image;

    // If a new image was uploaded, stream it to Cloudinary
    // and replace the old image URL
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Update all blog fields
    blog.title = title;
    blog.slug = slugify(title, { lower: true, strict: true }); // Regenerate slug from new title
    blog.description = description;
    blog.content = content;
    blog.author = author;
    blog.image = imageUrl;

    // Save updated blog back to MongoDB
    await blog.save();

    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("❌ updateBlog error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE BLOG
// Admin Route — DELETE /api/v1/blogs/:id
// ==========================================
// Finds and deletes a blog by its MongoDB _id
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      throw new NotFoundError(`No blog found with id: ${id}`);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      msg: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteBlog error:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};