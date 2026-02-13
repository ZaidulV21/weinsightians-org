// We import express-async-errors FIRST — it patches express to handle async errors automatically
import 'express-async-errors';

import * as dotenv from "dotenv";
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { StatusCodes } from "http-status-codes";

import path from "path";
import { fileURLToPath } from "url";
// Route imports
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

// Middleware imports
import notFoundMiddleware from './middlewares/notFoundMiddleware.js';
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';
import corsOptions from './utils/corsUtils.js';


const app = express();

// =========================================
// MIDDLEWARE SETUP
// =========================================

// Use morgan for request logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Parse JSON bodies
app.use(express.json());

// Parse cookies — this is essential for our cookie-based JWT auth
app.use(cookieParser());

// Simple CORS setup 
// app.use(cors(corsOptions));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================================
// ROUTES
// =========================================

// Health check route
app.get('/api/v1', (req, res) => {
    res.json({ msg: 'Blogs API is running' });
});

// Auth routes — login, logout
app.use('/api/v1/auth', authRoutes);

// Blog routes — CRUD operations
app.use('/api/v1/blogs', blogRoutes);


// Serve static files from the React frontend build
app.use(express.static(path.join(import.meta.dirname, "public")));
app.get("*", (req, res) => {
  res
    .status(StatusCodes.OK)
    .sendFile(path.join(import.meta.dirname, "public", "index.html"));
});

// =========================================
// ERROR HANDLING
// =========================================

// Catch-all for routes that don't exist
app.use(notFoundMiddleware);

// Central error handler — must be last
app.use(errorHandlerMiddleware);

// =========================================
// DATABASE CONNECTION & SERVER START
// =========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB Atlas connected successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}...`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
