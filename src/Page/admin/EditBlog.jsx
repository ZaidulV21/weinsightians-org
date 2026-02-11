import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSingleBlog, updateBlog } from "../../api/blogApi";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    author: "",
  });

  useEffect(() => {
    const fetchBlog = async () => {
      const { data } = await getSingleBlog(id);
      setFormData(data.blog);
    };
    fetchBlog();
  }, [id]);

  const handleChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateBlog(id, formData);
    navigate("/admin/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="author"
          value={formData.author}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="w-full border p-3 rounded h-40"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Update Blog
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
