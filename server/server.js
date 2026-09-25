// ==========================================
// IMPORTS
// ==========================================

import dns from "dns";
import dotenv from "dotenv";
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
// DNS CONFIGURATION
// ==========================================

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);


// ==========================================
// ENVIRONMENT
// ==========================================

dotenv.config();

console.log("VERSION 2 CORS ACTIVE");


// ==========================================
// APP INITIALIZATION
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://weinsightian.tech"
    ],
    credentials: true,
  })
);


// ==========================================
// ROUTES
// ==========================================

app.get("/api/v1", (req, res) => {
  res.json({ message: "Blogs API is running 🚀" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blogs", blogRoutes);


// ==========================================
// ERROR HANDLING
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