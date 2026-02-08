import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a blog title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            trim: true,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        content: {
            type: String,
            required: [true, 'Please provide blog content'],
        },
        // Author is a simple string — not tied to authentication.
        // This is intentional: author can be anyone until and unless he has admin credentials.
        author: {
            type: String,
            required: [true, 'Please provide an author name'],
            trim: true,
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);

export default Blog;
