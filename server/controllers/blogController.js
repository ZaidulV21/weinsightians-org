import { StatusCodes } from 'http-status-codes';
import Blog from '../models/Blog.js';
import { NotFoundError } from '../errors/customErrors.js';
import slugify from "slugify";


// GET /api/v1/blogs
// Public route — returns all blogs
export const getAllBlogs = async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({ count: blogs.length, blogs });
};

// GET /api/v1/blogs/:id
// Public route — returns a single blog by ID
// export const getBlog = async (req, res) => {
//     const { id } = req.params;
//     const blog = await Blog.findById(id);

//     // This check is redundant if validateIdParam ran, but keeping for safety
//     if (!blog) {
//         throw new NotFoundError(`no blog with id ${id}`);
//     }

//     res.status(StatusCodes.OK).json({ blog });
// };

export const getBlog = async (req, res) => {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
        throw new NotFoundError(`no blog with slug ${slug}`);
    }

    res.status(StatusCodes.OK).json({ blog });
};


// POST /api/v1/blogs
// Admin-only — creates a new blog post
// export const createBlog = async (req, res) => {
//     const { title, description, content, author } = req.body;

//     const blog = await Blog.create({
//         title,
//         description,
//         content,
//         author,
//     });

//     res.status(StatusCodes.CREATED).json({ msg: 'blog created', blog });
// };
export const createBlog = async (req, res) => {
  const { title, description, content, author } = req.body;

  const slug = slugify(title, {
    lower: true,
    strict: true,
  });

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const blog = await Blog.create({
    title,
    slug,
    description,
    content,
    author,
    image,
  });

  res.status(StatusCodes.CREATED).json({ msg: "blog created", blog });
};



// PATCH /api/v1/blogs/:id
// Admin-only — updates an existing blog
export const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, description, content, author } = req.body;

    const blog = await Blog.findByIdAndUpdate(
        id,
        { title, slug: slugify(title, { lower: true, strict: true }), description, content, author },
        { new: true, runValidators: true }
    );

    if (!blog) {
        throw new NotFoundError(`no blog with id ${id}`);
    }

    res.status(StatusCodes.OK).json({ msg: 'blog updated', blog });
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
