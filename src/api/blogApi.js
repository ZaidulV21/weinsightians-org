import axiosInstance from "./axiosInstance";

// ==========================================
// PUBLIC
// ==========================================

// GET all published blogs. No session required, drafts are never included.
export const getBlogs = () => axiosInstance.get("/blogs");

// GET single published blog by SLUG (not id)
export const getSingleBlog = (slug) => axiosInstance.get(`/blogs/${slug}`);

// ==========================================
// ADMIN
// ==========================================

// Every post, drafts included, plus real published/draft counts for the dashboard.
export const getAdminBlogs = () => axiosInstance.get("/blogs/admin/all");

// A post by slug regardless of status, so a draft can be opened and edited.
export const getAdminBlogBySlug = (slug) => axiosInstance.get(`/blogs/admin/slug/${slug}`);

// CREATE blog - multipart/form-data for image support
export const createBlog = (data) =>
  axiosInstance.post("/blogs", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// UPDATE blog - multipart/form-data for image support
export const updateBlog = (id, data) =>
  axiosInstance.patch(`/blogs/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Publish or unpublish without touching the rest of the post. The server keeps
// the slug and the original publish date either way.
export const setBlogStatus = (id, status) =>
  axiosInstance.patch(`/blogs/${id}`, { status });

// DELETE blog
export const deleteBlog = (id) => axiosInstance.delete(`/blogs/${id}`);
