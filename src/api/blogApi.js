import axios from "./axiosInstance";

export const getAllBlogs = () => axios.get("/blogs");
export const getSingleBlog = (id) => axios.get(`/blogs/${id}`);
