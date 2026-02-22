import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSingleBlog, updateBlog } from "../../api/blogApi";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

const EditBlog = () => {
  const { slug } = useParams();  // slug comes from the URL e.g. /admin/edit/my-blog-post
  const navigate = useNavigate();

  const [blogId, setBlogId] = useState(null); // ← stores MongoDB _id for the PATCH request

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    author: "",
  });

  const [imageFile, setImageFile] = useState(null);         // New image file selected by user
  const [imagePreview, setImagePreview] = useState(null);   // Preview of new image
  const [existingImage, setExistingImage] = useState(null); // Current image from DB
  const [loading, setLoading] = useState(true);             // Fetching blog data
  const [submitting, setSubmitting] = useState(false);      // Form submission in progress
  const [error, setError] = useState(null);                 // Error message
  const [success, setSuccess] = useState(false);            // Success state

  // ==========================================
  // Fetch existing blog data by SLUG to pre-fill form
  // Then store the _id separately for the update call
  // ==========================================
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // Fetch by slug — matches backend GET /:slug route
        const { data } = await getSingleBlog(slug);
        const blog = data.blog;

        // Store MongoDB _id — needed for PATCH /:id route
        setBlogId(blog._id);

        // Pre-fill form with existing blog data
        setFormData({
          title: blog.title || "",
          description: blog.description || "",
          content: blog.content || "",
          author: blog.author || "",
        });

        // Store existing Cloudinary image URL for preview
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
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file selection — shows local preview before uploading
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ==========================================
  // Handle form submission
  // Uses blogId (_id) for the PATCH request — NOT the slug
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Guard — should never happen but just in case _id didn't load
      if (!blogId) {
        setError("Blog ID not found. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      // Use FormData to support both text fields and optional image file
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("content", formData.content);
      payload.append("author", formData.author);

      // Only append image if user selected a new one
      if (imageFile) {
        payload.append("image", imageFile);
      }

      // Use blogId (_id) NOT slug — matches backend PATCH /:id route
      await updateBlog(blogId, payload);

      setSuccess(true);

      // Redirect to dashboard after short delay
      setTimeout(() => navigate("/admin/dashboard"), 1500);

    } catch (err) {
      // Shows actual backend error — helpful for debugging on mobile too
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

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/dashboard"
            className="text-gray-500 hover:text-indigo-600 transition"
          >
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
            Blog updated successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-8 space-y-6"
        >
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

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the full blog content here..."
              required
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Image
            </label>

            {/* Show new preview or existing image */}
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

            {/* File input styled as upload box */}
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