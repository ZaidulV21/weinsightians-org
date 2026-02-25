import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSingleBlog, updateBlog } from "../../api/blogApi";
import { FiArrowLeft, FiUpload } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ==========================================
// QUILL TOOLBAR CONFIGURATION
// Same toolbar as CreateBlog for consistency
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

const EditBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blogId, setBlogId] = useState(null);          // MongoDB _id for PATCH request

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
  });

  const [content, setContent] = useState("");           // Quill rich text content
  const [imageFile, setImageFile] = useState(null);     // New image file
  const [imagePreview, setImagePreview] = useState(null); // New image preview
  const [existingImage, setExistingImage] = useState(null); // Current image from DB
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ==========================================
  // Fetch existing blog data by SLUG
  // Store _id separately for the PATCH call
  // ==========================================
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data } = await getSingleBlog(slug);
        const blog = data.blog;

        // Store MongoDB _id for update call
        setBlogId(blog._id);

        // Pre-fill text fields
        setFormData({
          title: blog.title || "",
          description: blog.description || "",
          author: blog.author || "",
        });

        // Pre-fill Quill editor with existing HTML content
        setContent(blog.content || "");

        // Store existing image
        setExistingImage(blog.image || null);

      } catch (err) {
        setError("Failed to load blog. Please try again.");
        console.error("Fetch blog error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Handle text input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle image selection with size validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Please choose an image under 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  // ==========================================
  // Handle form submission
  // Uses blogId (_id) for PATCH — NOT slug
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate content
    if (!content || content === "<p><br></p>") {
      setError("Content cannot be empty.");
      setSubmitting(false);
      return;
    }

    try {
      if (!blogId) {
        setError("Blog ID not found. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("author", formData.author);

      // content is HTML string from Quill
      payload.append("content", content);

      // Only append image if a new one was selected
      if (imageFile) {
        payload.append("image", imageFile);
      }

      // Use _id for update — matches backend PATCH /:id route
      await updateBlog(blogId, payload);

      setSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1500);

    } catch (err) {
      const message = err?.response?.data?.msg || err?.message || "Unknown error";
      setError(`Failed to update blog: ${message}`);
      console.error("Update blog error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="text-gray-500 hover:text-indigo-600 transition">
            <FiArrowLeft size={22} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Blog</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            ✅ Blog updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Image
            </label>

            {(imagePreview || existingImage) && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">
                  {imagePreview ? "New image preview:" : "Current image:"}
                </p>
                <img
                  src={imagePreview || existingImage}
                  alt="Blog preview"
                  className="w-full h-56 object-cover rounded-xl border"
                />
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
              <FiUpload className="text-gray-400 text-2xl mb-2" />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Click to upload a new image (optional)"}
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
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
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
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of the blog"
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
              value={formData.author}
              onChange={handleChange}
              placeholder="Author name"
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-lg transition"
          >
            {submitting ? "Updating..." : "Update Blog"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditBlog;