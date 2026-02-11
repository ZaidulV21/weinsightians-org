import axiosInstance from "./axiosInstance";

// GET all blogs
export const getBlogs = () => axiosInstance.get("/blogs");

// GET single blog
export const getSingleBlog = (id) => axiosInstance.get(`/blogs/${id}`);

// CREATE blog
export const createBlog = (data) =>
  axiosInstance.post("/blogs", data);

// UPDATE blog
export const updateBlog = (id, data) =>
  axiosInstance.patch(`/blogs/${id}`, data);

// DELETE blog
export const deleteBlog = (id) =>
  axiosInstance.delete(`/blogs/${id}`);
