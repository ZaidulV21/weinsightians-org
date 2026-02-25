import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createBlog } from "../../api/blogApi";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ==========================================
// QUILL TOOLBAR CONFIGURATION
// Defines which formatting options appear
// ==========================================
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header", "font",
  "bold", "italic", "underline", "strike",
  "color", "background",
  "list", "bullet", "indent",
  "align",
  "blockquote", "code-block",
  "link",
];

const CreateBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
  });

  const [content, setContent] = useState("");        // Quill rich text content (HTML)
  const [imageFile, setImageFile] = useState(null);  // Selected image file
  const [imagePreview, setImagePreview] = useState(null); // Image preview URL
  const [submitting, setSubmitting] = useState(false); // Loading state
  const [error, setError] = useState(null);           // Error message

  // Handle text input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle image selection with size validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reject files over 5MB — prevents silent failures on mobile
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Please choose an image under 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate content is not empty
    if (!content || content === "<p><br></p>") {
      setError("Content cannot be empty.");
      setSubmitting(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("author", formData.author);

      // content is HTML string from Quill e.g. "<h1>Hello</h1><p>World</p>"
      form.append("content", content);

      // Only append image if one was selected — never append null
      if (imageFile) {
        form.append("image", imageFile);
      }

      await createBlog(form);
      navigate("/admin/dashboard");

    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Something went wrong";
      setError(`Failed to publish: ${message}`);
      console.error("Create blog error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="text-gray-500 hover:text-indigo-600 transition">
            <FiArrowLeft size={22} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Create Blog</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Image
            </label>

            {imagePreview && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-xl border"
                />
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
              <FiUpload className="text-gray-400 text-2xl mb-2" />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Click to upload image (optional, max 5MB)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Enter blog title"
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="description"
              placeholder="Short description of the blog"
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              name="author"
              placeholder="Author name"
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Content — React Quill Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your blog content here..."
                className="bg-white"
                style={{ minHeight: "300px" }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#231746] hover:bg-indigo-900 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-lg transition"
          >
            {submitting ? "Publishing..." : "Publish"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateBlog;