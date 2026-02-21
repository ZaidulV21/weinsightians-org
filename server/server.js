// ==========================================
// IMPORTS
// ==========================================

// IMPORTANT: Must be first — handles async errors automatically
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import "express-async-errors";

import mongoose from "mongoose";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware.js";


// ==========================================
// APP INITIALIZATION
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

// 1️⃣ Morgan logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 2️⃣ Parse JSON body
app.use(express.json());

// 3️⃣ Parse cookies (needed for JWT in cookies)
app.use(cookieParser());

// 4️⃣ CORS CONFIGURATION (VERY IMPORTANT)
// This allows frontend (5173) to talk to backend (6200)
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://weinsightian.tech",
    credentials: true,
  })
);


// ==========================================
// ROUTES
// ==========================================

// Health check
app.get("/api/v1", (req, res) => {
  res.json({ message: "Blogs API is running 🚀" });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Blog routes
app.use("/api/v1/blogs", blogRoutes);


// ==========================================
// ERROR HANDLING (MUST BE LAST)
// ==========================================

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const PORT = process.env.PORT || 6200;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();