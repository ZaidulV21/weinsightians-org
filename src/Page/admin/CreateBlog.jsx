import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../../api/blogApi";

const CreateBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    author: "",
    image: null,
  });

  const handleChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("content", formData.content);
    form.append("author", formData.author);
    form.append("image", formData.image);

    await createBlog(form);
    navigate("/admin/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="file"
          name="image"
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.files[0] })
          }
          className="w-full border p-3 rounded"
        />

        {formData.image && (
          <img
            src={URL.createObjectURL(formData.image)}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <input
          name="author"
          placeholder="Author"
          onChange={handleChange}
          className="w-full border p-3 rounded"
          required
        />

        <textarea
          name="content"
          placeholder="Content"
          onChange={handleChange}
          className="w-full border p-3 rounded h-40"
          required
        />

        <button
          type="submit"
          className="bg-[#231746] text-white px-6 py-3 rounded"
        >
          Publish
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;
